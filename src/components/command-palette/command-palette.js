import { baseStyles, MvxElement, parseData, htmlEscape } from '../../core.js';

export class MvxCommandPalette extends MvxElement {
  static observedAttributes = ['open', 'items', 'placeholder'];

  constructor() {
    super();
    this._query = '';
    this._active = 0;
  }

  set items(value) {
    this._items = value;
    if (this.isConnected) this.render();
  }

  get items() {
    return parseData(this._items ?? this.getAttribute('items'), []);
  }

  matches() {
    const query = this._query.toLowerCase();
    return this.items.filter(item => !query || `${item.label} ${item.group ?? ''}`.toLowerCase().includes(query)).slice(0, 8);
  }

  close() {
    this.removeAttribute('open');
    this.emit('mvx-close');
  }

  pick(item) {
    this.emit('mvx-select', { item });
    this.close();
  }

  render() {
    const items = this.matches();
    const placeholder = this.getAttribute('placeholder') || this.t('searchCommands', 'Search commands');
    const paletteLabel = this.t('commandPalette', 'Command palette');
    const noCommands = this.t('noCommands', 'No matching commands.');
    this.shadowRoot.innerHTML = `
      <style>
        ${baseStyles}
        :host { display: contents; }
        :host([inline]) { display: block; }
        .wrap {
          position: fixed;
          inset: 0;
          z-index: 1100;
          display: ${this.hasAttribute('open') ? 'grid' : 'none'};
          place-items: start center;
          padding: 12vh 18px 18px;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(8px);
        }
        :host([inline]) .wrap {
          position: relative;
          inset: auto;
          z-index: auto;
          display: ${this.hasAttribute('open') ? 'grid' : 'none'};
          place-items: stretch;
          padding: 0;
          background: transparent;
          backdrop-filter: none;
        }
        .panel {
          inline-size: min(680px, 100%);
          overflow: hidden;
          border-radius: var(--mvx-radius-lg);
        }
        :host([inline]) .panel {
          inline-size: 100%;
        }
        input {
          inline-size: 100%;
          min-block-size: 56px;
          border: 0;
          border-block-end: 1px solid var(--mvx-border);
          background: var(--mvx-bg-inset);
          color: var(--mvx-fg);
          padding: 0 18px;
          outline: none;
          font-size: 16px;
        }
        ul {
          margin: 0;
          padding: 8px;
          list-style: none;
          max-block-size: 380px;
          overflow: auto;
        }
        li {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 12px;
          align-items: center;
          min-block-size: 44px;
          padding: 8px 10px;
          border-radius: var(--mvx-radius-sm);
          color: var(--mvx-muted);
          cursor: pointer;
        }
        li[aria-selected="true"] {
          background: color-mix(in srgb, var(--mvx-accent) 17%, transparent);
          color: var(--mvx-fg);
        }
        kbd {
          border: 1px solid var(--mvx-border);
          border-radius: var(--mvx-radius-xs);
          background: var(--mvx-bg-inset);
          color: var(--mvx-subtle);
          padding: 2px 6px;
          font-family: var(--mvx-font-mono);
          font-size: 11px;
        }
        .empty {
          padding: 28px;
          color: var(--mvx-muted);
          text-align: center;
        }
      </style>
      <div class="wrap" part="backdrop">
        <section class="panel edge" part="panel" role="dialog" aria-modal="true" aria-label="${htmlEscape(paletteLabel)}">
          <input part="input" placeholder="${htmlEscape(placeholder)}" value="${htmlEscape(this._query)}" autocomplete="off" />
          ${items.length ? `<ul role="listbox">${items.map((item, index) => `
            <li role="option" aria-selected="${index === this._active}" data-index="${index}">
              <span>${htmlEscape(item.label)}</span>
              ${item.shortcut ? `<kbd>${htmlEscape(item.shortcut)}</kbd>` : ''}
            </li>`).join('')}</ul>` : `<div class="empty">${htmlEscape(noCommands)}</div>`}
        </section>
      </div>
    `;
    const input = this.shadowRoot.querySelector('input');
    input?.focus();
    input?.addEventListener('input', event => {
      this._query = event.target.value;
      this._active = 0;
      this.render();
    });
    input?.addEventListener('keydown', event => {
      if (event.key === 'Escape') this.close();
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        this._active = Math.min(items.length - 1, this._active + 1);
        this.render();
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        this._active = Math.max(0, this._active - 1);
        this.render();
      }
      if (event.key === 'Enter' && items[this._active]) this.pick(items[this._active]);
    });
    this.shadowRoot.querySelector('.wrap')?.addEventListener('click', event => {
      if (event.target.classList.contains('wrap')) this.close();
    });
    this.shadowRoot.querySelectorAll('li').forEach((row, index) => {
      row.addEventListener('click', () => this.pick(items[index]));
    });
  }
}
