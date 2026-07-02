import { baseStyles, MvxElement, toneMap, htmlEscape } from '../../core.js';

export class MvxToast extends MvxElement {
  static observedAttributes = ['tone', 'open'];

  connectedCallback() {
    super.connectedCallback();
    if (this.hasAttribute('open')) this.armTimer();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    clearTimeout(this._timer);
  }

  armTimer() {
    clearTimeout(this._timer);
    const duration = Number(this.getAttribute('duration') || 0);
    if (duration > 0) this._timer = setTimeout(() => this.close(), duration);
  }

  close() {
    this.removeAttribute('open');
    this.emit('mvx-close');
  }

  render() {
    const tone = toneMap[this.getAttribute('tone')] || toneMap.info;
    const closeLabel = this.t('close', 'Close');
    this.shadowRoot.innerHTML = `
      <style>
        ${baseStyles}
        :host {
          position: fixed;
          inset-inline-end: 20px;
          inset-block-end: 20px;
          z-index: 1200;
          display: ${this.hasAttribute('open') ? 'block' : 'none'};
        }
        :host([inline]) {
          position: relative;
          inset: auto;
          z-index: auto;
          display: block;
        }
        .toast {
          display: grid;
          grid-template-columns: 8px 1fr auto;
          gap: 12px;
          align-items: center;
          inline-size: min(380px, calc(100vw - 40px));
          border-radius: var(--mvx-radius-md);
          padding: 12px;
        }
        :host([inline]) .toast { inline-size: 100%; }
        .dot {
          inline-size: 8px;
          block-size: 8px;
          border-radius: 999px;
          background: ${tone};
          box-shadow: 0 0 14px ${tone};
        }
        button {
          border: 0;
          background: transparent;
          color: var(--mvx-muted);
          cursor: pointer;
          font-size: 18px;
        }
      </style>
      <div class="toast edge" part="toast" role="status">
        <span class="dot"></span>
        <div><slot></slot></div>
        <button aria-label="${htmlEscape(closeLabel)}">&times;</button>
      </div>
    `;
    this.armTimer();
    this.shadowRoot.querySelector('button')?.addEventListener('click', () => this.close());
  }
}
