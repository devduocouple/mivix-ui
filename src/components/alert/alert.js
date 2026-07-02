import { baseStyles, MvxElement, toneMap, htmlEscape } from '../../core.js';

export class MvxAlert extends MvxElement {
  static observedAttributes = ['tone', 'title', 'closable'];

  render() {
    const tone = toneMap[this.getAttribute('tone')] || toneMap.info;
    const title = this.getAttribute('title');
    const closable = this.hasAttribute('closable');
    const closeLabel = this.t('close', 'Close');
    this.shadowRoot.innerHTML = `
      <style>
        ${baseStyles}
        :host { display: block; }
        .alert {
          display: grid;
          grid-template-columns: 4px 1fr auto;
          gap: 14px;
          align-items: start;
          border: 1px solid var(--mvx-border);
          border-radius: var(--mvx-radius-md);
          background: color-mix(in srgb, ${tone} 8%, var(--mvx-bg-panel));
          padding: 14px;
          box-shadow: var(--mvx-shadow-soft);
        }
        .stripe {
          inline-size: 4px;
          block-size: 100%;
          min-block-size: 34px;
          border-radius: 999px;
          background: ${tone};
        }
        strong {
          display: block;
          margin-block-end: 4px;
        }
        .content {
          color: var(--mvx-muted);
          line-height: 1.45;
        }
        button {
          border: 0;
          background: transparent;
          color: var(--mvx-muted);
          cursor: pointer;
          font-size: 20px;
          line-height: 1;
        }
      </style>
      <div part="alert" class="alert" role="status">
        <div class="stripe"></div>
        <div class="content">${title ? `<strong>${htmlEscape(title)}</strong>` : ''}<slot></slot></div>
        ${closable ? `<button aria-label="${htmlEscape(closeLabel)}" part="close">&times;</button>` : ''}
      </div>
    `;
    this.shadowRoot.querySelector('button')?.addEventListener('click', () => {
      this.emit('mvx-close');
      this.remove();
    });
  }
}
