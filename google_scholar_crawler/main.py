#!/usr/bin/env python3
"""抓取 Google Scholar 个人主页，输出站点用的引用统计 JSON。

Google 对 GitHub Actions 的机房 IP 一律返回 403，所以 CI 里应通过 SCHOLAR_PROXY_URL
指向 cloudflare-worker/ 部署出来的代理取数；本机 IP 没被封，不设该变量时直接抓原站。

输出供站点的 assets/js/google_scholar_citations.js 消费：

    results/gs_data.json            完整数据，含 citedby 与每篇论文的 citations
    results/gs_data_shieldsio.json  shields.io 徽章数据
"""

from __future__ import annotations

import html
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone

PROFILE_URL = "https://scholar.google.com/citations?hl=en&user={sid}&cstart={start}&pagesize=100"
USER_AGENT = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
              "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36")
ROW_RE = re.compile(r'<tr class="gsc_a_tr">(.*?)</tr>', re.S)
PUB_ID_RE = re.compile(r"citation_for_view=([^&\"]+)")
TITLE_RE = re.compile(r'class="gsc_a_at"[^>]*>(.*?)</a>', re.S)
GRAY_RE = re.compile(r'<div class="gs_gray">(.*?)</div>', re.S)
CITES_RE = re.compile(r'class="gsc_a_ac[^"]*"[^>]*>(.*?)</a>', re.S)
CITES_URL_RE = re.compile(r'<a href="([^"]*?cites=[^"]*?)"[^>]*class="gsc_a_ac')
YEAR_RE = re.compile(r'class="gsc_a_h[^"]*"[^>]*>(\d{4})<')
STATS_RE = re.compile(r'class="gsc_rsb_std">(\d+)<')
NAME_RE = re.compile(r'id="gsc_prf_in">(.*?)</div>', re.S)
TRAILING_YEAR_RE = re.compile(r",\s*\d{4}\s*$")


def get(url: str, attempts: int = 4) -> str:
    """带重试的 GET。Google 偶发 429/503，退避后往往能成功。"""
    last: Exception | None = None
    for i in range(attempts):
        try:
            request = urllib.request.Request(url, headers={
                "User-Agent": USER_AGENT,
                "Accept-Language": "en-US,en;q=0.9",
            })
            with urllib.request.urlopen(request, timeout=30) as resp:
                return resp.read().decode("utf-8", "ignore")
        except (urllib.error.URLError, OSError) as exc:
            last = exc
            print(f"第 {i + 1} 次请求失败：{exc}", file=sys.stderr)
            time.sleep(5 * (i + 1))
    raise SystemExit(f"请求失败：{last}")


def text(raw: str) -> str:
    return html.unescape(re.sub(r"<[^>]+>", "", raw)).strip()


def parse_publications(page: str) -> list[dict]:
    publications = []
    for row in ROW_RE.findall(page):
        pid = PUB_ID_RE.search(row)
        title = TITLE_RE.search(row)
        if not pid or not title:
            continue
        gray = [text(g) for g in GRAY_RE.findall(row)]
        cites = CITES_RE.search(row)
        cites_url = CITES_URL_RE.search(row)
        year = YEAR_RE.search(row)
        publications.append({
            "id": html.unescape(pid.group(1)),
            "title": text(title.group(1)),
            "authors": gray[0] if gray else "",
            # 第二行是「会议/期刊, 年份」，年份另有字段，这里只留发表信息
            "venue": TRAILING_YEAR_RE.sub("", gray[1]).strip() if len(gray) > 1 else "",
            "year": year.group(1) if year else "",
            "citations": int(text(cites.group(1)) or 0) if cites else 0,
            "citedby_url": html.unescape(cites_url.group(1)) if cites_url else "",
        })
    return publications


def scrape(scholar_id: str) -> dict:
    page = get(PROFILE_URL.format(sid=scholar_id, start=0))
    if "gsc_rsb_std" not in page:
        raise SystemExit("页面里没有统计表格，多半是被 Google 拦截或 ID 有误")

    stats = [int(n) for n in STATS_RE.findall(page)]
    name = NAME_RE.search(page)

    publications = parse_publications(page)
    seen = {p["id"] for p in publications}
    # 个人主页一页最多 100 条，超过就翻页
    while publications and len(publications) % 100 == 0:
        more = [p for p in parse_publications(get(PROFILE_URL.format(sid=scholar_id, start=len(publications))))
                if p["id"] not in seen]
        if not more:
            break
        seen.update(p["id"] for p in more)
        publications.extend(more)

    return {
        "scholar_id": scholar_id,
        "name": text(name.group(1)) if name else "",
        "citedby": stats[0] if stats else 0,
        "citedby5y": stats[1] if len(stats) > 1 else 0,
        "hindex": stats[2] if len(stats) > 2 else 0,
        "hindex5y": stats[3] if len(stats) > 3 else 0,
        "i10index": stats[4] if len(stats) > 4 else 0,
        "i10index5y": stats[5] if len(stats) > 5 else 0,
        "publications": publications,
        "updated": datetime.now(timezone.utc).isoformat(),
        "stale": False,
    }


def via_proxy(proxy_url: str, scholar_id: str) -> dict:
    """从 Cloudflare Worker 取数，绕开 Google 对机房 IP 的封锁。"""
    parts = urllib.parse.urlsplit(proxy_url)
    query = dict(urllib.parse.parse_qsl(parts.query))
    query.setdefault("user", scholar_id)
    query["fresh"] = "1"
    url = urllib.parse.urlunsplit(parts._replace(query=urllib.parse.urlencode(query)))

    data = json.loads(get(url))
    if data.get("error"):
        raise SystemExit(f"代理返回错误：{data['error']}")
    if not data.get("publications"):
        raise SystemExit("代理没有返回任何论文，拒绝写入空数据")
    return data


def main() -> int:
    scholar_id = os.environ.get("GOOGLE_SCHOLAR_ID", "").strip()
    if not scholar_id:
        raise SystemExit("缺少环境变量 GOOGLE_SCHOLAR_ID（仓库 Settings → Secrets 里配置）")

    proxy_url = os.environ.get("SCHOLAR_PROXY_URL", "").strip()
    author = via_proxy(proxy_url, scholar_id) if proxy_url else scrape(scholar_id)

    print(json.dumps({k: v for k, v in author.items() if k != "publications"}, indent=2, ensure_ascii=False))
    print(f"论文 {len(author['publications'])} 篇")

    os.makedirs("results", exist_ok=True)
    with open("results/gs_data.json", "w", encoding="utf-8") as f:
        json.dump(author, f, ensure_ascii=False)
    with open("results/gs_data_shieldsio.json", "w", encoding="utf-8") as f:
        json.dump({"schemaVersion": 1, "label": "citations", "message": str(author["citedby"])},
                  f, ensure_ascii=False)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
