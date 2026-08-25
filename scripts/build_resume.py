#!/usr/bin/env python3
"""从个人主页生成简历 PDF。

内容主要解析自 _pages/about-zh.md，简历专属字段（联系方式、导师、实习时间、
科研成果矩阵等）来自 _data/resume_config.yml。

    python3 scripts/build_resume.py
    python3 scripts/build_resume.py --html-only
    python3 scripts/build_resume.py --out /tmp/foo.pdf --no-fit
"""

from __future__ import annotations

import argparse
import base64
import html
import mimetypes
import re
import sys
from dataclasses import dataclass, field
from pathlib import Path

import yaml

ROOT = Path(__file__).resolve().parent.parent
SOURCE_MD = ROOT / "_pages" / "about-zh.md"
RESUME_YML = ROOT / "_data" / "resume_config.yml"
CSS_FILE = Path(__file__).resolve().parent / "resume.css"

# A4 在 96dpi 下的 CSS 像素尺寸，Chromium 打印时按此换算
PAGE_W_PX = 210 / 25.4 * 96
PAGE_H_PX = 297 / 25.4 * 96


# --------------------------------------------------------------------------
# 文本工具
# --------------------------------------------------------------------------

def strip_html(text: str) -> str:
    return re.sub(r"<[^>]+>", "", text).strip()


def strip_badges(text: str) -> str:
    """去掉 [![Stars](img)](link) 这类徽章。"""
    return re.sub(r"\[!\[[^\]]*\]\([^)]*\)\]\([^)]*\)", "", text)


def md_inline(text: str, kw_class: str = "kw") -> str:
    """把纯文本里的行内 markdown 转成 HTML，链接只保留文字。"""
    text = strip_badges(text)
    text = re.sub(r"\[([^\]]+)\]\([^)]*\)", r"\1", text)
    text = text.replace("\\#", "#")
    out = html.escape(text)
    out = re.sub(r"\*\*(.+?)\*\*", rf'<strong class="{kw_class}">\1</strong>', out)
    out = re.sub(r"`(.+?)`", r"<code>\1</code>", out)
    out = re.sub(r"(?<!\*)\*([^*]+)\*(?!\*)", r"<em>\1</em>", out)
    return out


def first_sentence(text: str) -> str:
    parts = re.split(r"(?<=[。！？])", text.strip())
    return parts[0].strip() if parts else text.strip()


def data_uri(path: Path) -> str | None:
    if not path.is_file():
        return None
    mime = mimetypes.guess_type(path.name)[0] or "application/octet-stream"
    return f"data:{mime};base64,{base64.b64encode(path.read_bytes()).decode()}"


# --------------------------------------------------------------------------
# 数据结构
# --------------------------------------------------------------------------

@dataclass
class Publication:
    title: str
    key: str
    url: str = ""
    authors: str = ""
    venue: str = ""
    venue_short: str = ""
    tier: str = ""
    note: str = ""
    commented: bool = False


@dataclass
class Experience:
    company: str
    role_line: str
    summary: str
    logo: Path | None = None
    date: str = ""
    bullets: list[str] = field(default_factory=list)


@dataclass
class Project:
    name: str
    role: str = ""
    url: str = ""
    description: str = ""


@dataclass
class Education:
    period: str
    degree: str
    school: str
    school_detail: str = ""
    major: str = ""
    advisor: str = ""


@dataclass
class Homepage:
    intro: str = ""
    publications: list[Publication] = field(default_factory=list)
    experiences: list[Experience] = field(default_factory=list)
    projects: list[Project] = field(default_factory=list)
    stack: list[tuple[str, str]] = field(default_factory=list)
    educations: list[Education] = field(default_factory=list)
    honors: list[str] = field(default_factory=list)


# --------------------------------------------------------------------------
# 解析 about-zh.md
# --------------------------------------------------------------------------

def split_sections(body: str) -> dict[str, str]:
    """按一级标题切分正文，返回 {去掉 emoji 和锚点的标题: 内容}。"""
    sections: dict[str, str] = {}
    current, buf = "__intro__", []
    for line in body.splitlines():
        m = re.match(r"^#\s+(.*)$", line)
        if m:
            sections[current] = "\n".join(buf)
            title = re.sub(r"\{#.*?\}", "", m.group(1))
            title = re.sub(r"[^\w\u4e00-\u9fff]+", "", title)
            current, buf = title, []
        else:
            buf.append(line)
    sections[current] = "\n".join(buf)
    return sections


def drop_comments(text: str) -> tuple[str, str]:
    """分离 {% comment %} 块，返回（可见内容, 被注释内容）。"""
    hidden = "\n".join(re.findall(r"\{%\s*comment\s*%\}(.*?)\{%\s*endcomment\s*%\}", text, re.S))
    visible = re.sub(r"\{%\s*comment\s*%\}.*?\{%\s*endcomment\s*%\}", "", text, flags=re.S)
    return visible, hidden


def parse_publications(section: str, aliases: dict[str, str]) -> list[Publication]:
    m = re.search(r"\{%\s*capture\s+publications\s*%\}(.*?)\{%\s*endcapture\s*%\}", section, re.S)
    block = m.group(1) if m else section
    visible, hidden = drop_comments(block)

    pubs: list[Publication] = []
    for chunk, commented in ((visible, False), (hidden, True)):
        for entry in re.split(r"\n(?=-\s+\[)", chunk):
            entry = entry.strip()
            if not entry.startswith("- ["):
                continue
            head = re.match(r"-\s+\[(.+?)\]\((.*?)\)", entry, re.S)
            if not head:
                continue
            title = head.group(1).strip().rstrip(".")
            lines = [l.strip() for l in entry.splitlines() if l.strip()]
            authors = strip_html(lines[1]).rstrip("<br>").strip() if len(lines) > 1 else ""

            venue_line = next((l for l in lines if re.search(r"\*[^*]*\*", l) and "color:red" in l), "")
            italic = re.search(r"\*(?:\*)?(.+?)(?:\*)?\*", venue_line)
            venue = strip_html(italic.group(1)) if italic else ""
            venue = re.sub(r"^In\s+", "", venue).strip().rstrip(".")
            paren = re.findall(r"\(([^()]*)\)", venue)
            venue_short = paren[-1] if paren else venue
            for src, dst in aliases.items():
                if venue_short == src:
                    venue_short = dst
                elif src in venue_short:
                    venue_short = venue_short.replace(src, dst)
            tier_m = re.search(r'color:red[^>]*>([^<]+)<', venue_line)
            note_m = re.search(r'color:#666[^>]*>(.*?)</span>', entry, re.S)

            pubs.append(Publication(
                title=title,
                key=re.split(r"[:：]", title)[0].strip(),
                url=head.group(2).strip(),
                authors=authors,
                venue=venue,
                venue_short=venue_short.strip(),
                tier=tier_m.group(1).strip() if tier_m else "",
                note=strip_html(note_m.group(1)) if note_m else "",
                commented=commented,
            ))
    return pubs


def parse_experiences(section: str) -> list[Experience]:
    exps: list[Experience] = []
    for block in re.findall(r"<div style=\"display:flex;.*?</div>\s*</div>", section, re.S):
        logo_m = re.search(r'<img src="([^"]+)"', block)
        title_m = re.search(r'font-weight:600;">(.*?)</div>', block, re.S)
        desc_m = re.search(r'font-size:0\.92em[^>]*>(.*?)</div>', block, re.S)
        if not title_m:
            continue
        title = html.unescape(strip_html(title_m.group(1)))
        title = re.sub(r"\s*[·・]\s*", "｜", title)
        logo_path = None
        if logo_m:
            candidate = ROOT / logo_m.group(1).lstrip("/")
            logo_path = candidate if candidate.is_file() else None
        exps.append(Experience(
            company=title.split("｜")[0].strip(),
            role_line=title,
            summary=strip_html(desc_m.group(1)) if desc_m else "",
            logo=logo_path,
        ))
    return exps


def parse_projects(section: str) -> list[Project]:
    projects: list[Project] = []
    section = re.sub(r"<!--.*?-->", "", section, flags=re.S)
    for entry in re.split(r"\n(?=-\s+\*\*)", section):
        entry = entry.strip()
        head = re.match(r"-\s+\*\*(.+?)\*\*\s*[（(](.+?)[)）]", entry)
        if not head:
            continue
        url_m = re.search(r"\]\((https?://[^)]+)\)\s*$", entry.splitlines()[0])
        desc = " ".join(l.strip() for l in entry.splitlines()[1:] if l.strip())
        projects.append(Project(
            name=head.group(1).strip(),
            role=head.group(2).strip(),
            url=url_m.group(1) if url_m else "",
            description=strip_badges(desc).strip(),
        ))
    return projects


def parse_stack(section: str) -> list[tuple[str, str]]:
    items = []
    for line in section.splitlines():
        m = re.match(r"-\s+\*\*(.+?)\*\*\s*[:：]\s*(.+)$", line.strip())
        if m:
            items.append((m.group(1).strip(), m.group(2).strip()))
    return items


def parse_educations(section: str) -> list[Education]:
    edus = []
    for line in section.splitlines():
        m = re.match(r"-\s+\*(.+?)\*\s*[，,]\s*(.+)$", line.strip())
        if not m:
            continue
        period = m.group(1).replace(" ", "")
        rest = m.group(2).rstrip("。").strip()
        parts = [p.strip() for p in re.split(r"[，,]", rest) if p.strip()]
        degree = parts[0] if parts else ""
        tail = parts[1] if len(parts) > 1 else ""
        school, _, detail = tail.partition(" ")
        edus.append(Education(
            period=period,
            degree=degree.replace("研究生", ""),
            school=school.strip(),
            school_detail=detail.strip(),
        ))
    return edus


def parse_honors(section: str) -> list[str]:
    honors = []
    for line in section.splitlines():
        m = re.match(r"-\s+\*(.+?)\*\s*(.+)$", line.strip())
        if m:
            honors.append(f"{m.group(1).strip()} {m.group(2).strip().rstrip('。')}")
    return honors


def parse_intro(body: str) -> str:
    """主页开头的自我介绍段落（第一个以加粗姓名开头的段落）。"""
    head = re.split(r"^#\s+[💼🤖🛠📝🔥🎖📖]", body, maxsplit=1, flags=re.M)[0]
    for para in re.split(r"\n\s*\n", head):
        para = para.strip()
        if para.startswith("**") and "是" in para:
            return " ".join(l.strip() for l in para.splitlines())
    return ""


def parse_homepage(cfg: dict) -> Homepage:
    raw = SOURCE_MD.read_text(encoding="utf-8")
    body = re.sub(r"^---.*?^---\s*", "", raw, count=1, flags=re.S | re.M)
    sec = split_sections(body)

    def get(*names: str) -> str:
        for name in names:
            if name in sec:
                return sec[name]
        return ""

    return Homepage(
        intro=parse_intro(body),
        publications=parse_publications(get("论文发表"), cfg.get("venue_aliases") or {}),
        experiences=parse_experiences(get("经历")),
        projects=parse_projects(get("智能体系统")),
        stack=parse_stack(get("技术栈")),
        educations=parse_educations(get("教育经历")),
        honors=parse_honors(get("荣誉奖励")),
    )


# --------------------------------------------------------------------------
# 合并 YAML 补充信息
# --------------------------------------------------------------------------

def merge_extras(page: Homepage, cfg: dict, warn) -> None:
    for edu in page.educations:
        extra = (cfg.get("education_extra") or {}).get(edu.school) or {}
        edu.school_detail = extra.get("school_detail", edu.school_detail)
        edu.major = extra.get("major", "")
        edu.advisor = extra.get("advisor", "")

    for exp in page.experiences:
        extra = {}
        for key, value in (cfg.get("experience_extra") or {}).items():
            if key in exp.role_line:
                extra = value or {}
                break
        exp.date = (extra.get("date") or "").strip()
        exp.bullets = list(extra.get("bullets") or [])
        if not exp.date:
            warn(f"经历「{exp.company}」缺少起止时间，请在 _data/resume_config.yml 的 experience_extra 中填写")

    overrides = cfg.get("project_summaries") or {}
    for proj in page.projects:
        override = next((v for k, v in overrides.items() if k in proj.name), None)
        proj.description = override or first_sentence(proj.description)


def count_tiers(pubs: list[Publication]) -> dict[str, int]:
    counts: dict[str, int] = {}
    for pub in pubs:
        if pub.commented or not pub.tier:
            continue
        counts[pub.tier] = counts.get(pub.tier, 0) + 1
    return counts


def resolve_chip(item: str, page: Homepage) -> tuple[str, str] | None:
    """把矩阵条目解析成 (名称, 标注)。"""
    if "|" in item:
        name, _, tag = item.partition("|")
        return name.strip(), tag.strip()
    for pub in page.publications:
        if pub.key == item or item.lower() in pub.title.lower():
            tag = pub.venue_short or ""
            if pub.commented and not tag:
                tag = pub.venue
            return pub.key, tag
    for proj in page.projects:
        if item in proj.name:
            return item, "GitHub 开源"
    return item, ""


# --------------------------------------------------------------------------
# HTML 渲染
# --------------------------------------------------------------------------

def render_header(cfg: dict, warn) -> str:
    p = cfg.get("profile") or {}
    contacts = []
    if p.get("phone"):
        contacts.append(f"手机：{html.escape(p['phone'])}")
    if p.get("email"):
        contacts.append(f"邮箱：{html.escape(p['email'])}")
    if p.get("homepage"):
        contacts.append(f"主页：{html.escape(p['homepage'])}")

    photo_html = ""
    if p.get("photo"):
        uri = data_uri(ROOT / str(p["photo"]).lstrip("/"))
        if uri:
            photo_html = f'<div class="photo"><img src="{uri}" alt="photo"></div>'
        else:
            warn(f"未找到证件照 {p['photo']}，先渲染占位框；把照片放到该路径后重跑即可")
            photo_html = '<div class="photo photo-empty"><span>照片</span></div>'

    return f"""<header class="hdr">
  <h1>{html.escape(p.get('name', ''))}</h1>
  <div class="hdr-line">{'&nbsp;|&nbsp;'.join(contacts)}</div>
  <div class="hdr-line">{html.escape(p.get('headline', ''))}</div>
  {photo_html}
</header>"""


def render_education(page: Homepage, cfg: dict) -> str:
    rows = []
    for edu in page.educations:
        years = re.findall(r"(\d{4})", edu.period)
        period = f"{years[0]}-{years[1]}" if len(years) > 1 else f"{years[0]}-至今" if years else edu.period
        school = html.escape(edu.school)
        if edu.school_detail:
            school += f"｜{html.escape(edu.school_detail)}"
        cells = [f'<b>{html.escape(edu.degree)}</b>：{school}']
        if edu.major:
            cells.append(f'<b>专业</b>：{html.escape(edu.major)}')
        if edu.advisor:
            cells.append(f'<b>导师</b>：{html.escape(edu.advisor)}')
        rows.append(
            f'<li><span class="period">{html.escape(period)}</span>'
            f'<span class="edu-body">{"　".join(cells)}</span></li>'
        )
    return f'<ul class="tri edu">{"".join(rows)}</ul>'


def render_summary(page: Homepage, cfg: dict) -> str:
    text = (cfg.get("summary") or "").strip() or strip_html(page.intro)
    counts = count_tiers(page.publications)
    fills = {
        "ccfa": counts.get("CCF-A", 0),
        "thcpl": counts.get("TH-CPL-A", 0),
        "jcrq1": counts.get("JCR-Q1", 0),
        "n_pub": sum(counts.values()),
    }
    bullets = []
    for raw in cfg.get("highlights") or []:
        try:
            filled = str(raw).format(**fills)
        except (KeyError, IndexError):
            filled = str(raw)
        if re.search(r"\b0\b", filled):
            continue
        filled = re.sub(r"(\d+)", r'<b class="num">\1</b>', md_inline(filled))
        bullets.append(f'<span class="hl">{filled}</span>')
    hl = f'<div class="hl-row">{"".join(bullets)}</div>' if bullets else ""
    return f'<p class="summary">{md_inline(text)}</p>{hl}'


def render_experience(page: Homepage, cfg: dict) -> str:
    blocks = []
    for exp in page.experiences:
        logo = ""
        if exp.logo:
            uri = data_uri(exp.logo)
            if uri:
                logo = f'<img class="logo" src="{uri}" alt="">'
        title = exp.role_line + (f"｜{exp.date}" if exp.date else "")
        bullets = "".join(f"<li>{md_inline(b)}</li>" for b in exp.bullets)
        blocks.append(
            f'<div class="exp">'
            f'<div class="exp-hd">{logo}<span class="exp-title">{html.escape(title)}</span></div>'
            f'<div class="exp-sum">{md_inline(exp.summary)}</div>'
            f'{f"<ul class=\'tri\'>{bullets}</ul>" if bullets else ""}'
            f"</div>"
        )
    return "".join(blocks)


def render_projects(page: Homepage, cfg: dict) -> str:
    rows = []
    for proj in page.projects:
        role = f'<span class="role">{html.escape(proj.role)}</span>' if proj.role else ""
        link = ""
        if proj.url:
            link = f'<span class="repo">{html.escape(proj.url.replace("https://", ""))}</span>'
        rows.append(
            f'<li><span class="proj-name">{md_inline(proj.name)}</span>{role}{link}'
            f'<span class="proj-desc">{md_inline(proj.description)}</span></li>'
        )
    return f'<ul class="tri proj">{"".join(rows)}</ul>'


def render_research(page: Homepage, cfg: dict) -> str:
    groups = []
    for group in cfg.get("research_matrix") or []:
        tone = group.get("tone", "blue")
        lines = []
        for row in group.get("rows") or []:
            chips = []
            for item in row.get("items") or []:
                resolved = resolve_chip(item, page)
                if not resolved:
                    continue
                name, tag = resolved
                tag_html = f'<i>{html.escape(tag)}</i>' if tag else ""
                chips.append(f'<span class="chip"><b>{html.escape(name)}</b>{tag_html}</span>')
            lines.append(
                f'<div class="qline"><span class="rlabel tone-{tone}">'
                f'{html.escape(row.get("label", ""))}</span>{"".join(chips)}</div>'
            )
        groups.append(
            f'<div class="qgroup">'
            f'<div class="qcell tone-{tone}">{html.escape(group.get("id", ""))}：'
            f'{html.escape(group.get("question", ""))}</div>'
            f'<div class="qlines">{"".join(lines)}</div></div>'
        )
    return "".join(groups)


def render_publications(page: Homepage, cfg: dict) -> str:
    show_notes = bool(cfg.get("publication_notes", False))
    rows = []
    for pub in page.publications:
        if pub.commented:
            continue
        venue = pub.venue_short or pub.venue
        tier = f'<span class="tier">{html.escape(pub.tier)}</span>' if pub.tier else ""
        note = f'<span class="pub-note">{md_inline(pub.note)}</span>' if show_notes and pub.note else ""
        rest = pub.title[len(pub.key):].lstrip(":：").strip()
        rows.append(
            f'<li><span class="pub-key">{html.escape(pub.key)}</span>'
            f'<span class="pub-title">{html.escape(rest)}</span>'
            f'<span class="venue">{html.escape(venue)}</span>{tier}{note}</li>'
        )
    return f'<ul class="tri pub">{"".join(rows)}</ul>'


def render_stack(page: Homepage, cfg: dict) -> str:
    rows = [
        f'<li><b>{html.escape(label)}</b>：{md_inline(value)}</li>'
        for label, value in page.stack
    ]
    return f'<ul class="tri stack">{"".join(rows)}</ul>'


def render_honors(page: Homepage, cfg: dict) -> str:
    rows = [f"<li>{md_inline(h)}</li>" for h in page.honors]
    return f'<ul class="tri">{"".join(rows)}</ul>'


SECTION_RENDERERS = {
    "education": render_education,
    "summary": render_summary,
    "experience": render_experience,
    "agents": render_projects,
    "research": render_research,
    "publications": render_publications,
    "stack": render_stack,
    "honors": render_honors,
}

DEFAULT_TITLES = {
    "education": "教育背景",
    "summary": "简要介绍",
    "experience": "工作经历",
    "agents": "Agent 系统与开源",
    "research": "科研成果",
    "publications": "论文发表",
    "stack": "技术栈",
    "honors": "荣誉奖励",
}


def build_html(page: Homepage, cfg: dict, font_pt: float, warn) -> str:
    titles = {**DEFAULT_TITLES, **(cfg.get("section_titles") or {})}
    parts = [render_header(cfg, warn)]
    for name in cfg.get("sections") or list(DEFAULT_TITLES):
        renderer = SECTION_RENDERERS.get(name)
        if renderer is None:
            warn(f"未知章节 {name}，已跳过")
            continue
        body = renderer(page, cfg)
        if not re.sub(r"<[^>]+>", "", body).strip():
            continue
        parts.append(
            f'<section class="sec-{name}">'
            f'<h2 class="sec">{html.escape(titles.get(name, name))}</h2>{body}</section>'
        )

    css = CSS_FILE.read_text(encoding="utf-8")
    return f"""<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="utf-8">
<title>{html.escape((cfg.get('profile') or {}).get('name', 'resume'))}</title>
<style>:root {{ --base: {font_pt}pt; }}
{css}</style></head>
<body><div class="sheet">{''.join(parts)}</div></body></html>"""


# --------------------------------------------------------------------------
# 出 PDF
# --------------------------------------------------------------------------

def build_pdf(page: Homepage, cfg: dict, out_pdf: Path, html_out: Path | None,
              fit: bool, warn) -> None:
    from playwright.sync_api import sync_playwright

    layout = cfg.get("layout") or {}
    base = float(layout.get("base_font_pt", 10.0))
    minimum = float(layout.get("min_font_pt", 8.0))
    step = float(layout.get("step_pt", 0.2))
    max_pages = int(layout.get("max_pages", 1))
    limit = PAGE_H_PX * max_pages - 2

    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        tab = browser.new_page(viewport={"width": round(PAGE_W_PX), "height": round(PAGE_H_PX)})
        font_pt = base
        markup = build_html(page, cfg, font_pt, warn)
        while True:
            tab.set_content(markup, wait_until="load")
            height = tab.evaluate("document.querySelector('.sheet').getBoundingClientRect().height")
            if not fit or height <= limit or font_pt <= minimum + 1e-9:
                if fit and height > limit:
                    warn(f"字号已降到 {font_pt:.1f}pt 仍超出 {max_pages} 页，请精简内容")
                break
            font_pt = max(minimum, round(font_pt - step, 2))
            markup = build_html(page, cfg, font_pt, warn)

        if html_out:
            html_out.write_text(markup, encoding="utf-8")
        tab.pdf(path=str(out_pdf), format="A4", print_background=True,
                margin={"top": "0", "right": "0", "bottom": "0", "left": "0"})
        browser.close()
        print(f"字号 {font_pt:.1f}pt，内容高度 {height:.0f}px / 单页 {PAGE_H_PX:.0f}px")


def main() -> int:
    ap = argparse.ArgumentParser(description="从个人主页生成简历 PDF")
    ap.add_argument("--out", help="输出 PDF 路径（默认取 _data/resume_config.yml 的 output）")
    ap.add_argument("--html", help="同时导出 HTML 的路径")
    ap.add_argument("--html-only", action="store_true", help="只导出 HTML，不生成 PDF")
    ap.add_argument("--no-fit", action="store_true", help="关闭单页字号自适应")
    args = ap.parse_args()

    warnings: list[str] = []

    def warn(message: str) -> None:
        warnings.append(message)

    cfg = yaml.safe_load(RESUME_YML.read_text(encoding="utf-8")) or {}
    page = parse_homepage(cfg)
    merge_extras(page, cfg, warn)

    out_pdf = Path(args.out) if args.out else ROOT / cfg.get("output", "resume.pdf")
    if not out_pdf.is_absolute():
        out_pdf = ROOT / out_pdf
    html_out = Path(args.html) if args.html else (
        out_pdf.with_suffix(".html") if args.html_only else None
    )

    if args.html_only:
        markup = build_html(page, cfg, float((cfg.get("layout") or {}).get("base_font_pt", 10.0)), warn)
        html_out.write_text(markup, encoding="utf-8")
        print(f"已生成 {html_out}")
    else:
        out_pdf.parent.mkdir(parents=True, exist_ok=True)
        build_pdf(page, cfg, out_pdf, html_out, fit=not args.no_fit, warn=warn)
        print(f"已生成 {out_pdf}")

    print(f"解析结果：论文 {len(page.publications)}、经历 {len(page.experiences)}、"
          f"项目 {len(page.projects)}、教育 {len(page.educations)}")
    for message in dict.fromkeys(warnings):
        print(f"提示：{message}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
