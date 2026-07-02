import { baseStyles, MvxElement, htmlEscape } from '../../core.js';

export class MvxTooltip extends MvxElement {
  static observedAttributes = ['text'];

  render() {
    const text = this.getAttribute('text') || '';
    this.shadowRoot.innerHTML = `
      <style>
        ${baseStyles}
        :host { display: inline-flex; position: relative; }
        .trigger {
          display: inline-flex;
        }
        .tip {
          position: absolute;
          inset-block-end: calc(100% + 8px);
          inset-inline-start: 50%;
          z-index: 10;
          inline-size: max-content;
          max-inline-size: 220px;
          transform: translateX(-50%);
          border: 1px solid var(--mvx-border);
          border-radius: var(--mvx-radius-sm);
          background: var(--mvx-bg-inset);
          color: var(--mvx-fg);
          box-shadow: var(--mvx-shadow-soft);
          font-size: 12px;
          line-height: 1.35;
          opacity: 0;
          pointer-events: none;
          padding: 7px 9px;
          transition: opacity var(--mvx-duration-fast);
        }
        :host(:hover) .tip,
        :host(:focus-within) .tip {
          opacity: 1;
        }
      </style>
      <span class="trigger" part="trigger" aria-describedby="mvx-tooltip"><slot></slot></span>
      <span id="mvx-tooltip" class="tip" role="tooltip" part="tooltip">${htmlEscape(text)}</span>
    `;
  }
}
