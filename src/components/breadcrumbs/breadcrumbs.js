import { baseStyles, MvxElement, parseData, htmlEscape, safeUrl } from '../../core.js';

export class MvxBreadcrumbs extends MvxElement {
  static observedAttributes = ['items'];

  set items(value) {
    this._items = value;
    if (this.isConnected) this.render();
  }

  get items() {
    return parseData(this._items ?? this.getAttribute('items'), []);
  }

  render() {
    const items = this.items;
    const breadcrumbLabel = this.t('breadcrumb', 'Breadcrumb');
    this.shadowRoot.innerHTML = `
      <style>
        ${baseStyles}
        nav { display: block; }
        ol {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
          align-items: center;
          margin: 0;
          padding: 0;
          list-style: none;
        }
        li {
          display: inline-flex;
          gap: 7px;
          align-items: center;
          color: var(--mvx-muted);
          font-size: 13px;
        }
        a {
          color: var(--mvx-muted);
          text-decoration: none;
        }
        a:hover, a:focus-visible {
          color: var(--mvx-accent-2);
          outline: none;
        }
      </style>
      <nav aria-label="${htmlEscape(breadcrumbLabel)}" part="breadcrumbs">
        <ol>
          ${items.map((item, index) => `
            <li>
              ${index ? '<span aria-hidden="true">/</span>' : ''}
              ${index === items.length - 1 ? `<span aria-current="page">${htmlEscape(item.label)}</span>` : `<a href="${htmlEscape(safeUrl(item.href || '#'))}">${htmlEscape(item.label)}</a>`}
            </li>
          `).join('')}
        </ol>
      </nav>
    `;
  }
}
