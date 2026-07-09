import { baseStyles, MvxElement, parseData, htmlEscape } from '../../core.js';

export class MvxList extends MvxElement {
  static observedAttributes = ['items', 'selectable', 'value', 'dense', 'ordered', 'label'];

  set items(value) {
    this._items = value;
    if (this.isConnected) this.render();
  }

  get items() {
    return parseData(this._items ?? this.getAttribute('items'), []);
  }

  get value() {
    return this._value ?? this.getAttribute('value') ?? '';
  }

  select(item, index) {
    if (!this.hasAttribute('selectable') || item.disabled) return;
    this._value = String(item.value ?? item.label ?? index);
    this.setAttribute('value', this._value);
    this.emit('mvx-select', { item, index, value: this._value });
    this.render();
  }

  render() {
    const items = this.items.map(item => typeof item === 'string' ? { label: item } : item);
    const Tag = this.hasAttribute('ordered') ? 'ol' : 'ul';
    const selectable = this.hasAttribute('selectable');
    this.shadowRoot.innerHTML = `
      <style>
        ${baseStyles}
        :host { display: block; }
        ul, ol {
          display: grid;
          gap: ${this.hasAttribute('dense') ? '4px' : '7px'};
          margin: 0;
          padding: 0;
          list-style: none;
        }
        li {
          display: grid;
          grid-template-columns: auto minmax(0, 1fr) auto;
          gap: 10px;
          align-items: center;
          min-block-size: ${this.hasAttribute('dense') ? '34px' : '44px'};
          border: 1px solid var(--mvx-border);
          border-radius: var(--mvx-radius-sm);
          background: var(--mvx-bg-panel);
          color: var(--mvx-muted);
          padding: ${this.hasAttribute('dense') ? '6px 8px' : '8px 10px'};
        }
        li[aria-selected="true"] {
          border-color: color-mix(in srgb, var(--mvx-accent) 52%, var(--mvx-border));
          background: color-mix(in srgb, var(--mvx-accent) 11%, var(--mvx-bg-panel));
          color: var(--mvx-fg);
        }
        li.selectable {
          cursor: pointer;
        }
        li.selectable:not([aria-disabled="true"]):hover {
          border-color: var(--mvx-border-strong);
        }
        li[aria-disabled="true"] {
          cursor: not-allowed;
          border-color: var(--mvx-disabled-border);
          background: var(--mvx-disabled-bg);
          color: var(--mvx-disabled-fg);
          box-shadow: var(--mvx-disabled-shadow);
          filter: saturate(0.88);
        }
        li[aria-disabled="true"] .title,
        li[aria-disabled="true"] .description,
        li[aria-disabled="true"] .meta {
          color: var(--mvx-disabled-fg);
        }
        li[aria-disabled="true"] .media {
          color: var(--mvx-disabled-fg);
          background: color-mix(in srgb, var(--mvx-disabled-bg) 78%, transparent);
        }
        li:focus-visible {
          outline: none;
          box-shadow: var(--mvx-focus);
        }
        .media {
          display: grid;
          place-items: center;
          inline-size: 28px;
          block-size: 28px;
          border-radius: 999px;
          background: var(--mvx-bg-inset);
          color: var(--mvx-accent-2);
          font-size: 12px;
          font-weight: 800;
        }
        .copy { display: grid; gap: 2px; min-inline-size: 0; }
        .title { color: var(--mvx-fg); font-size: 13px; font-weight: 750; }
        .description { color: var(--mvx-subtle); font-size: 12px; line-height: 1.35; }
        .meta { color: var(--mvx-subtle); font-size: 11px; font-weight: 700; }
      </style>
      <${Tag} part="list" role="${selectable ? 'listbox' : 'list'}" aria-label="${htmlEscape(this.getAttribute('label') || this.t('list', 'List'))}">
        ${items.map((item, index) => {
          const value = String(item.value ?? item.label ?? index);
          const selected = value === String(this.value);
          const disabled = Boolean(item.disabled);
          return `
            <li role="${selectable ? 'option' : 'listitem'}" tabindex="${selectable && !disabled ? '0' : '-1'}" data-index="${index}" aria-selected="${selected}" aria-disabled="${disabled}" class="${selectable ? 'selectable' : ''}">
              <span class="media">${htmlEscape(item.avatar || item.icon || String(index + 1))}</span>
              <span class="copy">
                <span class="title">${htmlEscape(item.title || item.label || '')}</span>
                ${item.description ? `<span class="description">${htmlEscape(item.description)}</span>` : ''}
              </span>
              ${item.meta || item.badge ? `<span class="meta">${htmlEscape(item.meta || item.badge)}</span>` : ''}
            </li>
          `;
        }).join('')}
      </${Tag}>
    `;
    this.shadowRoot.querySelectorAll('li[data-index]').forEach(element => {
      element.addEventListener('click', () => this.select(items[Number(element.dataset.index)], Number(element.dataset.index)));
      element.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          this.select(items[Number(element.dataset.index)], Number(element.dataset.index));
        }
      });
    });
  }
}
