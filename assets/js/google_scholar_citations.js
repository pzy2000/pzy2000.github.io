/**
 * Google Scholar 引用数与论文列表。
 *
 * 数据来自 cloudflare-worker/ 部署出来的代理（浏览器直连 scholar.google.com 会被 CORS 拦下），
 * 代理不可达时回退到 GitHub Action 推送的 gs_data.json 快照，两者都失败则沿用 localStorage 里的旧值。
 */
(function () {
    const config = window.scholarCitations || {};
    const CACHE_KEY = 'googleScholarCitations';
    const CACHE_LIFETIME = 10 * 60 * 1000;

    const badgeElements = Array.from(document.querySelectorAll('[data-scholar-pub-id], [data-scholar-title]'));
    const listContainer = document.getElementById('publication-list');
    const summaryContainer = document.getElementById('scholar-summary');
    const refreshButton = document.getElementById('scholar-refresh');
    if (!badgeElements.length && !listContainer && !summaryContainer) return;

    function normalizeTitle(title) {
        return String(title || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    }

    function profileUrl() {
        return config.profileUrl || 'https://scholar.google.com/citations?user=kfiyUgIAAAAJ';
    }

    /** 统一 Worker 的新结构与 google-scholar-stats 分支上遗留的旧结构。 */
    function normalizePayload(raw) {
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
                    venue: item.venue || bib.venue || bib.citation || '',
                    year: String(item.year || item.pub_year || bib.pub_year || ''),
                    citations: Number(item.citations != null ? item.citations : item.num_citations) || 0,
                    citedby_url: item.citedby_url || ''
                };
            });
        }
        if (!publications.length) return null;

        publications.sort((a, b) => b.citations - a.citations);
        return {
            citedby: Number(raw.citedby) || 0,
            hindex: Number(raw.hindex) || 0,
            i10index: Number(raw.i10index) || 0,
            updated: raw.updated || '',
            stale: Boolean(raw.stale),
            publications: publications
        };
    }

    function readCache() {
        try {
            const cached = JSON.parse(localStorage.getItem(CACHE_KEY));
            if (cached && cached.payload && Number.isFinite(cached.fetchedAt)) return cached;
        } catch (_) {
            // 本地存储不可用或数据损坏，直接走网络。
        }
        return null;
    }

    function writeCache(payload) {
        try {
            localStorage.setItem(CACHE_KEY, JSON.stringify({payload: payload, fetchedAt: Date.now()}));
        } catch (_) {
            // 缓存只是加速，失败不影响功能。
        }
    }

    async function fetchJson(url) {
        const response = await fetch(url, {cache: 'no-store'});
        if (!response.ok) throw new Error(`Request failed (${response.status})`);
        const data = await response.json();
        if (data && data.error) throw new Error(data.error);
        return data;
    }

    async function fetchPayload(fresh) {
        const errors = [];
        if (config.workerUrl) {
            try {
                const url = new URL(config.workerUrl);
                if (fresh) url.searchParams.set('fresh', '1');
                const payload = normalizePayload(await fetchJson(url.toString()));
                if (payload) return {payload: payload, source: 'worker'};
                errors.push('worker returned no publications');
            } catch (error) {
                errors.push(String(error));
            }
        }
        if (config.fallbackUrl) {
            try {
                const url = new URL(config.fallbackUrl);
                url.searchParams.set('t', String(Date.now()));
                const payload = normalizePayload(await fetchJson(url.toString()));
                if (payload) return {payload: payload, source: 'snapshot'};
                errors.push('snapshot returned no publications');
            } catch (error) {
                errors.push(String(error));
            }
        }
        throw new Error(errors.join('; ') || 'No citation source configured');
    }

    function citationBadge(publication) {
        const link = document.createElement('a');
        link.className = 'badge badge-pill badge-publication badge-info';
        link.href = publication.citedby_url || profileUrl();
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        const icon = document.createElement('i');
        icon.className = 'ai ai-google-scholar';
        icon.setAttribute('aria-hidden', 'true');
        link.appendChild(icon);
        const count = publication.citations;
        link.appendChild(document.createTextNode(` ${count.toLocaleString()} citation${count === 1 ? '' : 's'}`));
        return link;
    }

    function renderBadges(index) {
        badgeElements.forEach(element => {
            const id = (element.getAttribute('data-scholar-pub-id') || '').trim();
            const title = normalizeTitle(element.getAttribute('data-scholar-title'));
            // Scholar 合并条目时 author_pub_id 会变，所以再用标题兜底一次
            const publication = index.byId.get(id) || index.byTitle.get(title);
            if (!publication) return;
            element.textContent = '';
            element.appendChild(citationBadge(publication));
        });
    }

    function buildIndex(publications) {
        const byId = new Map();
        const byTitle = new Map();
        publications.forEach(publication => {
            if (publication.id) byId.set(publication.id, publication);
            const title = normalizeTitle(publication.title);
            if (title && !byTitle.has(title)) byTitle.set(title, publication);
        });
        return {byId: byId, byTitle: byTitle};
    }

    /** 站内已有完整条目的论文，不再自动补一遍。 */
    function curatedKeys() {
        const ids = new Set();
        const titles = new Set();
        document.querySelectorAll('#publication-list .publication-entry:not(.scholar-auto-entry)').forEach(entry => {
            const badge = entry.querySelector('[data-scholar-pub-id], [data-scholar-title]');
            if (!badge) return;
            const id = (badge.getAttribute('data-scholar-pub-id') || '').trim();
            if (id) ids.add(id);
            const title = normalizeTitle(badge.getAttribute('data-scholar-title'));
            if (title) titles.add(title);
        });
        return {ids: ids, titles: titles};
    }

    function yearGroup(year) {
        const existing = listContainer.querySelector(`.publication-year-group[data-year="${year}"]`);
        if (existing) return existing;

        const group = document.createElement('div');
        group.className = 'publication-year-group';
        group.setAttribute('data-year', year);
        const heading = document.createElement('h2');
        heading.className = 'pt-4';
        heading.id = `year-${year}`;
        heading.textContent = year;
        const items = document.createElement('div');
        items.className = 'publication-year-items my-0 p-0 bg-white shadow-sm rounded-xl';
        group.appendChild(heading);
        group.appendChild(items);

        // 年份倒序插入
        const groups = Array.from(listContainer.querySelectorAll('.publication-year-group'));
        const next = groups.find(other => Number(other.getAttribute('data-year')) < Number(year));
        if (next) listContainer.insertBefore(group, next);
        else listContainer.appendChild(group);

        addYearNavLink(year);
        return group;
    }

    function addYearNavLink(year) {
        const nav = document.getElementById('navbar-year');
        if (!nav || nav.querySelector(`a[href="#year-${year}"]`)) return;
        const link = document.createElement('a');
        link.className = 'nav-link d-block';
        link.href = `#year-${year}`;
        link.textContent = year;
        const links = Array.from(nav.querySelectorAll('a.nav-link'));
        const next = links.find(other => Number(other.textContent.trim()) < Number(year));
        if (next) nav.insertBefore(link, next);
        else nav.appendChild(link);
    }

    function autoEntry(publication) {
        const entry = document.createElement('div');
        entry.className = 'publication-entry scholar-auto-entry';
        entry.setAttribute('data-scholar-pub-id', publication.id);

        const row = document.createElement('div');
        row.className = 'row no-gutters border-gray';
        const column = document.createElement('div');
        column.className = 'col px-3 px-md-4 py-3';

        const title = document.createElement('h6');
        title.className = 'mt-0 mb-1 font-weight-normal';
        title.textContent = publication.title;
        column.appendChild(title);

        if (publication.authors) {
            const authors = document.createElement('p');
            authors.className = 'mt-0 mb-0 small';
            authors.textContent = publication.authors;
            column.appendChild(authors);
        }

        const meta = document.createElement('p');
        meta.className = 'mt-0 mb-0 small';
        if (publication.venue) {
            const venue = document.createElement('i');
            venue.textContent = publication.venue;
            meta.appendChild(venue);
            meta.appendChild(document.createTextNode(' '));
        }
        if (publication.year) meta.appendChild(document.createTextNode(`${publication.year} `));
        meta.appendChild(citationBadge(publication));
        column.appendChild(meta);

        const links = document.createElement('p');
        links.className = 'small pb-0 mb-0 lh-125 text-muted abstract-links';
        const scholarLink = document.createElement('a');
        scholarLink.target = '_blank';
        scholarLink.rel = 'noopener noreferrer';
        scholarLink.href = publication.id
            ? `https://scholar.google.com/citations?view_op=view_citation&hl=en&user=${encodeURIComponent(publication.id.split(':')[0])}&citation_for_view=${encodeURIComponent(publication.id)}`
            : profileUrl();
        scholarLink.textContent = '[Google Scholar]';
        links.appendChild(scholarLink);
        column.appendChild(links);

        row.appendChild(column);
        entry.appendChild(row);
        return entry;
    }

    /** 条目增减后重算分隔线与卡片圆角。 */
    function normalizeGroup(items) {
        const entries = Array.from(items.querySelectorAll(':scope > .publication-entry'));
        entries.forEach((entry, index) => {
            const isLast = index === entries.length - 1;
            entry.querySelectorAll('.row').forEach(row => {
                row.classList.toggle('border-bottom', !isLast);
            });
            entry.querySelectorAll('.d-md-none, .d-md-none > div').forEach(element => {
                element.classList.toggle('rounded-xl-bottom', isLast);
            });
        });
    }

    function renderAutoEntries(publications) {
        if (!listContainer || !config.showAll) return;
        const curated = curatedKeys();
        const wanted = publications.filter(publication => {
            if (curated.ids.has(publication.id)) return false;
            return !curated.titles.has(normalizeTitle(publication.title));
        });

        // 整体重建，刷新后 Scholar 上删掉的条目会一并消失
        listContainer.querySelectorAll('.scholar-auto-entry').forEach(entry => entry.remove());
        wanted.forEach(publication => {
            const year = /^\d{4}$/.test(publication.year) ? publication.year : 'Preprints';
            yearGroup(year).querySelector('.publication-year-items').appendChild(autoEntry(publication));
        });

        // 年份卡片空了说明那一年只剩自动条目且已被移除
        listContainer.querySelectorAll('.publication-year-group').forEach(group => {
            const items = group.querySelector('.publication-year-items');
            if (!items || items.querySelector('.publication-entry')) return;
            const nav = document.getElementById('navbar-year');
            const link = nav && nav.querySelector(`a[href="#year-${group.getAttribute('data-year')}"]`);
            if (link) link.remove();
            group.remove();
        });
        listContainer.querySelectorAll('.publication-year-items').forEach(normalizeGroup);
    }

    function relativeTime(iso) {
        const timestamp = Date.parse(iso);
        if (!Number.isFinite(timestamp)) return '';
        const minutes = Math.max(0, Math.round((Date.now() - timestamp) / 60000));
        if (minutes < 1) return 'just now';
        if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
        const hours = Math.round(minutes / 60);
        if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
        const days = Math.round(hours / 24);
        return `${days} day${days === 1 ? '' : 's'} ago`;
    }

    function renderSummary(payload, note) {
        if (!summaryContainer) return;
        const stats = document.createElement('span');
        const parts = [
            `<a href="${profileUrl()}" target="_blank" rel="noopener noreferrer">${payload.citedby.toLocaleString()} citations</a>`,
            `h-index ${payload.hindex}`,
            `i10-index ${payload.i10index}`
        ];
        const updated = relativeTime(payload.updated);
        if (updated) parts.push(`updated ${updated}`);
        stats.innerHTML = parts.join(' &middot; ');
        summaryContainer.textContent = '';
        summaryContainer.appendChild(stats);
        if (note) {
            const hint = document.createElement('span');
            hint.className = 'd-block d-sm-inline text-muted';
            hint.innerHTML = ` &middot; ${note}`;
            summaryContainer.appendChild(hint);
        }
    }

    function setBusy(busy) {
        if (!refreshButton) return;
        refreshButton.disabled = busy;
        const icon = refreshButton.querySelector('i');
        if (icon) icon.classList.toggle('fa-spin', busy);
    }

    function render(payload, note) {
        renderBadges(buildIndex(payload.publications));
        renderAutoEntries(payload.publications);
        renderSummary(payload, note);
    }

    let lastPayload = null;
    const cached = readCache();
    if (cached) {
        lastPayload = cached.payload;
        render(cached.payload, '');
    }

    async function refresh(fresh) {
        setBusy(true);
        try {
            const result = await fetchPayload(fresh);
            lastPayload = result.payload;
            writeCache(result.payload);
            let note = '';
            if (result.source === 'snapshot') note = 'live fetch unavailable, showing the daily snapshot';
            else if (result.payload.stale) note = 'Google Scholar is rate-limiting, showing the last successful fetch';
            render(result.payload, note);
        } catch (error) {
            console.error('Error fetching Google Scholar data:', error);
            if (lastPayload) render(lastPayload, 'refresh failed, showing the last known numbers');
            else if (summaryContainer) summaryContainer.textContent = 'Citation data is temporarily unavailable.';
        } finally {
            setBusy(false);
        }
    }

    if (refreshButton) {
        refreshButton.addEventListener('click', () => refresh(true));
    }

    const isCacheFresh = cached && Date.now() - cached.fetchedAt < CACHE_LIFETIME;
    if (!isCacheFresh) refresh(false);
})();
