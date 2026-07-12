import { baseStyles, MvxElement, htmlEscape } from '../../core.js';

export class MvxSkeleton extends MvxElement {
  static observedAttributes = ['lines', 'label', 'width', 'height'];

  render() {
    const lines = Math.max(1, Number(this.getAttribute('lines') || 3));
    const label = this.getAttribute('label') || this.t('loading', 'Loading');
    const width = this.skeletonLength(this.getAttribute('width'));
    const height = this.skeletonLength(this.getAttribute('height'));
    this.shadowRoot.innerHTML = `
      <style>
        ${baseStyles}
        :host {
          display: block;
          min-inline-size: 0;
          ${width ? `inline-size: ${width};` : ''}
          ${height ? `block-size: ${height};` : ''}
          ${width ? `overflow-x: hidden;` : ''}
          ${height ? `overflow-y: hidden;` : ''}
        }
        .skeleton {
          display: grid;
          gap: 9px;
          inline-size: 100%;
          block-size: 100%;
          padding: 2px 0;
        }
        span {
          display: block;
          block-size: 12px;
          border-radius: 999px;
          background: linear-gradient(90deg, var(--mvx-bg-inset), color-mix(in srgb, var(--mvx-border) 56%, var(--mvx-bg-panel)), var(--mvx-bg-inset));
          background-size: 220% 100%;
          animation: pulse 1.4s ease-in-out infinite;
        }
        span:last-child { inline-size: 72%; }
        @keyframes pulse {
          0% { background-position: 100% 0; }
          100% { background-position: -100% 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          span { animation: none; }
        }
      </style>
      <div class="skeleton" part="skeleton" role="status" aria-label="${htmlEscape(label)}">
        ${Array.from({ length: lines }, () => '<span></span>').join('')}
      </div>
    `;
  }
}
