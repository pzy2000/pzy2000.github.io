# Zhiyuan Peng's Homepage

Personal academic homepage of Zhiyuan Peng (彭志远), Ph.D. student at the School of Computer Science, Shanghai Jiao Tong University.

Live at [pzy2000.github.io](https://pzy2000.github.io) (English) and [pzy2000.github.io/zh/](https://pzy2000.github.io/zh/) (中文).

Built with Jekyll and the [luost26/academic-homepage](https://github.com/luost26/academic-homepage) template, deployed via GitHub Pages.

## Local development

```bash
bundle exec jekyll serve
```

## Content editing

- `_data/profile.yml` / `_data/profile_zh.yml`: bio, education, experience, awards (EN/ZH)
- `_data/agent_systems.yml`, `_data/agent_stack.yml`, `_data/services.yml`: homepage cards
- `_publications/`: one markdown file per paper (front matter only)
- `_news/`: one markdown file per news item (`title` / `title_zh`)
- `_pages/about-zh.md`: **not** used by the site; it is the content source for `scripts/build_resume.py` (resume PDF/web generation)

## Resume

```bash
python3 scripts/build_resume.py   # regenerates 彭志远-简历.pdf and resume/index.html
```
