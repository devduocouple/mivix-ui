import { baseStyles, MvxElement, htmlEscape } from '../../core.js';

export class MvxIconButton extends MvxElement {
  static observedAttributes = ['label', 'disabled', 'pressed', 'motion'];

  render() {
    const label = this.getAttribute('label') || 'Action';
    const pressed = this.hasAttribute('pressed');
    this.shadowRoot.innerHTML = `
      <style>
        ${baseStyles}
        :host { display: inline-flex; }
        button {
          --button-glow: var(--mvx-accent-2);
          position: relative;
          isolation: isolate;
          overflow: hidden;
          display: grid;
          place-items: center;
          inline-size: 36px;
          block-size: 36px;
          border: 1px solid var(--mvx-border);
          border-radius: var(--mvx-radius-sm);
          background: var(--mvx-control-glaze), var(--mvx-bg-panel);
          box-shadow: var(--mvx-control-shadow);
          cursor: pointer;
          transform: perspective(640px) rotateX(var(--tilt-y, 0deg)) rotateY(var(--tilt-x, 0deg));
          transition: transform var(--mvx-duration-fast), border-color var(--mvx-duration), color var(--mvx-duration), box-shadow var(--mvx-duration);
        }
        button::before,
        button::after {
          content: "";
          position: absolute;
          pointer-events: none;
          z-index: 0;
        }
        button::before {
          inset: 0;
          background: radial-gradient(circle at var(--mx, 50%) var(--my, 50%), color-mix(in srgb, var(--button-glow) 35%, transparent), transparent 45%);
          opacity: 0;
          transition: opacity var(--mvx-duration);
        }
        button::after {
          inset-block-start: var(--press-y, 50%);
          inset-inline-start: var(--press-x, 50%);
          inline-size: 14px;
          block-size: 14px;
          border-radius: 999px;
          background: color-mix(in srgb, var(--button-glow) 45%, white);
          opacity: 0;
          transform: translate(-50%, -50%) scale(0);
        }
        button > slot {
          position: relative;
          z-index: 1;
        }
        button:hover:not(:disabled), button[aria-pressed="true"] {
          border-color: color-mix(in srgb, var(--mvx-accent) 62%, var(--mvx-border));
          color: var(--mvx-accent-2);
          transform: perspective(640px) rotateX(var(--tilt-y, 0deg)) rotateY(var(--tilt-x, 0deg)) translateY(var(--mvx-hover-lift));
        }
        button:hover:not(:disabled)::before {
          opacity: 1;
        }
        button.mvx-pressed:not(:disabled)::after {
          animation: mvx-icon-ripple 420ms cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        button:focus-visible {
          outline: none;
          box-shadow: var(--mvx-focus), var(--mvx-control-shadow);
        }
        @keyframes mvx-icon-ripple {
          0% { opacity: 0.4; transform: translate(-50%, -50%) scale(0); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(8); }
        }
        :host([motion="none"]) button {
          animation: none !important;
          transform: none !important;
          transition: none !important;
        }
        :host([motion="none"]) button::before,
        :host([motion="none"]) button::after {
          display: none;
        }
        @media (prefers-reduced-motion: reduce) {
          button {
            animation: none !important;
            transform: none !important;
            transition: none;
          }
          button::before,
          button::after {
            display: none;
          }
        }
      </style>
      <button part="button" aria-label="${htmlEscape(label)}" aria-pressed="${pressed}" title="${htmlEscape(label)}">
        <slot></slot>
      </button>
    `;
    const button = this.shadowRoot.querySelector('button');
    button.disabled = this.hasAttribute('disabled');
    this.wirePointerMotion(button);
  }
}
