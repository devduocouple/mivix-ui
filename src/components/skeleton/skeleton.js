import { baseStyles, MvxElement, htmlEscape } from '../../core.js';

export class MvxSkeleton extends MvxElement {
  static observedAttributes = ['lines', 'label'];

  render() {
    const lines = Math.max(1, Number(this.getAttribute('lines') || 3));
    const label = this.getAttribute('label') || this.t('loading', 'Loading');
    this.shadowRoot.innerHTML = `
      <style>
        ${baseStyles}
        :host { display: block; }
        .skeleton {
          display: grid;
          gap: 9px;
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
