#!/usr/bin/env python3
"""抓取 Google Scholar 个人主页，输出站点用的引用统计 JSON。

原来用 scholarly，它在 GitHub Actions 上会被 Google 挡住并反复换代理重试，
表现为任务跑满 6 小时或秒退失败。这里直接请求个人主页 HTML 解析，只用标准库，
失败就带非零退出码结束，不会把空数据推到 google-scholar-stats 分支。

输出与旧版一致，供 _includes/fetch_google_scholar_stats.html 消费：

    results/gs_data.json            完整数据，含 citedby 与每篇论文的 num_citations
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
import urllib.request
from datetime import datetime

PROFILE_URL = "https://scholar.google.com/citations?hl=en&user={sid}&cstart={start}&pagesize=100"
USER_AGENT = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
              "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36")
ROW_RE = re.compile(r'<tr class="gsc_a_tr">(.*?)</tr>', re.S)
PUB_ID_RE = re.compile(r"citation_for_view=([^&\"]+)")
TITLE_RE = re.compile(r'class="gsc_a_at"[^>]*>(.*?)</a>', re.S)
CITES_RE = re.compile(r'class="gsc_a_ac[^"]*"[^>]*>(.*?)</a>', re.S)
YEAR_RE = re.compile(r'class="gsc_a_h[^"]*"[^>]*>(\d{4})<')
STATS_RE = re.compile(r'class="gsc_rsb_std">(\d+)<')
NAME_RE = re.compile(r'id="gsc_prf_in">(.*?)</div>', re.S)


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
    raise SystemExit(f"Google Scholar 请求失败：{last}")


def text(raw: str) -> str:
    return html.unescape(re.sub(r"<[^>]+>", "", raw)).strip()


def parse_publications(page: str) -> dict[str, dict]:
    pubs: dict[str, dict] = {}
    for row in ROW_RE.findall(page):
        pid = PUB_ID_RE.search(row)
        title = TITLE_RE.search(row)
        if not pid or not title:
            continue
        cites = CITES_RE.search(row)
        year = YEAR_RE.search(row)
        pubs[html.unescape(pid.group(1))] = {
            "author_pub_id": html.unescape(pid.group(1)),
            "title": text(title.group(1)),
            "num_citations": int(text(cites.group(1)) or 0) if cites else 0,
            "pub_year": year.group(1) if year else "",
        }
    return pubs


def main() -> int:
    scholar_id = os.environ.get("GOOGLE_SCHOLAR_ID", "").strip()
    if not scholar_id:
        raise SystemExit("缺少环境变量 GOOGLE_SCHOLAR_ID（仓库 Settings → Secrets 里配置）")

    page = get(PROFILE_URL.format(sid=scholar_id, start=0))
    if "gsc_rsb_std" not in page:
        raise SystemExit("页面里没有统计表格，多半是被 Google 拦截或 ID 有误")

    stats = [int(n) for n in STATS_RE.findall(page)]
    name = NAME_RE.search(page)

    publications = parse_publications(page)
    # 个人主页一页最多 100 条，超过就翻页
    while len(publications) % 100 == 0 and publications:
        more = parse_publications(get(PROFILE_URL.format(sid=scholar_id, start=len(publications))))
        if not set(more) - set(publications):
            break
        publications.update(more)

    author = {
        "scholar_id": scholar_id,
        "name": text(name.group(1)) if name else "",
        "citedby": stats[0] if stats else 0,
        "citedby5y": stats[1] if len(stats) > 1 else 0,
        "hindex": stats[2] if len(stats) > 2 else 0,
        "hindex5y": stats[3] if len(stats) > 3 else 0,
        "i10index": stats[4] if len(stats) > 4 else 0,
        "i10index5y": stats[5] if len(stats) > 5 else 0,
        "publications": publications,
        "updated": str(datetime.now()),
    }
    print(json.dumps({k: v for k, v in author.items() if k != "publications"}, indent=2, ensure_ascii=False))
    print(f"论文 {len(publications)} 篇")

    os.makedirs("results", exist_ok=True)
    with open("results/gs_data.json", "w", encoding="utf-8") as f:
        json.dump(author, f, ensure_ascii=False)
    with open("results/gs_data_shieldsio.json", "w", encoding="utf-8") as f:
        json.dump({"schemaVersion": 1, "label": "citations", "message": str(author["citedby"])},
                  f, ensure_ascii=False)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
