import { baseStyles, MvxElement, htmlEscape } from '../../core.js';

export class MvxButton extends MvxElement {
  static observedAttributes = ['type', 'tone', 'size', 'disabled', 'loading', 'motion'];

  render() {
    const rawType = this.getAttribute('type') || 'solid';
    const legacyTones = new Set(['neutral', 'primary', 'secondary', 'success', 'warning', 'danger', 'info']);
    const type = legacyTones.has(rawType) ? 'solid' : rawType;
    const tone = this.getAttribute('tone') || (legacyTones.has(rawType) ? rawType : 'neutral');
    const size = this.getAttribute('size') || 'md';
    const disabled = this.hasAttribute('disabled') || this.hasAttribute('loading');
    this.shadowRoot.innerHTML = `
      <style>
        ${baseStyles}
        :host { display: inline-flex; }
        button {
          --button-bg: var(--mvx-bg-panel);
          --button-fg: var(--mvx-fg);
          --button-border: var(--mvx-border);
          --button-tone: var(--mvx-fg);
          --button-on-tone: var(--mvx-bg);
          --button-solid-bg: var(--mvx-bg-panel);
          --button-solid-fg: var(--mvx-fg);
          --button-solid-border: var(--mvx-border);
          --button-glow: var(--mvx-accent-2);
          position: relative;
          isolation: isolate;
          overflow: hidden;
          display: inline-grid;
          grid-auto-flow: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-inline-size: 36px;
          min-block-size: 36px;
          padding: 0 14px;
          border: 1px solid var(--button-border);
          border-radius: var(--mvx-button-radius, var(--mvx-radius-sm));
          background:
            radial-gradient(circle at var(--mx, 50%) var(--my, 50%), color-mix(in srgb, var(--button-glow) 19%, transparent), transparent 34%),
            var(--mvx-control-glaze),
            var(--button-bg);
          color: var(--button-fg);
          box-shadow: var(--mvx-button-shadow, var(--mvx-control-shadow));
          cursor: pointer;
          transform: perspective(720px) rotateX(var(--tilt-y, 0deg)) rotateY(var(--tilt-x, 0deg)) translateY(0);
          transition: transform var(--mvx-duration-fast), border-color var(--mvx-duration), background var(--mvx-duration), box-shadow var(--mvx-duration);
          white-space: nowrap;
        }
        button::before,
        button::after {
          content: "";
          position: absolute;
          pointer-events: none;
          z-index: 0;
        }
        button > slot,
        button > span {
          position: relative;
          z-index: 1;
        }
        button::before {
          inset: 0;
          background:
            linear-gradient(120deg, transparent 20%, color-mix(in srgb, white 16%, transparent) 46%, transparent 72%),
            radial-gradient(circle at var(--mx, 50%) var(--my, 50%), color-mix(in srgb, var(--button-glow) 36%, transparent), transparent 34%);
          opacity: 0;
          transform: translateX(-18%);
          transition: opacity var(--mvx-duration), transform var(--mvx-duration);
        }
        button::after {
          inset-block-start: var(--press-y, 50%);
          inset-inline-start: var(--press-x, 50%);
          inline-size: 18px;
          block-size: 18px;
          border-radius: 999px;
          background: color-mix(in srgb, var(--button-glow) 44%, white);
          opacity: 0;
          transform: translate(-50%, -50%) scale(0);
        }
        button:hover:not(:disabled)::before {
          opacity: 1;
          transform: translateX(0);
        }
        button:hover:not(:disabled) {
          border-color: var(--mvx-border-strong);
          transform: perspective(720px) rotateX(var(--tilt-y, 0deg)) rotateY(var(--tilt-x, 0deg)) translateY(var(--mvx-hover-lift));
        }
        button:active:not(:disabled) {
          transform: perspective(720px) rotateX(0deg) rotateY(0deg) translateY(0) scale(0.985);
          box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.22);
        }
        button.mvx-pressed:not(:disabled)::after {
          animation: mvx-ripple 460ms cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        button:focus-visible {
          outline: none;
          box-shadow: var(--mvx-focus), var(--mvx-button-shadow, var(--mvx-control-shadow));
        }
        button:disabled {
          cursor: not-allowed;
          border-color: var(--mvx-disabled-border);
          background: var(--mvx-disabled-bg);
          color: var(--mvx-disabled-fg);
          box-shadow: var(--mvx-disabled-shadow);
          transform: none;
          filter: saturate(0.88);
        }
        button:disabled::before,
        button:disabled::after {
          display: none;
        }
        :host-context([data-mvx-variant="material"]) button {
          min-block-size: 40px;
          border-color: var(--button-border);
          border-radius: var(--mvx-button-radius);
          background: var(--button-bg);
          box-shadow: none;
          transform: none;
        }
        :host-context([data-mvx-variant="material"]) button::before {
          inset: 0;
          background: currentColor;
          opacity: 0;
          transform: none;
          transition: opacity var(--mvx-duration-fast);
        }
        :host-context([data-mvx-variant="material"]) button:hover:not(:disabled)::before {
          opacity: 0.08;
        }
        :host-context([data-mvx-variant="material"]) button:active:not(:disabled)::before {
          opacity: 0.12;
        }
        :host-context([data-mvx-variant="material"]) button:hover:not(:disabled),
        :host-context([data-mvx-variant="material"]) button:active:not(:disabled) {
          transform: none;
          box-shadow: none;
        }
        .tone-neutral {
          --button-tone: var(--mvx-fg);
          --button-on-tone: var(--mvx-bg);
          --button-solid-bg: var(--mvx-bg-panel);
          --button-solid-fg: var(--mvx-fg);
          --button-solid-border: var(--mvx-border);
          --button-glow: var(--mvx-accent-2);
        }
        .tone-primary {
          --button-tone: var(--mvx-accent);
          --button-on-tone: white;
          --button-glow: var(--mvx-accent-2);
        }
        .tone-secondary {
          --button-tone: var(--mvx-accent-2);
          --button-on-tone: var(--mvx-bg);
          --button-glow: var(--mvx-accent-2);
        }
        .tone-success {
          --button-tone: var(--mvx-success);
          --button-on-tone: white;
          --button-glow: var(--mvx-success);
        }
        .tone-warning {
          --button-tone: var(--mvx-warning);
          --button-on-tone: #14171b;
          --button-glow: var(--mvx-warning);
        }
        .tone-danger {
          --button-tone: var(--mvx-danger);
          --button-on-tone: white;
          --button-glow: var(--mvx-danger);
        }
        .tone-info {
          --button-tone: var(--mvx-info);
          --button-on-tone: white;
          --button-glow: var(--mvx-info);
        }
        .tone-primary,
        .tone-secondary,
        .tone-success,
        .tone-warning,
        .tone-danger,
        .tone-info {
          --button-solid-bg: var(--button-tone);
          --button-solid-fg: var(--button-on-tone);
          --button-solid-border: color-mix(in srgb, var(--button-tone) 72%, white);
        }
        .solid {
          --button-bg: var(--button-solid-bg);
          --button-fg: var(--button-solid-fg);
          --button-border: var(--button-solid-border);
        }
        .outline {
          --button-bg: transparent;
          --button-fg: var(--button-tone);
          --button-border: color-mix(in srgb, var(--button-tone) 58%, var(--mvx-border));
          box-shadow: none;
        }
        .dashed,
        .dotted {
          --button-bg: transparent;
          --button-fg: var(--button-tone);
          --button-border: color-mix(in srgb, var(--button-tone) 62%, var(--mvx-border));
          box-shadow: none;
        }
        .dashed { border-style: dashed; }
        .dotted { border-style: dotted; }
        .ghost {
          --button-bg: transparent;
          --button-fg: var(--button-tone);
          --button-border: transparent;
          box-shadow: none;
        }
        .subtle {
          --button-bg: color-mix(in srgb, var(--button-tone) 14%, var(--mvx-bg-panel));
          --button-fg: var(--button-tone);
          --button-border: color-mix(in srgb, var(--button-tone) 24%, transparent);
          box-shadow: none;
        }
        .plain,
        .link {
          --button-bg: transparent;
          --button-fg: var(--button-tone);
          --button-border: transparent;
          box-shadow: none;
        }
        .plain,
        .link {
          min-block-size: 30px;
          padding-inline: 6px;
        }
        .link {
          text-decoration: underline;
          text-underline-offset: 4px;
        }
        .tone-primary.solid.mvx-pressed:not(:disabled),
        .tone-success.solid.mvx-pressed:not(:disabled) {
          animation: mvx-confirm 420ms cubic-bezier(0.18, 0.82, 0.22, 1);
        }
        .tone-danger.mvx-pressed:not(:disabled) {
          animation: mvx-danger 520ms cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        :host-context([data-mvx-variant="material"]) .tone-primary.solid.mvx-pressed:not(:disabled),
        :host-context([data-mvx-variant="material"]) .tone-success.solid.mvx-pressed:not(:disabled),
        :host-context([data-mvx-variant="material"]) .tone-danger.mvx-pressed:not(:disabled) {
          animation: none;
        }
        :host-context([data-mvx-variant="material"]) button.mvx-pressed:not(:disabled)::after {
          animation: mvx-material-ripple var(--mvx-motion-duration-medium) var(--mvx-motion-easing-standard);
        }
        :host-context([data-mvx-variant="material"]) .tone-neutral.solid {
          --button-bg: transparent;
          --button-fg: var(--mvx-accent);
          --button-border: var(--mvx-border);
        }
        :host-context([data-mvx-variant="material"]) .solid:not(.tone-neutral) {
          --button-border: transparent;
        }
        :host-context([data-mvx-variant="material"]) .ghost,
        :host-context([data-mvx-variant="material"]) .plain,
        :host-context([data-mvx-variant="material"]) .link {
          --button-border: transparent;
        }
        .sm { min-block-size: 30px; padding: 0 10px; font-size: 13px; }
        .lg { min-block-size: 44px; padding: 0 18px; font-size: 15px; }
        :host-context([data-mvx-variant="material"]) .sm { min-block-size: 32px; padding: 0 12px; }
        :host-context([data-mvx-variant="material"]) .lg { min-block-size: 48px; padding: 0 24px; }
        .spinner {
          inline-size: 14px;
          block-size: 14px;
          border: 2px solid currentColor;
          border-block-start-color: transparent;
          border-radius: 999px;
          animation: spin 800ms linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes mvx-ripple {
          0% { opacity: 0.42; transform: translate(-50%, -50%) scale(0); }
          78% { opacity: 0.14; }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(13); }
        }
        @keyframes mvx-material-ripple {
          0% { opacity: 0.12; transform: translate(-50%, -50%) scale(0); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(9); }
        }
        @keyframes mvx-confirm {
          0% { transform: perspective(720px) translateY(-1px) scale(1); }
          38% { transform: perspective(720px) translateY(-3px) scale(1.018); box-shadow: 0 0 0 4px color-mix(in srgb, var(--mvx-accent-2) 18%, transparent), 0 12px 24px rgba(0, 0, 0, 0.22); }
          100% { transform: perspective(720px) translateY(0) scale(1); }
        }
        @keyframes mvx-danger {
          0% { transform: perspective(720px) translateX(0) scale(1); }
          18% { transform: perspective(720px) translateX(-1px) rotateZ(-0.8deg) scale(0.99); }
          36% { transform: perspective(720px) translateX(2px) rotateZ(0.8deg) scale(1.01); border-color: color-mix(in srgb, var(--mvx-danger) 86%, white); }
          64% { transform: perspective(720px) translateX(-1px) rotateZ(-0.4deg); box-shadow: 0 0 0 4px color-mix(in srgb, var(--mvx-danger) 18%, transparent), inset 0 1px 0 rgba(255, 255, 255, 0.16); }
          100% { transform: perspective(720px) translateX(0) rotateZ(0deg) scale(1); }
        }
        :host([motion="none"]) button,
        :host([motion="none"]) .spinner {
          animation: none !important;
          transform: none !important;
          transition: none !important;
        }
        :host([motion="none"]) button::before,
        :host([motion="none"]) button::after {
          display: none;
        }
        @media (prefers-reduced-motion: reduce) {
          button, .spinner {
            transition: none;
            animation: none !important;
            transform: none !important;
          }
          button::before,
          button::after {
            display: none;
          }
        }
      </style>
      <button type="button" part="button" class="${htmlEscape(type)} tone-${htmlEscape(tone)} ${htmlEscape(size)}" aria-busy="${this.hasAttribute('loading')}">
        ${this.hasAttribute('loading') ? '<span class="spinner" aria-hidden="true"></span>' : '<slot name="prefix"></slot>'}
        <slot></slot>
        <slot name="suffix"></slot>
      </button>
    `;
    const button = this.shadowRoot.querySelector('button');
    button.disabled = disabled;
    this.wirePointerMotion(button);
  }
}
