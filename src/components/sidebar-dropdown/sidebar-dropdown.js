import { baseStyles, MvxElement, parseData, htmlEscape, safeUrl } from '../../core.js';

function itemUrl(item = {}) {
  return safeUrl(item.url ?? item.href, '');
}

function normalizeItem(item, path) {
  const normalized = typeof item === 'string' ? { label: item, value: item } : { ...item };
  normalized._path = path;
  normalized.children = Array.isArray(normalized.children)
    ? normalized.children.map((child, index) => normalizeItem(child, `${path}-${index}`))
    : [];
  return normalized;
}

function countLeaves(items = []) {
  return items.reduce((total, item) => {
    if (item.children?.length) return total + countLeaves(item.children);
    return total + 1;
  }, 0);
}

function itemText(item) {
  return [
    item.label,
    item.value,
    item.url,
    item.href,
    item.search,
    ...(Array.isArray(item.tags) ? item.tags : [])
  ].filter(Boolean).join(' ').toLowerCase();
}

function filterItems(items, query) {
  const needle = query.trim().toLowerCase();
  if (!needle) return items;

  return items.reduce((matches, item) => {
    const childMatches = filterItems(item.children || [], needle);
    if (itemText(item).includes(needle)) {
      matches.push(item);
      return matches;
    }
    if (childMatches.length) {
      matches.push({ ...item, children: childMatches });
    }
    return matches;
  }, []);
}

function findByPath(items, path) {
  const indexes = String(path).split('-').map(Number);
  let item = items[indexes[0]];
  indexes.slice(1).forEach(index => {
    item = item?.children?.[index];
  });
  return item;
}

function publicItem(item = {}) {
  const { _path, children, ...rest } = item;
  return {
    ...rest,
    ...(children?.length ? { children: children.map(publicItem) } : {})
  };
}

export class MvxSidebarDropdown extends MvxElement {
  static observedAttributes = ['items', 'label', 'searchable', 'search-placeholder', 'compact'];

  constructor() {
    super();
    this._query = '';
    this._openOverrides = new Map();
  }

  set items(value) {
    this._items = value;
    this._openOverrides.clear();
    if (this.isConnected) this.render();
  }

  get items() {
    return parseData(this._items ?? this.getAttribute('items'), []);
  }

  normalizedItems() {
    return this.items.map((item, index) => normalizeItem(item, String(index)));
  }

  toggle(path, force) {
    const item = findByPath(this.normalizedItems(), path);
    if (!item?.children?.length) return;
    const next = force ?? !this.isOpen(item);
    this._openOverrides.set(String(path), next);
    this.emit('mvx-toggle', { item: publicItem(item), path: String(path), open: next });
    this.render();
  }

  select(path) {
    const item = findByPath(this.normalizedItems(), path);
    if (!item || item.disabled || item.children?.length) return;
    const url = itemUrl(item);
    this.emit('mvx-select', {
      item: publicItem(item),
      path: String(path),
      url,
      value: item.value ?? (url || item.label || '')
    });
  }

  search(value) {
    this._query = String(value ?? '');
    this.emit('mvx-search', { query: this._query });
    this.render();
    const input = this.shadowRoot.querySelector('input');
    input?.focus();
    input?.setSelectionRange?.(this._query.length, this._query.length);
  }

  isOpen(item) {
    if (this._query.trim() && item.children?.length) return true;
    if (this._openOverrides.has(item._path)) return this._openOverrides.get(item._path);
    return Boolean(item.open);
  }

  renderItem(item, level = 0) {
    const hasChildren = item.children?.length;
    const disabled = Boolean(item.disabled);
    const url = disabled ? '' : itemUrl(item);
    const label = item.label ?? item.value ?? item.url ?? item.href ?? '';
    const style = `--level:${level}`;

    if (hasChildren) {
      const open = this.isOpen(item);
      const count = item.count ?? item.badge ?? countLeaves(item.children);
      return `
        <details class="node group level-${Math.min(level, 3)}" style="${style}" data-toggle="${htmlEscape(item._path)}" ${open ? 'open' : ''}>
          <summary class="row group-row" ${item.active ? 'aria-current="page"' : ''}>
            <span class="text">${htmlEscape(label)}</span>
            ${count ? `<span class="count">${htmlEscape(count)}</span>` : ''}
            <span class="chevron" aria-hidden="true"></span>
          </summary>
          <div class="children">
            ${item.children.map(child => this.renderItem(child, level + 1)).join('')}
          </div>
        </details>
      `;
    }

    const content = `
      <span class="text">${htmlEscape(label)}</span>
      ${item.badge ? `<span class="item-badge">${htmlEscape(item.badge)}</span>` : ''}
    `;

    if (url) {
      const target = item.target ? ` target="${htmlEscape(item.target)}"` : '';
      const relValue = item.rel || (item.target === '_blank' ? 'noopener noreferrer' : '');
      const rel = relValue ? ` rel="${htmlEscape(relValue)}"` : '';
      return `
        <a class="row leaf level-${Math.min(level, 3)}" style="${style}" href="${htmlEscape(url)}"${target}${rel} data-select="${htmlEscape(item._path)}" ${item.active ? 'aria-current="page"' : ''}>
          ${content}
        </a>
      `;
    }

    return `
      <button class="row leaf level-${Math.min(level, 3)}" style="${style}" type="button" data-select="${htmlEscape(item._path)}" ${item.active ? 'aria-current="page"' : ''} ${disabled ? 'disabled' : ''}>
        ${content}
      </button>
    `;
  }

  render() {
    const label = this.getAttribute('label') || this.t('sidebarDropdown', 'Sidebar menu');
    const placeholder = this.getAttribute('search-placeholder') || this.t('search', 'Search');
    const query = this._query;
    const items = filterItems(this.normalizedItems(), query);
    const showSearch = this.hasAttribute('searchable');

    this.shadowRoot.innerHTML = `
      <style>
        ${baseStyles}
        :host {
          display: block;
          inline-size: min(100%, 318px);
        }
        .shell {
          display: grid;
          gap: ${this.hasAttribute('compact') ? '8px' : '12px'};
          min-block-size: 100%;
          border: 1px solid var(--mvx-border);
          border-radius: var(--mvx-radius-md);
          background: color-mix(in srgb, var(--mvx-bg-panel) 88%, var(--mvx-bg-inset));
          color: var(--mvx-fg);
          padding: ${this.hasAttribute('compact') ? '14px' : '16px'};
          --tree-guide-color: color-mix(in srgb, var(--mvx-border) 72%, transparent);
        }
        :host([component-style="clean"]) .shell {
          border: 0;
          border-radius: 0;
          background: transparent;
          box-shadow: none;
          padding: 0;
        }
        .search-wrap {
          display: grid;
          gap: 6px;
          margin-block-start: 6px;
        }
        .search-label {
          color: var(--mvx-subtle);
          font-size: 11px;
          font-weight: 750;
          letter-spacing: 0;
          text-transform: uppercase;
        }
        input {
          inline-size: 100%;
          min-block-size: 38px;
          border: 1px solid var(--mvx-border);
          border-radius: var(--mvx-radius-sm);
          background: var(--mvx-bg-inset);
          color: var(--mvx-fg);
          font-size: 13px;
          font-weight: 650;
          outline: none;
          padding: 0 11px;
        }
        input::placeholder {
          color: color-mix(in srgb, var(--mvx-muted) 78%, transparent);
        }
        input:focus {
          border-color: var(--mvx-accent);
          box-shadow: var(--mvx-focus);
        }
        nav {
          display: grid;
          gap: 8px;
        }
        .node {
          position: relative;
          display: grid;
          gap: 5px;
        }
        details {
          margin: 0;
          padding: 0;
        }
        summary::-webkit-details-marker {
          display: none;
        }
        summary::marker {
          content: "";
        }
        .row {
          position: relative;
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto auto;
          align-items: center;
          gap: 9px;
          inline-size: 100%;
          min-block-size: 34px;
          border: 0;
          border-inline-start: 1px solid transparent;
          border-radius: 0 var(--mvx-radius-sm) var(--mvx-radius-sm) 0;
          background: transparent;
          color: var(--mvx-muted);
          cursor: pointer;
          font-size: 13px;
          font-weight: 650;
          padding: 0 10px 0 13px;
          text-align: start;
          text-decoration: none;
          user-select: none;
        }
        summary.row {
          list-style: none;
        }
        .group-row {
          font-size: 13px;
          font-weight: 750;
          min-block-size: 34px;
        }
        .level-0 > .group-row {
          color: var(--mvx-fg);
          font-weight: 800;
          min-block-size: 36px;
        }
        .leaf {
          grid-template-columns: minmax(0, 1fr) auto;
          color: var(--mvx-muted);
          font-size: 13px;
          font-weight: 650;
          min-block-size: 32px;
        }
        .row:not([aria-disabled="true"]):not(:disabled):hover,
        .row:not([aria-disabled="true"]):not(:disabled):focus-visible {
          background:
            linear-gradient(90deg, color-mix(in srgb, var(--mvx-accent) 11%, transparent), transparent 72%),
            color-mix(in srgb, var(--mvx-bg-panel) 88%, var(--mvx-bg-inset));
          border-inline-start-color: color-mix(in srgb, var(--mvx-accent) 54%, var(--mvx-border));
          color: var(--mvx-fg);
          outline: none;
        }
        .row[aria-current="page"] {
          background: color-mix(in srgb, var(--mvx-accent) 10%, transparent);
          border-inline-start-color: var(--mvx-accent);
          color: var(--mvx-accent-2);
        }
        .leaf[aria-disabled="true"],
        .leaf:disabled {
          cursor: not-allowed;
          border-inline-start-color: var(--mvx-disabled-border);
          color: var(--mvx-disabled-fg);
          filter: saturate(0.88);
        }
        .leaf[aria-disabled="true"] .item-badge,
        .leaf:disabled .item-badge {
          border-color: var(--mvx-disabled-border);
          background: var(--mvx-disabled-bg);
          color: var(--mvx-disabled-fg);
        }
        .text {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .count,
        .item-badge {
          display: inline-grid;
          place-items: center;
          min-inline-size: 28px;
          min-block-size: 20px;
          border: 1px solid var(--mvx-border);
          border-radius: 999px;
          background: color-mix(in srgb, var(--mvx-bg-panel) 84%, transparent);
          color: var(--mvx-subtle);
          font-size: 11px;
          font-weight: 800;
          line-height: 1;
          padding: 0 8px;
          white-space: nowrap;
        }
        .item-badge {
          min-inline-size: auto;
          block-size: 20px;
          font-size: 11px;
        }
        .chevron {
          pointer-events: none;
          inline-size: 8px;
          block-size: 8px;
          border-block-start: 2px solid var(--mvx-accent-2);
          border-inline-end: 2px solid var(--mvx-accent-2);
          opacity: 0.72;
          transform: rotate(45deg);
          transition: transform var(--mvx-duration-fast), opacity var(--mvx-duration-fast);
        }
        .group[open] > .group-row .chevron {
          opacity: 1;
          transform: rotate(135deg) translate(-1px, 1px);
        }
        .children {
          display: grid;
          gap: 5px;
          margin-inline-start: 10px;
          border-inline-start: 1px solid var(--tree-guide-color);
          padding-block: 4px;
          padding-inline-start: 18px;
        }
        .empty {
          border: 1px dashed var(--mvx-border);
          border-radius: var(--mvx-radius-sm);
          color: var(--mvx-subtle);
          font-size: 13px;
          padding: 14px;
        }
      </style>
      <aside class="shell" part="sidebar">
        ${showSearch ? `
          <label class="search-wrap">
            <span class="search-label">${htmlEscape(this.t('search', 'Search'))}</span>
            <input type="search" value="${htmlEscape(query)}" placeholder="${htmlEscape(placeholder)}" autocomplete="off">
          </label>
        ` : ''}
        <nav aria-label="${htmlEscape(label)}" part="nav">
          ${items.length ? items.map(item => this.renderItem(item)).join('') : `<div class="empty">${htmlEscape(this.t('noResults', 'No matching items.'))}</div>`}
        </nav>
      </aside>
    `;

    this.shadowRoot.querySelector('input')?.addEventListener('input', event => {
      this.search(event.currentTarget.value);
    });
    this.shadowRoot.querySelectorAll('details[data-toggle]').forEach(details => {
      details.addEventListener('toggle', () => {
        const path = details.dataset.toggle;
        const item = findByPath(this.normalizedItems(), path);
        if (!item?.children?.length) return;
        this._openOverrides.set(String(path), details.open);
        this.emit('mvx-toggle', { item: publicItem(item), path: String(path), open: details.open });
      });
    });
    this.shadowRoot.querySelectorAll('[data-select]').forEach(element => {
      element.addEventListener('click', event => {
        if (element.getAttribute('aria-disabled') === 'true') {
          event.preventDefault();
          return;
        }
        this.select(element.dataset.select);
      });
    });
  }
}
