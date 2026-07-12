import { baseStyles, MvxElement, htmlEscape } from '../../core.js';

export class MvxProgress extends MvxElement {
  static observedAttributes = ['value', 'label', 'animated', 'striped', 'indeterminate'];

  render() {
    const value = Math.max(0, Math.min(100, Number(this.getAttribute('value') || 0)));
    const indeterminate = this.hasAttribute('indeterminate');
    const label = this.getAttribute('label') || (indeterminate ? this.t('loading', 'Loading') : `${value}%`);
    const valueText = indeterminate ? this.t('inProgress', 'In progress') : `${value}%`;
    const ariaValue = indeterminate ? '' : ` aria-valuenow="${value}"`;
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
          position: relative;
          overflow: hidden;
          block-size: 9px;
          border: 1px solid var(--mvx-border);
          border-radius: 999px;
          background: var(--mvx-bg-inset);
        }
        .bar {
          position: relative;
          block-size: 100%;
          inline-size: ${value}%;
          background: linear-gradient(90deg, var(--mvx-accent), var(--mvx-accent-2));
          overflow: hidden;
          transition: inline-size var(--mvx-duration, 180ms) ease;
        }
        :host-context([data-mvx-variant="material"]) .bar {
          transition: inline-size var(--mvx-motion-duration-medium) var(--mvx-motion-easing-standard);
        }
        :host([striped]) .bar {
          background:
            repeating-linear-gradient(
              45deg,
              rgba(255, 255, 255, 0.22) 0 8px,
              transparent 8px 16px
            ),
            linear-gradient(90deg, var(--mvx-accent), var(--mvx-accent-2));
          background-size: 24px 24px, 100% 100%;
        }
        :host([animated]) .bar::after {
          content: "";
          position: absolute;
          inset-block: 0;
          inline-size: 42%;
          inset-inline-start: -48%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.42), transparent);
          animation: mvx-progress-shine 1.4s ease-in-out infinite;
        }
        :host-context([data-mvx-variant="material"]):host([animated]) .bar::after {
          display: none;
        }
        :host-context([data-mvx-variant="material"]):host([animated][striped]) .bar {
          animation: none;
        }
        :host([animated][striped]) .bar {
          animation: mvx-progress-stripes 850ms linear infinite;
        }
        :host([indeterminate]) .bar {
          inline-size: 38%;
          min-inline-size: 38%;
          animation: mvx-progress-indeterminate 1.2s ease-in-out infinite;
        }
        :host-context([data-mvx-variant="material"]):host([indeterminate]) .bar {
          animation: mvx-material-progress-indeterminate 1.6s var(--mvx-motion-easing-standard) infinite;
        }
        :host([indeterminate][striped]) .bar {
          animation:
            mvx-progress-indeterminate 1.2s ease-in-out infinite,
            mvx-progress-stripes 850ms linear infinite;
        }
        :host-context([data-mvx-variant="material"]):host([animated][striped]) .bar {
          animation: none;
        }
        :host-context([data-mvx-variant="material"]):host([indeterminate][striped]) .bar {
          animation: mvx-material-progress-indeterminate 1.6s var(--mvx-motion-easing-standard) infinite;
        }
        @keyframes mvx-progress-shine {
          to { inset-inline-start: 108%; }
        }
        @keyframes mvx-progress-stripes {
          to { background-position: 24px 0, 0 0; }
        }
        @keyframes mvx-progress-indeterminate {
          0% { transform: translateX(-110%); }
          48% { transform: translateX(82%); }
          100% { transform: translateX(260%); }
        }
        @keyframes mvx-material-progress-indeterminate {
          0% { transform: translateX(-130%) scaleX(0.35); }
          50% { transform: translateX(45%) scaleX(0.72); }
          100% { transform: translateX(260%) scaleX(0.35); }
        }
        @media (prefers-reduced-motion: reduce) {
          .bar,
          :host([animated]) .bar,
          :host([indeterminate]) .bar {
            animation: none;
            transition: none;
          }
          :host([animated]) .bar::after {
            display: none;
          }
        }
      </style>
      <div class="wrap" part="progress" role="progressbar" aria-label="${htmlEscape(label)}" aria-valuemin="0" aria-valuemax="100"${ariaValue}>
        <div class="meta"><span>${htmlEscape(label)}</span><span>${htmlEscape(valueText)}</span></div>
        <div class="track"><div class="bar"></div></div>
      </div>
    `;
  }
}
