import { baseStyles, MvxElement, parseData, htmlEscape } from '../../core.js';

export class MvxAccordion extends MvxElement {
  static observedAttributes = ['items', 'multiple'];

  constructor() {
    super();
    this._open = new Set([0]);
  }

  set items(value) {
    this._items = value;
    if (this.isConnected) this.render();
  }

  get items() {
    return parseData(this._items ?? this.getAttribute('items'), []);
  }

  toggle(index) {
    if (this.hasAttribute('multiple')) {
      this._open.has(index) ? this._open.delete(index) : this._open.add(index);
    } else {
      this._open = this._open.has(index) ? new Set() : new Set([index]);
    }
    this.emit('mvx-change', { open: [...this._open] });
    this.render();
  }

  render() {
    const items = this.items;
    this.shadowRoot.innerHTML = `
      <style>
        ${baseStyles}
        :host { display: block; }
        .accordion {
          overflow: hidden;
          border-radius: var(--mvx-radius-md);
        }
        .item + .item {
          border-block-start: 1px solid var(--mvx-border);
        }
        button {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          inline-size: 100%;
          border: 0;
          background: transparent;
          color: var(--mvx-fg);
          cursor: pointer;
          padding: 13px 14px;
          text-align: start;
        }
        button:focus-visible {
          outline: none;
          box-shadow: inset var(--mvx-focus);
        }
        .panel {
          color: var(--mvx-muted);
          line-height: 1.5;
          padding: 0 14px 14px;
        }
      </style>
      <section class="accordion edge" part="accordion">
        ${items.map((item, index) => {
          const open = this._open.has(index);
          const id = `mvx-accordion-${index}`;
          return `
            <div class="item">
              <button id="${id}-button" aria-expanded="${open}" aria-controls="${id}-panel" data-index="${index}">
                <span>${htmlEscape(item.title)}</span>
                <span aria-hidden="true">${open ? '-' : '+'}</span>
              </button>
              <div id="${id}-panel" class="panel" role="region" aria-labelledby="${id}-button" ${open ? '' : 'hidden'}>${htmlEscape(item.content)}</div>
            </div>
          `;
        }).join('')}
      </section>
    `;
    this.shadowRoot.querySelectorAll('button').forEach(button => {
      button.addEventListener('click', () => this.toggle(Number(button.dataset.index)));
    });
  }
}
