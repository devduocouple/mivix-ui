import { baseStyles, MvxElement, htmlEscape } from '../../core.js';

export class MvxSwitch extends MvxElement {
  static observedAttributes = ['checked', 'disabled', 'label'];

  get checked() {
    return this.hasAttribute('checked');
  }

  set checked(value) {
    this.toggleAttribute('checked', Boolean(value));
  }

  render() {
    const label = this.getAttribute('label') || '';
    this.shadowRoot.innerHTML = `
      <style>
        ${baseStyles}
        :host { display: inline-flex; }
        button {
          display: inline-grid;
          grid-template-columns: 42px auto;
          gap: 10px;
          align-items: center;
          border: 0;
          background: transparent;
          padding: 0;
          cursor: pointer;
        }
        .track {
          position: relative;
          inline-size: 42px;
          block-size: 24px;
          border: 1px solid var(--mvx-border);
          border-radius: 999px;
          background: var(--mvx-bg-inset);
          box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.34);
          transition: background var(--mvx-duration), border-color var(--mvx-duration);
        }
        :host-context([data-mvx-variant="material"]) .track {
          box-shadow: none;
          transition:
            background var(--mvx-motion-duration-medium) var(--mvx-motion-easing-standard),
            border-color var(--mvx-motion-duration-medium) var(--mvx-motion-easing-standard);
        }
        .thumb {
          position: absolute;
          inset-block-start: 50%;
          inset-inline-start: 3px;
          inline-size: 18px;
          block-size: 18px;
          border-radius: 999px;
          background: linear-gradient(180deg, white, #bfc7d3);
          box-shadow: 0 2px 7px rgba(0, 0, 0, 0.4);
          transform: translateY(-50%);
          transition: transform var(--mvx-duration);
        }
        :host-context([data-mvx-variant="material"]) .thumb {
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.28);
          transition:
            transform var(--mvx-motion-duration-medium) var(--mvx-motion-easing-emphasized),
            inline-size var(--mvx-motion-duration-short) var(--mvx-motion-easing-standard);
        }
        :host-context([data-mvx-variant="material"]) button:hover:not(:disabled) .thumb {
          box-shadow: 0 0 0 10px var(--mvx-state-layer-hover), 0 1px 3px rgba(0, 0, 0, 0.28);
        }
        :host-context([data-mvx-variant="material"]) button:active:not(:disabled) .thumb {
          inline-size: 24px;
          box-shadow: 0 0 0 10px var(--mvx-state-layer-pressed), 0 1px 3px rgba(0, 0, 0, 0.28);
        }
        button[aria-checked="true"] .track {
          border-color: color-mix(in srgb, var(--mvx-accent) 62%, var(--mvx-border));
          background: color-mix(in srgb, var(--mvx-accent) 72%, var(--mvx-bg-inset));
        }
        button[aria-checked="true"] .thumb {
          transform: translate(18px, -50%);
        }
        button:disabled {
          cursor: not-allowed;
          filter: saturate(0.88);
        }
        button:disabled .track {
          border-color: var(--mvx-disabled-border);
          background: var(--mvx-disabled-bg);
          box-shadow: var(--mvx-disabled-shadow);
        }
        button:disabled .thumb {
          background: color-mix(in srgb, var(--mvx-disabled-fg) 34%, var(--mvx-bg-panel));
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.18);
        }
        button:disabled .label {
          color: var(--mvx-disabled-fg);
        }
        button:focus-visible {
          outline: none;
        }
        button:focus-visible .track {
          box-shadow: var(--mvx-focus), inset 0 2px 5px rgba(0, 0, 0, 0.34);
        }
        .label {
          color: var(--mvx-muted);
          font-size: 14px;
          white-space: nowrap;
        }
      </style>
      <button part="switch" role="switch" aria-checked="${this.checked}" ${this.hasAttribute('disabled') ? 'disabled' : ''}>
        <span class="track"><span class="thumb"></span></span>
        ${label ? `<span class="label">${htmlEscape(label)}</span>` : ''}
      </button>
    `;
    const button = this.shadowRoot.querySelector('button');
    const toggle = () => {
      if (this.hasAttribute('disabled')) return;
      this.checked = !this.checked;
      this.emit('mvx-change', { checked: this.checked });
    };
    button.addEventListener('click', toggle);
    button.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggle();
      }
    });
  }
}
