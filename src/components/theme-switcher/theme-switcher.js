import { applyDocumentTheme, baseStyles, MvxElement, htmlEscape, restoreDocumentTheme } from '../../core.js';

export class MvxThemeSwitcher extends MvxElement {
  static observedAttributes = ['themes', 'open'];

  get themes() {
    return (this.getAttribute('themes') || 'dark,light,graphite,aurora,terminal').split(',').map(theme => theme.trim()).filter(Boolean);
  }

  get themeLabels() {
    return {
      dark: 'Dark',
      light: 'Light',
      graphite: 'Graphite Forge',
      aurora: 'Aurora Flux',
      terminal: 'Terminal Bloom'
    };
  }

  connectedCallback() {
    restoreDocumentTheme();
    super.connectedCallback();
    this._onDocumentClick = event => {
      if (!event.composedPath().includes(this)) this.removeAttribute('open');
    };
    this._onThemeChange = () => {
      if (this.isConnected) this.render();
    };
    document.addEventListener('click', this._onDocumentClick);
    document.addEventListener('mvx-theme-change', this._onThemeChange);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('click', this._onDocumentClick);
    document.removeEventListener('mvx-theme-change', this._onThemeChange);
  }

  render() {
    const active = document.documentElement.getAttribute('data-mvx-theme') || 'graphite';
    const selectTheme = this.t('selectTheme', 'Select theme');
    this.shadowRoot.innerHTML = `
      <style>
        ${baseStyles}
        :host {
          position: relative;
          display: inline-flex;
        }
        .trigger {
          display: grid;
          place-items: center;
          inline-size: 36px;
          block-size: 36px;
          border: 1px solid var(--mvx-border);
          border-radius: var(--mvx-radius-sm);
          background: var(--mvx-bg-inset);
          color: var(--mvx-muted);
          cursor: pointer;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
        }
        .trigger:hover,
        .trigger[aria-expanded="true"] {
          border-color: color-mix(in srgb, var(--mvx-accent) 58%, var(--mvx-border));
          color: var(--mvx-accent-2);
        }
        button:focus-visible {
          outline: none;
          box-shadow: var(--mvx-focus);
        }
        .menu {
          position: absolute;
          inset-block-start: calc(100% + 8px);
          inset-inline-end: 0;
          z-index: 20;
          display: none;
          gap: 4px;
          inline-size: 220px;
          border: 1px solid var(--mvx-border);
          border-radius: var(--mvx-radius-md);
          background: var(--mvx-bg-panel);
          box-shadow: var(--mvx-shadow-raised);
          padding: 8px;
        }
        :host([open]) .menu {
          display: grid;
        }
        .option {
          display: grid;
          grid-template-columns: auto 1fr auto;
          gap: 9px;
          align-items: center;
          min-block-size: 38px;
          border: 0;
          border-radius: var(--mvx-radius-sm);
          background: transparent;
          color: var(--mvx-fg);
          cursor: pointer;
          padding: 0 9px;
          text-align: start;
        }
        .option:hover,
        .option[aria-current="true"] {
          background: color-mix(in srgb, var(--mvx-accent) 20%, var(--mvx-bg-panel));
        }
        .swatch {
          inline-size: 16px;
          block-size: 16px;
          border: 1px solid var(--mvx-border-strong);
          border-radius: 999px;
          background: var(--swatch);
        }
        .name {
          display: grid;
          gap: 2px;
        }
        .name small {
          color: var(--mvx-subtle);
          font-size: 11px;
        }
      </style>
      <button class="trigger" part="button" aria-label="${htmlEscape(selectTheme)}" aria-haspopup="menu" aria-expanded="${this.hasAttribute('open')}" title="${htmlEscape(selectTheme)}">
        ◐
      </button>
      <div class="menu" part="menu" role="menu">
        ${this.themes.map(theme => {
          const swatch = {
            dark: '#3377ff',
            graphite: '#3377ff',
            light: '#f6f7f9',
            aurora: '#38d6b6',
            terminal: '#37e878'
          }[theme] || 'var(--mvx-accent)';
          return `
            <button class="option" role="menuitemradio" aria-checked="${theme === active}" aria-current="${theme === active}" data-theme="${htmlEscape(theme)}" style="--swatch: ${swatch}">
              <span class="swatch" aria-hidden="true"></span>
              <span class="name">${htmlEscape(this.themeLabels[theme] || theme)}<small>${htmlEscape(theme)}</small></span>
              <span aria-hidden="true">${theme === active ? '✓' : ''}</span>
            </button>
          `;
        }).join('')}
      </div>
    `;
    this.shadowRoot.querySelector('.trigger').addEventListener('click', event => {
      event.stopPropagation();
      this.toggleAttribute('open');
    });
    this.shadowRoot.querySelectorAll('.option').forEach(button => {
      button.addEventListener('click', () => {
        applyDocumentTheme(button.getAttribute('data-theme'), { persist: true });
        this.removeAttribute('open');
        this.render();
      });
    });
  }
}
