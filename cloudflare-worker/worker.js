/**
 * Google Scholar 代理：经 ScraperAPI 抓个人主页，解析成带 CORS 头的 JSON。
 *
 * 浏览器拿不到 scholar.google.com 的响应（没有 CORS 头），Cloudflare / GitHub Actions
 * 的机房 IP 又会被 Google 以 403 挡掉，所以必须经住宅代理（SCRAPER_API_KEY）中转。
 *
 * GET /              优先回缓存；过期则后台刷新，首屏不堵 ScraperAPI
 * GET /?fresh=1      手动刷新，跳过缓存，但仍受 MIN_ORIGIN_INTERVAL 保护
 * scheduled cron     定时预热 KV，避免冷启动
 */

const PROFILE_URL = 'https://scholar.google.com/citations?hl=en&user={sid}&cstart={start}&pagesize=100';
const FALLBACK_URL =
  'https://raw.githubusercontent.com/pzy2000/pzy2000.github.io/google-scholar-stats/gs_data.json';
const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

const CACHE_TTL = 600; // 正常缓存 10 分钟
const MIN_ORIGIN_INTERVAL = 60 * 1000; // 强刷也不允许 60 秒内重复回源
const STALE_TTL = 86400; // 回源失败时可回吐的旧数据上限
const DEFAULT_ALLOWED_ORIGINS = ['https://pzy2000.github.io', 'http://localhost:4000', 'http://127.0.0.1:4000'];
const DEFAULT_SCHOLAR_ID = 'kfiyUgIAAAAJ';

const ROW_RE = /<tr class="gsc_a_tr">([\s\S]*?)<\/tr>/g;
const PUB_ID_RE = /citation_for_view=([^&"]+)/;
const TITLE_RE = /class="gsc_a_at"[^>]*>([\s\S]*?)<\/a>/;
const GRAY_RE = /<div class="gs_gray">([\s\S]*?)<\/div>/g;
const CITES_RE = /class="gsc_a_ac[^"]*"[^>]*>([\s\S]*?)<\/a>/;
const CITES_URL_RE = /<a href="([^"]*?cites=[^"]*?)"[^>]*class="gsc_a_ac/;
const YEAR_RE = /class="gsc_a_h[^"]*"[^>]*>(\d{4})</;
const STATS_RE = /class="gsc_rsb_std">(\d+)</g;
const NAME_RE = /id="gsc_prf_in">([\s\S]*?)<\/div>/;

function decodeEntities(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&hellip;/g, '\u2026')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
}

function text(raw) {
  return decodeEntities(raw.replace(/<[^>]+>/g, '')).trim();
}

function allowedOrigin(request, env) {
  const configured = (env.ALLOWED_ORIGINS || '').split(',').map(o => o.trim()).filter(Boolean);
  const allowList = configured.length ? configured : DEFAULT_ALLOWED_ORIGINS;
  const origin = request.headers.get('Origin');
  if (origin && allowList.includes(origin)) return origin;
  return allowList[0];
}

function jsonResponse(payload, request, env, extraHeaders = {}) {
  // 有缓存可回吐时即使带 error 说明也返回 200，前端当成 stale 数据处理
  const hardFail = Boolean(payload.error) && !payload.publications;
  return new Response(JSON.stringify(payload), {
    status: hardFail ? 502 : 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': allowedOrigin(request, env),
      Vary: 'Origin',
      ...extraHeaders
    }
  });
}

/**
 * Google 封了 Cloudflare 出口 IP，直连一律 403。
 * 优先 SerpAPI（Google Scholar Author 专用接口，最稳）；
 * 其次 ScraperAPI / ScrapingBee 住宅代理抓 HTML。
 * 密钥用 `npx wrangler secret put SERPAPI_KEY` 等注入，不进仓库。
 */
function proxiedUrl(target, env) {
  if (env.SCRAPER_API_KEY) {
    // Scholar 属于 ScraperAPI 的 protected domain；免费档通常不够，需 ultra_premium
    return (
      'https://api.scraperapi.com/?' +
      new URLSearchParams({
        api_key: env.SCRAPER_API_KEY,
        url: target,
        render: 'false',
        ultra_premium: 'true'
      }).toString()
    );
  }
  if (env.SCRAPINGBEE_API_KEY) {
    return (
      'https://app.scrapingbee.com/api/v1/?' +
      new URLSearchParams({
        api_key: env.SCRAPINGBEE_API_KEY,
        url: target,
        render_js: 'false',
        stealth_proxy: 'true'
      }).toString()
    );
  }
  return null;
}

async function scrapeViaSerpApi(scholarId, env) {
  const articles = [];
  let start = 0;
  let authorMeta = null;
  let metricsTable = [];

  while (true) {
    const url =
      'https://serpapi.com/search.json?' +
      new URLSearchParams({
        engine: 'google_scholar_author',
        author_id: scholarId,
        hl: 'en',
        num: '100',
        start: String(start),
        api_key: env.SERPAPI_KEY
      }).toString();

    const response = await fetch(url, {cf: {cacheTtl: 0}});
    if (!response.ok) {
      const hint = await response.text().then(t => t.slice(0, 300)).catch(() => '');
      throw new Error(`SerpAPI returned ${response.status}: ${hint}`);
    }
    const data = await response.json();
    if (data.error) throw new Error(`SerpAPI error: ${data.error}`);

    if (!authorMeta && data.author) authorMeta = data.author;
    if (!metricsTable.length && data.cited_by && Array.isArray(data.cited_by.table)) {
      metricsTable = data.cited_by.table;
    }
    const batch = data.articles || [];
    for (const article of batch) {
      articles.push({
        id: article.citation_id || '',
        title: article.title || '',
        authors: article.authors || '',
        venue: article.publication || '',
        year: String(article.year || ''),
        citations: Number((article.cited_by && article.cited_by.value) || 0),
        citedby_url: (article.cited_by && article.cited_by.link) || ''
      });
    }

    const next = data.serpapi_pagination && data.serpapi_pagination.next;
    if (!next || !batch.length) break;
    start += batch.length;
    if (start > 500) break;
  }

  // SerpAPI：cited_by.table = [{citations:{all}}, {h_index:{all}}, {i10_index:{all}}]
  const pick = (key) => {
    const row = metricsTable.find(r => r[key]);
    return row && row[key] ? Number(row[key].all) || 0 : 0;
  };

  return {
    scholar_id: scholarId,
    name: (authorMeta && authorMeta.name) || '',
    citedby: pick('citations'),
    citedby5y: 0,
    hindex: pick('h_index'),
    hindex5y: 0,
    i10index: pick('i10_index'),
    i10index5y: 0,
    publications: articles,
    updated: new Date().toISOString(),
    stale: false,
    source: 'serpapi'
  };
}

async function fetchProfile(scholarId, start, env) {
  const target = PROFILE_URL.replace('{sid}', scholarId).replace('{start}', String(start));
  const via = proxiedUrl(target, env);
  if (!via) {
    throw new Error(
      'No scrape backend configured. Prefer: npx wrangler secret put SERPAPI_KEY ' +
        '(or SCRAPER_API_KEY / SCRAPINGBEE_API_KEY)'
    );
  }

  const response = await fetch(via, {
    headers: {
      'User-Agent': USER_AGENT,
      'Accept-Language': 'en-US,en;q=0.9',
      Accept: 'text/html,application/xhtml+xml'
    },
    cf: {cacheTtl: 0, cacheEverything: false}
  });
  if (!response.ok) {
    const hint = await response.text().then(t => t.slice(0, 200)).catch(() => '');
    throw new Error(`Scrape proxy returned ${response.status}: ${hint}`);
  }
  const body = await response.text();
  if (!body.includes('gsc_rsb_std')) {
    throw new Error('Scholar page has no stats table (proxy blocked or wrong ID)');
  }
  return body;
}

function parsePublications(page) {
  const publications = [];
  ROW_RE.lastIndex = 0;
  let row;
  while ((row = ROW_RE.exec(page)) !== null) {
    const chunk = row[1];
    const id = PUB_ID_RE.exec(chunk);
    const title = TITLE_RE.exec(chunk);
    if (!id || !title) continue;

    GRAY_RE.lastIndex = 0;
    const gray = [];
    let grayMatch;
    while ((grayMatch = GRAY_RE.exec(chunk)) !== null) gray.push(text(grayMatch[1]));

    const cites = CITES_RE.exec(chunk);
    const citesUrl = CITES_URL_RE.exec(chunk);
    const year = YEAR_RE.exec(chunk);

    publications.push({
      id: decodeEntities(id[1]),
      title: text(title[1]),
      authors: gray[0] || '',
      venue: (gray[1] || '').replace(/,\s*\d{4}\s*$/, '').trim(),
      year: year ? year[1] : '',
      citations: cites ? Number(text(cites[1])) || 0 : 0,
      citedby_url: citesUrl ? decodeEntities(citesUrl[1]) : ''
    });
  }
  return publications;
}

async function scrape(scholarId, env) {
  // SerpAPI 是 Scholar 专用接口，比 HTML 代理稳得多；有 key 就优先走它
  if (env.SERPAPI_KEY) {
    return scrapeViaSerpApi(scholarId, env);
  }

  let page = await fetchProfile(scholarId, 0, env);
  const publications = parsePublications(page);

  STATS_RE.lastIndex = 0;
  const stats = [];
  let stat;
  while ((stat = STATS_RE.exec(page)) !== null) stats.push(Number(stat[1]));
  const name = NAME_RE.exec(page);

  const seen = new Set(publications.map(p => p.id));
  while (publications.length % 100 === 0 && publications.length > 0) {
    page = await fetchProfile(scholarId, publications.length, env);
    const more = parsePublications(page).filter(p => !seen.has(p.id));
    if (!more.length) break;
    more.forEach(p => seen.add(p.id));
    publications.push(...more);
  }

  return {
    scholar_id: scholarId,
    name: name ? text(name[1]) : '',
    citedby: stats[0] || 0,
    citedby5y: stats[1] || 0,
    hindex: stats[2] || 0,
    hindex5y: stats[3] || 0,
    i10index: stats[4] || 0,
    i10index5y: stats[5] || 0,
    publications,
    updated: new Date().toISOString(),
    stale: false,
    source: 'html_proxy'
  };
}

/** 把分支上的旧/新 schema 统一成 Worker 输出格式，冷启动时秒开。 */
function normalizeSnapshot(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const source = raw.publications;
  let publications = [];
  if (Array.isArray(source)) {
    publications = source.map(item => ({
      id: item.id || item.author_pub_id || '',
      title: item.title || '',
      authors: item.authors || '',
      venue: item.venue || '',
      year: String(item.year || item.pub_year || ''),
      citations: Number(item.citations != null ? item.citations : item.num_citations) || 0,
      citedby_url: item.citedby_url || ''
    }));
  } else if (source && typeof source === 'object') {
    publications = Object.keys(source).map(key => {
      const item = source[key] || {};
      const bib = item.bib || {};
      return {
        id: item.author_pub_id || item.id || key,
        title: item.title || bib.title || '',
        authors: item.authors || bib.author || '',
        venue: item.venue || bib.venue || '',
        year: String(item.year || item.pub_year || bib.pub_year || ''),
        citations: Number(item.citations != null ? item.citations : item.num_citations) || 0,
        citedby_url: item.citedby_url || ''
      };
    });
  }
  if (!publications.length) return null;
  return {
    scholar_id: raw.scholar_id || DEFAULT_SCHOLAR_ID,
    name: raw.name || '',
    citedby: Number(raw.citedby) || 0,
    citedby5y: Number(raw.citedby5y) || 0,
    hindex: Number(raw.hindex) || 0,
    hindex5y: Number(raw.hindex5y) || 0,
    i10index: Number(raw.i10index) || 0,
    i10index5y: Number(raw.i10index5y) || 0,
    publications,
    updated: raw.updated || new Date().toISOString(),
    stale: true,
    source: 'snapshot'
  };
}

async function seedFromSnapshot() {
  const response = await fetch(`${FALLBACK_URL}?t=${Date.now()}`, {cf: {cacheTtl: 0}});
  if (!response.ok) return null;
  return normalizeSnapshot(await response.json());
}

let memoryCache = null;

async function readCache(env, cacheKey) {
  if (memoryCache) return memoryCache;
  if (env.SCHOLAR_CACHE) {
    const stored = await env.SCHOLAR_CACHE.get('profile', 'json');
    if (stored) {
      memoryCache = stored;
      return stored;
    }
  }
  const hit = await caches.default.match(cacheKey);
  if (!hit) return null;
  try {
    memoryCache = await hit.json();
    return memoryCache;
  } catch (_) {
    return null;
  }
}

async function writeCache(env, cacheKey, data) {
  memoryCache = data;
  if (env.SCHOLAR_CACHE) {
    await env.SCHOLAR_CACHE.put('profile', JSON.stringify(data), {expirationTtl: STALE_TTL});
    return;
  }
  await caches.default.put(
    cacheKey,
    new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': `public, max-age=${STALE_TTL}`
      }
    })
  );
}

async function refreshInBackground(env, cacheKey, scholarId) {
  try {
    const data = await scrape(scholarId, env);
    await writeCache(env, cacheKey, data);
    return data;
  } catch (error) {
    const message = String(error);
    console.error('background refresh failed', message);
    if (env.SCHOLAR_CACHE) {
      await env.SCHOLAR_CACHE.put('last_error', JSON.stringify({
        at: new Date().toISOString(),
        error: message
      }), {expirationTtl: STALE_TTL});
    }
    throw error;
  }
}

function cacheKeyFor(scholarId) {
  return new Request(`https://scholar-proxy.internal/${encodeURIComponent(scholarId)}`, {method: 'GET'});
}

/** 自检：逐个试不同的 ScraperAPI 参数组合，定位是账号问题还是 Scholar 专属限制。 */
async function selfTest(index, env) {
  const scholarUrl = `https://scholar.google.com/citations?hl=en&user=${env.GOOGLE_SCHOLAR_ID || DEFAULT_SCHOLAR_ID}&pagesize=100`;
  const build = (params) =>
    'https://api.scraperapi.com/?' +
    new URLSearchParams({api_key: env.SCRAPER_API_KEY, ...params}).toString();

  const variants = [
    {name: 'account sanity check (httpbin)', url: build({url: 'https://httpbin.org/ip'})},
    {name: 'scholar plain', url: build({url: scholarUrl})},
    {name: 'scholar premium', url: build({url: scholarUrl, premium: 'true'})},
    {name: 'scholar ultra_premium', url: build({url: scholarUrl, ultra_premium: 'true'})},
    {name: 'scholar premium + country_code=us', url: build({url: scholarUrl, premium: 'true', country_code: 'us'})},
    {name: 'scraperapi account info', url: `https://api.scraperapi.com/account?api_key=${env.SCRAPER_API_KEY}`}
  ];

  const variant = variants[Number(index)];
  if (!variant) return {error: `index out of range (0..${variants.length - 1})`, variants: variants.map(v => v.name)};

  try {
    const response = await fetch(variant.url, {cf: {cacheTtl: 0}});
    const body = await response.text();
    return {
      name: variant.name,
      status: response.status,
      bytes: body.length,
      hasScholarRows: body.includes('gsc_a_tr'),
      snippet: body.slice(0, 300).replace(/\s+/g, ' ')
    };
  } catch (error) {
    return {name: variant.name, error: String(error)};
  }
}

async function handleGet(request, env, ctx) {
  const url = new URL(request.url);
  const selfTestIndex = url.searchParams.get('selftest');
  if (selfTestIndex !== null) {
    if (!env.SCRAPER_API_KEY) return jsonResponse({error: 'no SCRAPER_API_KEY'}, request, env);
    return jsonResponse({selftest: await selfTest(selfTestIndex, env)}, request, env);
  }
  if (url.searchParams.get('debug') === '1') {
    const lastError = env.SCHOLAR_CACHE ? await env.SCHOLAR_CACHE.get('last_error', 'json') : null;
    const hasKey = Boolean(env.SCRAPER_API_KEY || env.SCRAPINGBEE_API_KEY || env.SERPAPI_KEY);
    return jsonResponse({
      has_scraper_key: Boolean(env.SCRAPER_API_KEY),
      has_serpapi_key: Boolean(env.SERPAPI_KEY),
      has_scrapingbee_key: Boolean(env.SCRAPINGBEE_API_KEY),
      key_prefix: env.SERPAPI_KEY
        ? String(env.SERPAPI_KEY).slice(0, 4) + '…'
        : env.SCRAPER_API_KEY
          ? String(env.SCRAPER_API_KEY).slice(0, 4) + '…'
          : null,
      last_error: lastError,
      cache: await readCache(env, cacheKeyFor(env.GOOGLE_SCHOLAR_ID || DEFAULT_SCHOLAR_ID))
        .then(c => c && {citedby: c.citedby, updated: c.updated, stale: c.stale, source: c.source, pubs: (c.publications || []).length})
    }, request, env);
  }
  const scholarId = (url.searchParams.get('user') || env.GOOGLE_SCHOLAR_ID || DEFAULT_SCHOLAR_ID).trim();
  const wantsFresh = url.searchParams.get('fresh') === '1';
  const cacheKey = cacheKeyFor(scholarId);
  let cachedPayload = await readCache(env, cacheKey);

  // KV 空时先灌一份快照，保证首屏秒开，再后台用 ScraperAPI 刷真数据
  if (!cachedPayload) {
    const seeded = await seedFromSnapshot();
    if (seeded) {
      cachedPayload = seeded;
      ctx.waitUntil(writeCache(env, cacheKey, seeded));
    }
  }

  const cacheAge = cachedPayload && cachedPayload.updated ? Date.now() - Date.parse(cachedPayload.updated) : Infinity;
  const cacheUsable = cachedPayload && !cachedPayload.stale && cacheAge < CACHE_TTL * 1000;

  if (!wantsFresh && cacheUsable) {
    return jsonResponse({...cachedPayload, cached: true}, request, env);
  }

  if (wantsFresh && cachedPayload && cacheAge < MIN_ORIGIN_INTERVAL) {
    return jsonResponse({...cachedPayload, cached: true, throttled: true}, request, env);
  }

  // 有旧数据就立刻返回，ScraperAPI 在后台刷（免费档常要十几秒，同步等会超时）
  if (cachedPayload && !wantsFresh) {
    ctx.waitUntil(
      refreshInBackground(env, cacheKey, scholarId).catch(error => {
        console.error('background refresh failed', error);
      })
    );
    return jsonResponse({...cachedPayload, cached: true, refreshing: true}, request, env);
  }

  try {
    const data = await scrape(scholarId, env);
    ctx.waitUntil(writeCache(env, cacheKey, data));
    return jsonResponse({...data, cached: false}, request, env);
  } catch (error) {
    const message = String(error);
    console.error('scrape failed', message);
    if (cachedPayload && cacheAge < STALE_TTL * 1000) {
      return jsonResponse({
        ...cachedPayload,
        cached: true,
        stale: true,
        error: message,
        error_message: message
      }, request, env);
    }
    return jsonResponse({error: message}, request, env);
  }
}

export default {
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': allowedOrigin(request, env),
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Max-Age': '86400',
          Vary: 'Origin'
        }
      });
    }
    if (request.method !== 'GET') {
      return jsonResponse({error: 'Only GET is supported'}, request, env);
    }
    return handleGet(request, env, ctx);
  },

  // 每 30 分钟预热一次，避免 KV 过期后首次请求去同步撞 ScraperAPI
  async scheduled(event, env, ctx) {
    const scholarId = env.GOOGLE_SCHOLAR_ID || DEFAULT_SCHOLAR_ID;
    const cacheKey = cacheKeyFor(scholarId);
    ctx.waitUntil(
      refreshInBackground(env, cacheKey, scholarId).catch(async error => {
        console.error('scheduled refresh failed', error);
        const existing = await readCache(env, cacheKey);
        if (!existing) {
          const seeded = await seedFromSnapshot();
          if (seeded) await writeCache(env, cacheKey, seeded);
        }
      })
    );
  }
};
