import { baseStyles, MvxElement, parseData, htmlEscape, safeUrl } from '../../core.js';

export class MvxDropdownMenu extends MvxElement {
  static observedAttributes = ['open', 'label', 'items', 'placement', 'disabled'];

  set items(value) {
    this._items = value;
    if (this.isConnected) this.render();
  }

  get items() {
    return parseData(this._items ?? this.getAttribute('items'), []);
  }

  toggle(force) {
    if (this.hasAttribute('disabled')) return;
    const open = force ?? !this.hasAttribute('open');
    this.toggleAttribute('open', open);
    this.emit(open ? 'mvx-open' : 'mvx-close', { open });
  }

  select(item) {
    if (item.disabled || item.separator) return;
    this.emit('mvx-select', { item, value: item.value ?? item.label ?? '' });
    if (!item.href) this.toggle(false);
  }

  render() {
    const label = this.getAttribute('label') || this.t('menu', 'Menu');
    const items = this.items.map(item => typeof item === 'string' ? { label: item, value: item } : item);
    this.shadowRoot.innerHTML = `
      <style>
        ${baseStyles}
        :host { position: relative; display: inline-block; }
        button.trigger {
          display: inline-flex;
          gap: 8px;
          align-items: center;
          min-block-size: 36px;
          border: 1px solid var(--mvx-border);
          border-radius: var(--mvx-radius-sm);
          background: var(--mvx-bg-panel);
          color: var(--mvx-fg);
          cursor: pointer;
          padding: 0 12px;
        }
        button.trigger::after { content: "⌄"; color: var(--mvx-subtle); }
        button.trigger:disabled {
          cursor: not-allowed;
          border-color: var(--mvx-disabled-border);
          background: var(--mvx-disabled-bg);
          color: var(--mvx-disabled-fg);
          box-shadow: var(--mvx-disabled-shadow);
          filter: saturate(0.88);
        }
        button.trigger:disabled::after {
          color: var(--mvx-disabled-fg);
        }
        .menu {
          position: absolute;
          z-index: 20;
          inset-block-start: calc(100% + 8px);
          inset-inline-start: 0;
          display: ${this.hasAttribute('open') ? 'grid' : 'none'};
          min-inline-size: 220px;
          max-block-size: 320px;
          overflow: auto;
          border: 1px solid var(--mvx-border);
          border-radius: var(--mvx-radius-md);
          background: var(--mvx-bg-panel);
          box-shadow: var(--mvx-shadow-raised);
          padding: 6px;
        }
        :host([placement="end"]) .menu {
          inset-inline-start: auto;
          inset-inline-end: 0;
        }
        .item {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 12px;
          align-items: center;
          min-block-size: 34px;
          border: 0;
          border-radius: var(--mvx-radius-sm);
          background: transparent;
          color: var(--mvx-muted);
          cursor: pointer;
          padding: 0 9px;
          text-align: start;
          text-decoration: none;
        }
        .item:not([aria-disabled="true"]):hover,
        .item:not([aria-disabled="true"]):focus-visible {
          background: color-mix(in srgb, var(--mvx-accent) 12%, var(--mvx-bg-inset));
          color: var(--mvx-fg);
          outline: none;
        }
        .shortcut { color: var(--mvx-subtle); font-family: var(--mvx-font-mono); font-size: 11px; }
        .separator { block-size: 1px; margin: 5px; background: var(--mvx-border); }
        .item[aria-disabled="true"] {
          cursor: not-allowed;
          background: transparent;
          color: var(--mvx-disabled-fg);
          box-shadow: none;
          filter: saturate(0.88);
        }
      </style>
      <button class="trigger" part="trigger" aria-haspopup="menu" aria-expanded="${this.hasAttribute('open')}" ${this.hasAttribute('disabled') ? 'disabled' : ''}>
        <slot name="trigger">${htmlEscape(label)}</slot>
      </button>
      <div class="menu" part="menu" role="menu" aria-label="${htmlEscape(label)}">
        ${items.map((item, index) => item.separator ? '<div class="separator" role="separator"></div>' : `
          ${item.href ? `<a class="item" role="menuitem" href="${htmlEscape(safeUrl(item.href))}" data-index="${index}" aria-disabled="${Boolean(item.disabled)}">` : `<button class="item" role="menuitem" data-index="${index}" aria-disabled="${Boolean(item.disabled)}">`}
            <span>${htmlEscape(item.label ?? item.value ?? '')}</span>
            ${item.shortcut ? `<span class="shortcut">${htmlEscape(item.shortcut)}</span>` : ''}
          ${item.href ? '</a>' : '</button>'}
        `).join('')}
      </div>
    `;
    this.shadowRoot.querySelector('.trigger').addEventListener('click', () => this.toggle());
    this.shadowRoot.querySelectorAll('.item').forEach(element => {
      element.addEventListener('click', event => {
        const item = items[Number(element.dataset.index)];
        if (item.disabled) {
          event.preventDefault();
          return;
        }
        this.select(item);
      });
    });
    this.shadowRoot.addEventListener('keydown', event => {
      if (event.key === 'Escape') this.toggle(false);
    });
  }
}
