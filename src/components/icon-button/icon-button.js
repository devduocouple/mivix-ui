import { baseStyles, MvxElement, htmlEscape } from '../../core.js';

const iconPaths = {
  add: '<path d="M12 5v14M5 12h14" />',
  plus: '<path d="M12 5v14M5 12h14" />',
  minus: '<path d="M5 12h14" />',
  close: '<path d="M7 7l10 10M17 7 7 17" />',
  x: '<path d="M7 7l10 10M17 7 7 17" />',
  check: '<path d="M5 12.5 9.5 17 19 7" />',
  search: '<circle cx="10.7" cy="10.7" r="5.8" /><path d="m15.1 15.1 4.9 4.9" />',
  settings: '<path d="M4 7h5" /><path d="M15 7h5" /><circle cx="12" cy="7" r="2.15" /><path d="M4 12h9" /><path d="M19 12h1" /><circle cx="16" cy="12" r="2.15" /><path d="M4 17h1" /><path d="M11 17h9" /><circle cx="8" cy="17" r="2.15" />',
  gear: '<path d="M12 8.75a3.25 3.25 0 1 0 0 6.5 3.25 3.25 0 0 0 0-6.5Z" /><path d="M19.4 13.5a7.8 7.8 0 0 0 0-3l2-1.35-2-3.46-2.38 1a8.25 8.25 0 0 0-2.6-1.5L14.1 2.6h-4l-.42 2.6a8.25 8.25 0 0 0-2.6 1.5l-2.38-1-2 3.46 2 1.35a7.8 7.8 0 0 0 0 3l-2 1.35 2 3.46 2.38-1a8.25 8.25 0 0 0 2.6 1.5l.42 2.6h4l.42-2.6a8.25 8.25 0 0 0 2.6-1.5l2.38 1 2-3.46-2.1-1.36Z" />',
  refresh: '<path d="M20 11a8 8 0 0 0-14.1-5.2L4 8" /><path d="M4 4v4h4" /><path d="M4 13a8 8 0 0 0 14.1 5.2L20 16" /><path d="M20 20v-4h-4" />',
  bell: '<path d="M18 10a6 6 0 0 0-12 0c0 3.2-1 5.1-2.2 6.4-.4.45-.08 1.1.52 1.1h15.36c.6 0 .92-.65.52-1.1C19 15.1 18 13.2 18 10Z" /><path d="M9.5 20a2.75 2.75 0 0 0 5 0" />',
  menu: '<path d="M4 7h16M4 12h16M4 17h16" />',
  more: '<circle cx="5" cy="12" r="1.25" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1.25" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r="1.25" fill="currentColor" stroke="none" />',
  command: '<path d="M9 9H6.75a2.75 2.75 0 1 1 2.75-2.75V17.25A2.75 2.75 0 1 1 6.75 14.5H17.25A2.75 2.75 0 1 1 14.5 17.25V6.75A2.75 2.75 0 1 1 17.25 9H9Z" />',
  'chevron-right': '<path d="m9 6 6 6-6 6" />',
  'chevron-left': '<path d="m15 6-6 6 6 6" />',
  'chevron-up': '<path d="m6 15 6-6 6 6" />',
  'chevron-down': '<path d="m6 9 6 6 6-6" />'
};

function renderIcon(value) {
  const icon = String(value || '').trim();
  const path = iconPaths[icon];
  if (!path) return `<span class="glyph">${htmlEscape(icon.charAt(0).toUpperCase())}</span>`;
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${path}</svg>`;
}

export class MvxIconButton extends MvxElement {
  static observedAttributes = ['label', 'disabled', 'pressed', 'motion', 'icon', 'icon-only', 'border', 'background', 'shape', 'size', 'density'];

  render() {
    const icon = this.getAttribute('icon');
    const label = this.getAttribute('label') || icon || 'Action';
    const pressed = this.hasAttribute('pressed');
    const iconOnly = this.getAttribute('icon-only') !== 'false';
    this.shadowRoot.innerHTML = `
      <style>
        ${baseStyles}
        :host { display: inline-flex; }
        button {
          --icon-button-icon-size: 19px;
          --icon-button-padding: 8.5px;
          --icon-button-label-padding: 12px;
          --icon-button-gap: 8px;
          --button-glow: var(--mvx-accent-2);
          position: relative;
          isolation: isolate;
          overflow: hidden;
          display: grid;
          place-items: center;
          inline-size: calc(var(--icon-button-icon-size) + var(--icon-button-padding) + var(--icon-button-padding));
          block-size: calc(var(--icon-button-icon-size) + var(--icon-button-padding) + var(--icon-button-padding));
          border: 1px solid var(--mvx-border);
          border-radius: var(--mvx-radius-sm);
          background: var(--mvx-control-glaze), var(--mvx-bg-panel);
          color: var(--mvx-fg);
          box-shadow: var(--mvx-control-shadow);
          cursor: pointer;
          padding: 0;
          transform: perspective(640px) rotateX(var(--tilt-y, 0deg)) rotateY(var(--tilt-x, 0deg));
          transition: transform var(--mvx-duration-fast), border-color var(--mvx-duration), color var(--mvx-duration), box-shadow var(--mvx-duration);
        }
        :host([border="none"]) button {
          border-color: transparent;
        }
        :host([background="none"]) button {
          background: transparent;
          box-shadow: none;
        }
        :host([shape="sharp"]) button {
          border-radius: 2px;
        }
        :host([shape="circle"]) button {
          border-radius: 999px;
        }
        :host([shape="rounded"]) button {
          border-radius: var(--mvx-radius-sm);
        }
        button.has-label {
          grid-auto-flow: column;
          gap: var(--icon-button-gap);
          inline-size: auto;
          min-inline-size: calc(var(--icon-button-icon-size) + var(--icon-button-padding) + var(--icon-button-padding));
          padding: 0 var(--icon-button-label-padding);
        }
        :host([size="sm"]) button {
          --icon-button-icon-size: 17px;
        }
        :host([size="lg"]) button {
          --icon-button-icon-size: 22px;
        }
        :host([density="compact"]) button {
          --icon-button-padding: 6.5px;
          --icon-button-label-padding: 10px;
          --icon-button-gap: 6px;
        }
        :host([density="spacious"]) button {
          --icon-button-padding: 11.5px;
          --icon-button-label-padding: 14px;
          --icon-button-gap: 10px;
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
        .icon {
          position: relative;
          z-index: 1;
          display: inline-grid;
          place-items: center;
          inline-size: var(--icon-button-icon-size);
          block-size: var(--icon-button-icon-size);
          font-size: var(--icon-button-icon-size);
          font-weight: 650;
          line-height: 1;
        }
        .icon svg {
          inline-size: 100%;
          block-size: 100%;
          fill: none;
          stroke: currentColor;
          stroke-width: 1.85;
          stroke-linecap: round;
          stroke-linejoin: round;
        }
        .glyph {
          display: inline-grid;
          place-items: center;
          inline-size: 1em;
          block-size: 1em;
        }
        .label {
          position: relative;
          z-index: 1;
          overflow: hidden;
          max-inline-size: 14ch;
          font-size: 13px;
          font-weight: 750;
          line-height: 1;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        button:hover:not(:disabled), button[aria-pressed="true"]:not(:disabled) {
          border-color: color-mix(in srgb, var(--mvx-accent) 62%, var(--mvx-border));
          color: var(--mvx-accent-2);
          transform: perspective(640px) rotateX(var(--tilt-y, 0deg)) rotateY(var(--tilt-x, 0deg)) translateY(var(--mvx-hover-lift));
        }
        :host([border="none"]) button:hover:not(:disabled),
        :host([border="none"]) button[aria-pressed="true"]:not(:disabled) {
          border-color: transparent;
        }
        :host([background="none"]) button:hover:not(:disabled),
        :host([background="none"]) button[aria-pressed="true"]:not(:disabled) {
          background: transparent;
          box-shadow: none;
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
        :host([border="none"]) button:disabled {
          border-color: transparent;
        }
        :host([background="none"]) button:disabled {
          background: transparent;
          box-shadow: none;
        }
        button:disabled::before,
        button:disabled::after {
          display: none;
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
        :host([background="none"]) button:focus-visible {
          box-shadow: var(--mvx-focus);
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
      <button part="button" class="${iconOnly ? 'icon-only' : 'has-label'}" aria-label="${htmlEscape(label)}" aria-pressed="${pressed}" title="${htmlEscape(label)}">
        <span class="icon" part="icon" aria-hidden="true">${icon ? renderIcon(icon) : '<slot></slot>'}</span>
        ${iconOnly ? '' : `<span class="label" part="label">${htmlEscape(label)}</span>`}
      </button>
    `;
    const button = this.shadowRoot.querySelector('button');
    button.disabled = this.hasAttribute('disabled');
    this.wirePointerMotion(button);
  }
}
