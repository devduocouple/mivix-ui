import { baseStyles, MvxElement, htmlEscape } from '../../core.js';

export class MvxModal extends MvxElement {
  static observedAttributes = ['open', 'label'];

  connectedCallback() {
    super.connectedCallback();
    this._onKey = event => {
      if (event.key === 'Escape' && this.hasAttribute('open')) this.close();
    };
    document.addEventListener('keydown', this._onKey);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('keydown', this._onKey);
  }

  close() {
    this.removeAttribute('open');
    this.emit('mvx-close');
  }

  render() {
    const label = this.getAttribute('label') || this.getAttribute('title') || this.t('dialog', 'Dialog');
    const closeLabel = this.t('close', 'Close');
    this.shadowRoot.innerHTML = `
      <style>
        ${baseStyles}
        :host { display: contents; }
        .wrap {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: ${this.hasAttribute('open') ? 'grid' : 'none'};
          place-items: center;
          padding: 24px;
        }
        :host([inline]) { display: block; }
        :host([inline]) .wrap {
          position: relative;
          inset: auto;
          z-index: auto;
          display: ${this.hasAttribute('open') ? 'grid' : 'none'};
          padding: 0;
        }
        .backdrop {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.58);
          backdrop-filter: blur(10px);
        }
        :host([inline]) .backdrop { display: none; }
        .panel {
          position: relative;
          z-index: 1;
          inline-size: min(620px, 100%);
          max-block-size: min(720px, calc(100vh - 48px));
          overflow: auto;
          border-radius: var(--mvx-radius-lg);
          padding: 20px;
        }
        :host([inline]) .panel {
          inline-size: 100%;
          max-block-size: none;
        }
        header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-block-end: 16px;
        }
        h2 { margin: 0; font-size: 18px; }
        button {
          border: 1px solid var(--mvx-border);
          border-radius: var(--mvx-radius-sm);
          background: var(--mvx-bg-inset);
          color: var(--mvx-muted);
          cursor: pointer;
          inline-size: 32px;
          block-size: 32px;
        }
      </style>
      <div class="wrap" role="presentation">
        <div class="backdrop" part="backdrop"></div>
        <section class="panel edge" part="panel" role="dialog" aria-modal="true" aria-label="${htmlEscape(label)}">
          <header>
            <h2>${htmlEscape(label)}</h2>
            <button part="close" aria-label="${htmlEscape(closeLabel)}">&times;</button>
          </header>
          <slot></slot>
        </section>
      </div>
    `;
    this.shadowRoot.querySelector('.backdrop')?.addEventListener('click', () => this.close());
    this.shadowRoot.querySelector('button')?.addEventListener('click', () => this.close());
  }
}
