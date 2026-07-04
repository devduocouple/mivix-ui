import { baseStyles, MvxElement, parseData, htmlEscape, safeUrl } from '../../core.js';

export class MvxNavbar extends MvxElement {
  static observedAttributes = ['brand', 'items', 'sticky', 'compact'];

  set items(value) {
    this._items = value;
    if (this.isConnected) this.render();
  }

  get items() {
    return parseData(this._items ?? this.getAttribute('items'), []);
  }

  render() {
    const brand = this.getAttribute('brand') || 'Mivix';
    const items = this.items.map(item => typeof item === 'string' ? { label: item, href: '#' } : item);
    this.shadowRoot.innerHTML = `
      <style>
        ${baseStyles}
        :host { display: block; }
        nav {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          align-items: center;
          justify-content: space-between;
          border: 1px solid var(--mvx-border);
          border-radius: var(--mvx-radius-md);
          background: color-mix(in srgb, var(--mvx-bg-panel) 94%, transparent);
          box-shadow: var(--mvx-shadow-soft);
          padding: ${this.hasAttribute('compact') ? '8px' : '10px 12px'};
        }
        :host([component-style="clean"]) nav {
          border-block-start: 0;
          border-inline: 0;
          border-radius: 0;
          background: transparent;
          box-shadow: none;
          padding: ${this.hasAttribute('compact') ? '4px 0' : '8px 0'};
        }
        :host([sticky]) nav {
          position: sticky;
          inset-block-start: 0;
          z-index: 10;
        }
        .brand {
          display: inline-flex;
          gap: 8px;
          align-items: center;
          color: var(--mvx-fg);
          font-weight: 850;
          text-decoration: none;
        }
        .mark {
          display: grid;
          place-items: center;
          inline-size: 28px;
          block-size: 28px;
          border-radius: var(--mvx-radius-sm);
          background: var(--mvx-accent);
          color: white;
        }
        :host([component-style="clean"]) .mark {
          border: 1px solid color-mix(in srgb, var(--mvx-accent) 54%, var(--mvx-border));
          background: transparent;
          color: var(--mvx-accent-2);
        }
        .links,
        .actions {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          align-items: center;
        }
        a {
          position: relative;
          border-radius: var(--mvx-radius-sm);
          color: var(--mvx-muted);
          font-size: 13px;
          font-weight: 650;
          padding: 8px 10px;
          text-decoration: none;
        }
        :host([component-style="clean"]) .links a {
          border-radius: 0;
          padding-inline: 2px;
        }
        :host([component-style="clean"]) .links a::after {
          content: "";
          position: absolute;
          inset-inline: 2px;
          inset-block-end: 2px;
          block-size: 2px;
          border-radius: 999px;
          background: transparent;
        }
        a:hover,
        a[aria-current="page"] {
          background: color-mix(in srgb, var(--mvx-accent) 12%, var(--mvx-bg-inset));
          color: var(--mvx-fg);
        }
        :host([component-style="clean"]) .links a:hover,
        :host([component-style="clean"]) .links a[aria-current="page"] {
          background: transparent;
          color: var(--mvx-accent-2);
        }
        :host([component-style="clean"]) .links a[aria-current="page"]::after {
          background: var(--mvx-accent);
        }
        a:focus-visible {
          outline: none;
          box-shadow: var(--mvx-focus);
        }
      </style>
      <nav part="navbar" aria-label="${htmlEscape(brand)}">
        <a class="brand" href="#">
          <slot name="brand"><span class="mark">${htmlEscape(brand.charAt(0).toUpperCase())}</span><span>${htmlEscape(brand)}</span></slot>
        </a>
        <div class="links">
          ${items.map((item, index) => `
            <a href="${htmlEscape(safeUrl(item.href || '#'))}" data-index="${index}" ${item.active ? 'aria-current="page"' : ''}>${htmlEscape(item.label || item.href || '')}</a>
          `).join('')}
        </div>
        <div class="actions"><slot name="actions"></slot></div>
      </nav>
    `;
    this.shadowRoot.querySelectorAll('.links a').forEach(link => {
      link.addEventListener('click', () => {
        const item = items[Number(link.dataset.index)];
        this.emit('mvx-select', { item, index: Number(link.dataset.index) });
      });
    });
  }
}
