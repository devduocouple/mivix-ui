import { baseStyles, MvxElement, parseData, htmlEscape } from '../../core.js';

export class MvxTabs extends MvxElement {
  static observedAttributes = ['tabs'];

  constructor() {
    super();
    this._active = 0;
  }

  set tabs(value) {
    this._tabs = value;
    if (this.isConnected) this.render();
  }

  get tabs() {
    return parseData(this._tabs ?? this.getAttribute('tabs'), []);
  }

  activate(index) {
    this._active = Math.max(0, Math.min(index, this.tabs.length - 1));
    this.emit('mvx-change', { active: this._active, tab: this.tabs[this._active] });
    this.render();
  }

  render() {
    const tabs = this.tabs;
    const activeTab = tabs[this._active] || {};
    const label = this.getAttribute('label') || this.t('tabs', 'Tabs');
    this.shadowRoot.innerHTML = `
      <style>
        ${baseStyles}
        :host { display: block; }
        .tabs {
          border-radius: var(--mvx-radius-md);
          overflow: hidden;
        }
        [role="tablist"] {
          display: flex;
          gap: 4px;
          overflow: auto;
          border-block-end: 1px solid var(--mvx-border);
          padding: 6px;
        }
        button {
          min-block-size: 34px;
          border: 0;
          border-radius: var(--mvx-radius-sm);
          background: transparent;
          color: var(--mvx-muted);
          cursor: pointer;
          padding: 0 12px;
          white-space: nowrap;
        }
        button[aria-selected="true"] {
          background: color-mix(in srgb, var(--mvx-accent) 18%, var(--mvx-bg-inset));
          color: var(--mvx-fg);
        }
        button:focus-visible {
          outline: none;
          box-shadow: var(--mvx-focus);
        }
        [role="tabpanel"] {
          color: var(--mvx-muted);
          line-height: 1.5;
          padding: 14px;
        }
      </style>
      <section class="tabs edge" part="tabs">
        <div role="tablist" aria-label="${htmlEscape(label)}">
          ${tabs.map((tab, index) => `
            <button role="tab" id="mvx-tab-${index}" aria-selected="${index === this._active}" aria-controls="mvx-panel-${index}" tabindex="${index === this._active ? '0' : '-1'}" data-index="${index}">
              ${htmlEscape(tab.label)}
            </button>
          `).join('')}
        </div>
        <div role="tabpanel" id="mvx-panel-${this._active}" aria-labelledby="mvx-tab-${this._active}">
          ${htmlEscape(activeTab.content || '')}
        </div>
      </section>
    `;
    this.shadowRoot.querySelectorAll('[role="tab"]').forEach(button => {
      button.addEventListener('click', () => this.activate(Number(button.dataset.index)));
      button.addEventListener('keydown', event => {
        if (event.key === 'ArrowRight') this.activate(this._active + 1);
        if (event.key === 'ArrowLeft') this.activate(this._active - 1);
      });
    });
  }
}
