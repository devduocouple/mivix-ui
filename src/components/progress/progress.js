import { baseStyles, MvxElement, htmlEscape } from '../../core.js';

export class MvxProgress extends MvxElement {
  static observedAttributes = ['value', 'label'];

  render() {
    const value = Math.max(0, Math.min(100, Number(this.getAttribute('value') || 0)));
    const label = this.getAttribute('label') || `${value}%`;
    this.shadowRoot.innerHTML = `
      <style>
        ${baseStyles}
        .wrap {
          display: grid;
          gap: 8px;
        }
        .meta {
          display: flex;
          justify-content: space-between;
          color: var(--mvx-muted);
          font-size: 13px;
        }
        .track {
          overflow: hidden;
          block-size: 9px;
          border: 1px solid var(--mvx-border);
          border-radius: 999px;
          background: var(--mvx-bg-inset);
        }
        .bar {
          block-size: 100%;
          inline-size: ${value}%;
          background: linear-gradient(90deg, var(--mvx-accent), var(--mvx-accent-2));
        }
      </style>
      <div class="wrap" part="progress" role="progressbar" aria-label="${htmlEscape(label)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${value}">
        <div class="meta"><span>${htmlEscape(label)}</span><span>${value}%</span></div>
        <div class="track"><div class="bar"></div></div>
      </div>
    `;
  }
}
