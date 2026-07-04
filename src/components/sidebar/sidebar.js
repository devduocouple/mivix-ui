import { baseStyles, MvxElement, parseData, htmlEscape, safeUrl } from '../../core.js';

export class MvxSidebar extends MvxElement {
  static observedAttributes = ['items', 'label', 'collapsed', 'compact'];

  set items(value) {
    this._items = value;
    if (this.isConnected) this.render();
  }

  get items() {
    return parseData(this._items ?? this.getAttribute('items'), []);
  }

  select(item, index) {
    this.emit('mvx-select', { item, index, value: item.value ?? item.href ?? item.label ?? '' });
  }

  renderItem(item, index) {
    const children = Array.isArray(item.children) ? item.children : [];
    if (children.length) {
      return `
        <details ${item.open ? 'open' : ''}>
          <summary>${htmlEscape(item.label || '')}</summary>
          <div class="children">
            ${children.map((child, childIndex) => this.renderItem(child, `${index}-${childIndex}`)).join('')}
          </div>
        </details>
      `;
    }
    return `
      <a href="${htmlEscape(safeUrl(item.href || '#'))}" data-index="${htmlEscape(index)}" ${item.active ? 'aria-current="page"' : ''}>
        <span>${htmlEscape(item.icon || '')}</span>
        <span class="label">${htmlEscape(item.label || item.href || '')}</span>
        ${item.badge ? `<small>${htmlEscape(item.badge)}</small>` : ''}
      </a>
    `;
  }

  render() {
    const label = this.getAttribute('label') || this.t('sidebar', 'Sidebar');
    const items = this.items.map(item => typeof item === 'string' ? { label: item, href: '#' } : item);
    this.shadowRoot.innerHTML = `
      <style>
        ${baseStyles}
        :host { display: block; inline-size: ${this.hasAttribute('collapsed') ? '72px' : '260px'}; }
        aside {
          display: grid;
          gap: 8px;
          min-block-size: 100%;
          border: 1px solid var(--mvx-border);
          border-radius: var(--mvx-radius-md);
          background: var(--mvx-bg-panel);
          padding: ${this.hasAttribute('compact') ? '8px' : '12px'};
        }
        :host([component-style="clean"]) aside {
          border: 0;
          border-radius: 0;
          background: transparent;
          box-shadow: none;
          padding: ${this.hasAttribute('compact') ? '4px' : '6px'};
        }
        .title {
          color: var(--mvx-subtle);
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
        }
        nav {
          display: grid;
          gap: 4px;
        }
        a,
        summary {
          display: grid;
          grid-template-columns: 18px minmax(0, 1fr) auto;
          gap: 8px;
          align-items: center;
          min-block-size: 34px;
          border-radius: var(--mvx-radius-sm);
          color: var(--mvx-muted);
          cursor: pointer;
          font-size: 13px;
          font-weight: 650;
          padding: 0 9px;
          text-decoration: none;
        }
        :host([component-style="clean"]) a,
        :host([component-style="clean"]) summary {
          border-inline-start: 2px solid transparent;
          border-radius: 0 var(--mvx-radius-xs) var(--mvx-radius-xs) 0;
          background: transparent;
          padding-inline-start: 10px;
        }
        summary { grid-template-columns: minmax(0, 1fr); }
        a:hover,
        summary:hover,
        a[aria-current="page"] {
          background: color-mix(in srgb, var(--mvx-accent) 12%, var(--mvx-bg-inset));
          color: var(--mvx-fg);
        }
        :host([component-style="clean"]) a:hover,
        :host([component-style="clean"]) summary:hover {
          background: color-mix(in srgb, var(--mvx-accent) 7%, transparent);
          color: var(--mvx-fg);
        }
        :host([component-style="clean"]) a[aria-current="page"] {
          border-inline-start-color: var(--mvx-accent);
          background: transparent;
          color: var(--mvx-accent-2);
        }
        a:focus-visible,
        summary:focus-visible {
          outline: none;
          box-shadow: var(--mvx-focus);
        }
        .children {
          display: grid;
          gap: 3px;
          margin-inline-start: 14px;
          border-inline-start: 1px solid var(--mvx-border);
          padding-inline-start: 8px;
        }
        :host([component-style="clean"]) .children {
          border-inline-start-color: color-mix(in srgb, var(--mvx-border) 62%, transparent);
        }
        small {
          border: 1px solid var(--mvx-border);
          border-radius: 999px;
          color: var(--mvx-subtle);
          font-size: 10px;
          padding: 2px 6px;
        }
        :host([collapsed]) .label,
        :host([collapsed]) .title,
        :host([collapsed]) small {
          display: none;
        }
      </style>
      <aside part="sidebar">
        <slot name="header"><span class="title">${htmlEscape(label)}</span></slot>
        <nav aria-label="${htmlEscape(label)}">
          ${items.map((item, index) => this.renderItem(item, index)).join('')}
        </nav>
        <slot name="footer"></slot>
      </aside>
    `;
    this.shadowRoot.querySelectorAll('a[data-index]').forEach(link => {
      link.addEventListener('click', () => {
        const path = String(link.dataset.index).split('-').map(Number);
        let item = items[path[0]];
        path.slice(1).forEach(part => {
          item = item?.children?.[part];
        });
        this.select(item || {}, link.dataset.index);
      });
    });
  }
}
