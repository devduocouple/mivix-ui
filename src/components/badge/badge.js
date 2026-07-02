import { baseStyles, MvxElement, toneMap } from '../../core.js';

export class MvxBadge extends MvxElement {
  static observedAttributes = ['tone'];

  render() {
    const tone = toneMap[this.getAttribute('tone')] || 'var(--mvx-accent)';
    this.shadowRoot.innerHTML = `
      <style>
        ${baseStyles}
        :host { display: inline-flex; }
        span {
          display: inline-grid;
          place-items: center;
          min-block-size: 22px;
          padding: 0 8px;
          border: 1px solid color-mix(in srgb, ${tone} 42%, transparent);
          border-radius: 999px;
          background: color-mix(in srgb, ${tone} 15%, transparent);
          color: color-mix(in srgb, ${tone} 78%, var(--mvx-fg));
          font-size: 12px;
          font-weight: 700;
          white-space: nowrap;
        }
      </style>
      <span part="badge"><slot></slot></span>
    `;
  }
}
