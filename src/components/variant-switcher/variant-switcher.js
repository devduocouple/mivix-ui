import { applyDocumentVariant, baseStyles, MvxElement, htmlEscape, normalizeVariant, restoreDocumentVariant, supportedVariants } from '../../core.js';

export class MvxVariantSwitcher extends MvxElement {
  static observedAttributes = ['variants', 'open'];

  get variants() {
    const variants = (this.getAttribute('variants') || supportedVariants.join(','))
      .split(',')
      .map(variant => variant.trim())
      .filter(variant => supportedVariants.includes(variant));
    return variants.length ? variants : supportedVariants;
  }

  get variantLabels() {
    return {
      mivix: 'Mivix',
      material: 'Material'
    };
  }

  connectedCallback() {
    restoreDocumentVariant();
    super.connectedCallback();
    this._onDocumentClick = event => {
      if (!event.composedPath().includes(this)) this.removeAttribute('open');
    };
    this._onVariantChange = () => {
      if (this.isConnected) this.render();
    };
    this._onControlOpen = event => {
      if (event.detail?.source !== this) this.removeAttribute('open');
    };
    this._onViewportChange = () => this.updateMenuPosition();
    document.addEventListener('click', this._onDocumentClick);
    document.addEventListener('mvx-variant-change', this._onVariantChange);
    document.addEventListener('mvx-control-open', this._onControlOpen);
    window.addEventListener('resize', this._onViewportChange);
    window.addEventListener('scroll', this._onViewportChange, true);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('click', this._onDocumentClick);
    document.removeEventListener('mvx-variant-change', this._onVariantChange);
    document.removeEventListener('mvx-control-open', this._onControlOpen);
    window.removeEventListener('resize', this._onViewportChange);
    window.removeEventListener('scroll', this._onViewportChange, true);
  }

  updateMenuPosition() {
    if (!this.hasAttribute('open') || typeof window === 'undefined') return;
    const trigger = this.shadowRoot?.querySelector('.trigger');
    const menu = this.shadowRoot?.querySelector('.menu');
    if (!trigger || !menu) return;
    const margin = 8;
    const rect = trigger.getBoundingClientRect();
    const width = Math.min(220, Math.max(160, window.innerWidth - margin * 2));
    menu.style.setProperty('--menu-width', `${width}px`);
    const height = menu.offsetHeight || 110;
    const left = Math.min(Math.max(rect.right - width, margin), Math.max(margin, window.innerWidth - width - margin));
    const below = rect.bottom + margin;
    const top = below + height <= window.innerHeight - margin
      ? below
      : Math.max(margin, rect.top - height - margin);
    menu.style.setProperty('--menu-left', `${left}px`);
    menu.style.setProperty('--menu-top', `${top}px`);
  }

  render() {
    const active = normalizeVariant(document.documentElement.getAttribute('data-mvx-variant') || 'mivix');
    const selectVariant = this.t('selectVariant', 'Select variant');
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
          position: fixed;
          inset: auto;
          inset-block-start: var(--menu-top, 0px);
          inset-inline-start: var(--menu-left, 0px);
          z-index: 1000;
          display: none;
          gap: 4px;
          inline-size: var(--menu-width, min(220px, calc(100vw - 16px)));
          max-block-size: calc(100vh - 16px);
          overflow: auto;
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
        .shape {
          inline-size: 18px;
          block-size: 18px;
          border: 1px solid var(--mvx-border-strong);
          border-radius: var(--shape-radius);
          background: color-mix(in srgb, var(--mvx-accent) 24%, var(--mvx-bg-inset));
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.14);
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
      <button class="trigger" part="button" aria-label="${htmlEscape(selectVariant)}" aria-haspopup="menu" aria-expanded="${this.hasAttribute('open')}" title="${htmlEscape(selectVariant)}">
        ◈
      </button>
      <div class="menu" part="menu" role="menu">
        ${this.variants.map(variant => {
          const shapeRadius = {
            mivix: '6px',
            material: '12px'
          }[variant] || 'var(--mvx-radius-sm)';
          return `
            <button class="option" role="menuitemradio" aria-checked="${variant === active}" aria-current="${variant === active}" data-variant="${htmlEscape(variant)}" style="--shape-radius: ${shapeRadius}">
              <span class="shape" aria-hidden="true"></span>
              <span class="name">${htmlEscape(this.variantLabels[variant] || variant)}<small>${htmlEscape(variant)}</small></span>
              <span aria-hidden="true">${variant === active ? '✓' : ''}</span>
            </button>
          `;
        }).join('')}
      </div>
    `;
    this.shadowRoot.querySelector('.trigger').addEventListener('click', event => {
      event.stopPropagation();
      if (this.hasAttribute('open')) {
        this.removeAttribute('open');
        return;
      }
      document.dispatchEvent(new CustomEvent('mvx-control-open', { detail: { source: this, type: 'variant' } }));
      this.setAttribute('open', '');
      requestAnimationFrame(() => this.updateMenuPosition());
    });
    this.shadowRoot.querySelectorAll('.option').forEach(button => {
      button.addEventListener('click', () => {
        applyDocumentVariant(button.getAttribute('data-variant'), { persist: true });
        this.removeAttribute('open');
        this.render();
      });
    });
  }
}
