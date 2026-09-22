/**
 * 论文条目的 [Cite] 弹窗：仿 Google Scholar，给出 GB/T 7714、MLA、APA 三种文本和一份 BibTeX。
 *
 * 数据来自 publication_item.html 写在按钮上的 data-citation（front matter 的 citation: 块，
 * 缺省字段由 title / authors / pub / pub_date / links.Paper 推导）。同一篇论文在桌面版和移动版
 * 各渲染一次，所以弹窗只建一个，点击时再填充。
 */
(function () {
    const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    const MONTH_ABBR = ['jan', 'feb', 'mar', 'apr', 'may', 'jun',
        'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

    const isChinese = (document.documentElement.lang || '').toLowerCase().startsWith('zh');
    const TEXT = isChinese
        ? {title: '引用', copied: '已复制', copyFailed: '复制失败', copy: '复制', download: '下载 .bib', close: '关闭'}
        : {title: 'Cite', copied: 'Copied', copyFailed: 'Copy failed', copy: 'Copy', download: 'Download .bib', close: 'Close'};

    function clean(value) {
        return value == null ? '' : String(value).trim();
    }

    /** "Zhiyuan Peng" -> {given: "Zhiyuan", family: "Peng", initials: "Z."} */
    function parseName(raw) {
        const parts = clean(raw).split(/\s+/).filter(Boolean);
        if (!parts.length) return null;
        const family = parts.pop();
        const given = parts.join(' ');
        const initials = parts.map(part => part.charAt(0).toUpperCase() + '.').join(' ');
        return {given: given, family: family, initials: initials};
    }

    function parseMonth(value) {
        const raw = clean(value).toLowerCase();
        if (!raw) return -1;
        const numeric = Number(raw);
        if (Number.isFinite(numeric) && numeric >= 1 && numeric <= 12) return numeric - 1;
        const index = MONTH_ABBR.indexOf(raw.slice(0, 3));
        return index;
    }

    /** BibTeX 用 --，正文格式用 - */
    function pagesText(pages) {
        return clean(pages).replace(/--+/g, '-');
    }

    function pagesBibtex(pages) {
        return clean(pages).replace(/--+/g, '-').replace(/-/g, '--');
    }

    function escapeHtml(value) {
        return (value == null ? '' : String(value))
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    /** 中文 GB/T 7714：Peng Z, Yin X, Zhao P, et al. */
    function gbtAuthors(names) {
        const formatted = names.map(name => {
            const initials = name.initials.replace(/\./g, '').replace(/\s+/g, '');
            return initials ? `${name.family} ${initials}` : name.family;
        });
        if (formatted.length > 3) return formatted.slice(0, 3).join(', ') + ', et al';
        return formatted.join(', ');
    }

    function mlaAuthors(names) {
        if (!names.length) return '';
        const first = names[0].given ? `${names[0].family}, ${names[0].given}` : names[0].family;
        if (names.length === 1) return first;
        if (names.length === 2) {
            const second = names[1].given ? `${names[1].given} ${names[1].family}` : names[1].family;
            return `${first}, and ${second}`;
        }
        return `${first}, et al`;
    }

    function apaAuthors(names) {
        const formatted = names.map(name => (name.initials ? `${name.family}, ${name.initials}` : name.family));
        if (formatted.length === 1) return formatted[0];
        return formatted.slice(0, -1).join(', ') + ', & ' + formatted[formatted.length - 1];
    }

    function bibtexAuthors(names) {
        return names.map(name => (name.given ? `${name.family}, ${name.given}` : name.family)).join(' and ');
    }

    /** {text, html}：html 用于弹窗展示（会议名斜体），text 用于复制。 */
    function gbtStyle(data, names) {
        const authors = gbtAuthors(names);
        const kind = data.type === 'article' ? 'J' : 'C';
        const venue = clean(data.booktitle);
        const pages = pagesText(data.pages);
        let tail = clean(data.year);
        if (tail && pages) tail = `${tail}: ${pages}`;
        else if (!tail && pages) tail = pages;
        const head = authors ? `${authors}. ` : '';
        const body = `${clean(data.title)}[${kind}]${venue ? '//' + venue : ''}.`;
        const text = `${head}${body}${tail ? ' ' + tail + '.' : ''}`;
        const html = `${escapeHtml(head)}${escapeHtml(clean(data.title))}[${kind}]${venue ? '//<i>' + escapeHtml(venue) + '</i>' : ''}.${tail ? ' ' + escapeHtml(tail) + '.' : ''}`;
        return {text: text, html: html};
    }

    function mlaStyle(data, names) {
        const authors = mlaAuthors(names);
        const venue = clean(data.booktitle);
        const year = clean(data.year);
        const pages = pagesText(data.pages);
        const head = authors ? `${authors}. ` : '';
        const title = `"${clean(data.title)}." `;
        const tailParts = [];
        if (year) tailParts.push(year);
        if (pages) tailParts.push(`pp. ${pages}`);
        const tail = tailParts.length ? (venue ? ', ' : '') + tailParts.join(', ') + '.' : (venue ? '.' : '');
        const text = `${head}${title}${venue}${tail}`.trim();
        const html = `${escapeHtml(head)}${escapeHtml(title)}${venue ? '<i>' + escapeHtml(venue) + '</i>' : ''}${escapeHtml(tail)}`.trim();
        return {text: text, html: html};
    }

    function apaStyle(data, names) {
        const authors = apaAuthors(names);
        const year = clean(data.year);
        const monthIndex = parseMonth(data.month);
        const date = year ? (monthIndex >= 0 ? `(${year}, ${MONTHS[monthIndex]}). ` : `(${year}). `) : '';
        const venue = clean(data.booktitle);
        const pages = pagesText(data.pages);
        const publisher = clean(data.publisher);
        const head = authors ? `${authors} ` : '';
        const title = `${clean(data.title)}. `;
        const venueTail = pages ? ` (pp. ${pages})` : '';
        const venueText = venue ? `In ${venue}${venueTail}. ` : '';
        const venueHtml = venue ? `In <i>${escapeHtml(venue)}</i>${escapeHtml(venueTail)}. ` : '';
        const text = `${head}${date}${title}${venueText}${publisher ? publisher + '.' : ''}`.trim();
        const html = `${escapeHtml(head)}${escapeHtml(date)}${escapeHtml(title)}${venueHtml}${publisher ? escapeHtml(publisher) + '.' : ''}`.trim();
        return {text: text, html: html};
    }

    function bibtex(data, names) {
        const type = clean(data.type) || 'inproceedings';
        const fields = [];
        const push = (key, value) => {
            const cleaned = clean(value);
            if (cleaned) fields.push(`  ${key}={${cleaned}}`);
        };
        // 标题外再套一层花括号，避免 BibTeX 样式把 LLM、GUI 这类缩写转成小写
        const title = clean(data.title);
        if (title) fields.push(`  title={{${title}}}`);
        push('author', bibtexAuthors(names));
        push(type === 'article' ? 'journal' : 'booktitle', data.booktitle);
        push('pages', pagesBibtex(data.pages));
        push('year', data.year);
        // month 用 BibTeX 内置宏（不加花括号），样式表才能按需要渲染成 July / Jul.
        const monthIndex = parseMonth(data.month);
        if (monthIndex >= 0) fields.push(`  month=${MONTH_ABBR[monthIndex]}`);
        push('publisher', data.publisher);
        push('address', data.address);
        push('doi', data.doi);
        push('url', data.url);
        const key = clean(data.key) || 'citation';
        return `@${type}{${key},\n${fields.join(',\n')}\n}`;
    }

    async function copyText(text) {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
                return true;
            }
        } catch (_) {
            // 继续走 execCommand 兜底
        }
        const area = document.createElement('textarea');
        area.value = text;
        area.setAttribute('readonly', '');
        area.style.position = 'fixed';
        area.style.opacity = '0';
        document.body.appendChild(area);
        area.select();
        let ok = false;
        try {
            ok = document.execCommand('copy');
        } catch (_) {
            ok = false;
        }
        document.body.removeChild(area);
        return ok;
    }

    function flash(element, message) {
        const hint = element.querySelector('.citation-copy-hint');
        if (!hint) return;
        hint.textContent = message;
        hint.classList.add('is-visible');
        clearTimeout(hint._timer);
        hint._timer = setTimeout(() => hint.classList.remove('is-visible'), 1500);
    }

    function buildModal() {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = `
<div class="modal fade citation-modal" id="citation-modal" tabindex="-1" role="dialog" aria-labelledby="citation-modal-title" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
    <div class="modal-content rounded-xl">
      <div class="modal-header align-items-center">
        <button type="button" class="close m-0 p-0" data-dismiss="modal" aria-label="${TEXT.close}"><span aria-hidden="true">&times;</span></button>
        <h6 class="modal-title flex-grow-1 text-center mb-0" id="citation-modal-title">${TEXT.title}</h6>
        <span class="citation-header-spacer"></span>
      </div>
      <div class="modal-body">
        <div class="citation-rows"></div>
        <div class="citation-exports text-center pt-3">
          <button type="button" class="btn btn-link btn-sm citation-bibtex-toggle">BibTeX</button>
        </div>
        <div class="citation-bibtex-panel d-none pt-2">
          <pre class="citation-bibtex mb-2"></pre>
          <div class="text-right">
            <button type="button" class="btn btn-sm btn-outline-secondary citation-bibtex-copy">${TEXT.copy}</button>
            <button type="button" class="btn btn-sm btn-outline-secondary citation-bibtex-download">${TEXT.download}</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>`;
        const modal = wrapper.firstElementChild;
        document.body.appendChild(modal);
        return modal;
    }

    const buttons = Array.from(document.querySelectorAll('.cite-link'));
    if (!buttons.length) return;

    const modal = buildModal();
    const rowsContainer = modal.querySelector('.citation-rows');
    const bibtexPanel = modal.querySelector('.citation-bibtex-panel');
    const bibtexPre = modal.querySelector('.citation-bibtex');
    let currentKey = 'citation';

    function renderRows(styles) {
        rowsContainer.textContent = '';
        styles.forEach(style => {
            const row = document.createElement('div');
            row.className = 'citation-row d-flex align-items-start';
            row.setAttribute('role', 'button');
            row.setAttribute('tabindex', '0');
            row.dataset.text = style.text;
            row.innerHTML = `
<div class="citation-style text-muted small">${style.label}</div>
<div class="citation-text flex-grow-1">${style.html}<span class="citation-copy-hint small text-success ml-2"></span></div>`;
            const copy = async () => {
                const ok = await copyText(row.dataset.text);
                flash(row, ok ? TEXT.copied : TEXT.copyFailed);
            };
            row.addEventListener('click', copy);
            row.addEventListener('keydown', event => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    copy();
                }
            });
            rowsContainer.appendChild(row);
        });
    }

    function openModal(data) {
        const names = (data.authors || []).map(parseName).filter(Boolean);
        renderRows([
            Object.assign({label: 'GB/T 7714'}, gbtStyle(data, names)),
            Object.assign({label: 'MLA'}, mlaStyle(data, names)),
            Object.assign({label: 'APA'}, apaStyle(data, names))
        ]);
        bibtexPre.textContent = bibtex(data, names);
        bibtexPanel.classList.add('d-none');
        currentKey = clean(data.key) || 'citation';

        if (window.jQuery && window.jQuery.fn.modal) {
            window.jQuery(modal).modal('show');
        } else {
            modal.classList.add('show');
            modal.style.display = 'block';
        }
    }

    modal.querySelector('.citation-bibtex-toggle').addEventListener('click', () => {
        bibtexPanel.classList.toggle('d-none');
    });

    modal.querySelector('.citation-bibtex-copy').addEventListener('click', async () => {
        const button = modal.querySelector('.citation-bibtex-copy');
        const ok = await copyText(bibtexPre.textContent);
        const original = button.textContent;
        button.textContent = ok ? TEXT.copied : TEXT.copyFailed;
        setTimeout(() => {
            button.textContent = original;
        }, 1500);
    });

    modal.querySelector('.citation-bibtex-download').addEventListener('click', () => {
        const blob = new Blob([bibtexPre.textContent + '\n'], {type: 'application/x-bibtex;charset=utf-8'});
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${currentKey}.bib`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    });

    buttons.forEach(button => {
        button.addEventListener('click', event => {
            event.preventDefault();
            let data;
            try {
                data = JSON.parse(button.getAttribute('data-citation'));
            } catch (error) {
                console.error('[citation] Malformed citation payload', error);
                return;
            }
            openModal(data || {});
        });
    });
})();
