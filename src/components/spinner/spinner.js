import { baseStyles, MvxElement, htmlEscape } from '../../core.js';

export class MvxSpinner extends MvxElement {
  static observedAttributes = ['label', 'size', 'tone', 'variant'];

  render() {
    const label = this.getAttribute('label') || this.t('loading', 'Loading');
    const size = this.getAttribute('size') || 'md';
    const tone = this.getAttribute('tone') || 'accent';
    const variant = this.getAttribute('variant') || 'ring';
    const px = size === 'sm' ? 18 : size === 'lg' ? 38 : 26;
    this.shadowRoot.innerHTML = `
      <style>
        ${baseStyles}
        :host {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: var(--mvx-muted);
        }
        .spinner {
          inline-size: ${px}px;
          block-size: ${px}px;
          color: ${tone === 'success' ? 'var(--mvx-success)' : tone === 'danger' ? 'var(--mvx-danger)' : tone === 'warning' ? 'var(--mvx-warning)' : 'var(--mvx-accent)'};
        }
        .ring {
          border: 2px solid color-mix(in srgb, currentColor 22%, transparent);
          border-block-start-color: currentColor;
          border-radius: 999px;
          animation: spin 780ms linear infinite;
        }
        .dots {
          display: inline-grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 3px;
          align-items: center;
        }
        .dots span {
          inline-size: 6px;
          block-size: 6px;
          border-radius: 999px;
          background: currentColor;
          animation: pulse 900ms ease-in-out infinite;
        }
        .dots span:nth-child(2) { animation-delay: 120ms; }
        .dots span:nth-child(3) { animation-delay: 240ms; }
        .label { font-size: 13px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse {
          0%, 80%, 100% { opacity: 0.35; transform: scale(0.72); }
          40% { opacity: 1; transform: scale(1); }
        }
        @media (prefers-reduced-motion: reduce) {
          .spinner,
          .dots span { animation: none; }
        }
      </style>
      <span class="spinner ${variant === 'dots' ? 'dots' : 'ring'}" part="spinner" role="status" aria-label="${htmlEscape(label)}">
        ${variant === 'dots' ? '<span></span><span></span><span></span>' : ''}
      </span>
      ${label ? `<span class="label">${htmlEscape(label)}</span>` : ''}
    `;
  }
}
