import { baseStyles, MvxElement, htmlEscape } from '../../core.js';

export class MvxCheckbox extends MvxElement {
  static observedAttributes = ['checked', 'indeterminate', 'disabled', 'label', 'helper', 'name', 'value', 'required'];

  get checked() {
    return this.hasAttribute('checked');
  }

  set checked(value) {
    this.toggleAttribute('checked', Boolean(value));
  }

  toggle() {
    if (this.hasAttribute('disabled')) return;
    this.removeAttribute('indeterminate');
    this.checked = !this.checked;
    this.emit('mvx-change', {
      checked: this.checked,
      value: this.getAttribute('value') || 'on',
      name: this.getAttribute('name') || ''
    });
  }

  render() {
    const label = this.getAttribute('label') || '';
    const helper = this.getAttribute('helper') || '';
    const mixed = this.hasAttribute('indeterminate');
    const disabled = this.hasAttribute('disabled');
    const ariaChecked = mixed ? 'mixed' : String(this.checked);
    this.shadowRoot.innerHTML = `
      <style>
        ${baseStyles}
        :host { display: inline-flex; }
        button {
          display: grid;
          grid-template-columns: 22px minmax(0, 1fr);
          gap: 10px;
          align-items: start;
          border: 0;
          background: transparent;
          color: var(--mvx-fg);
          cursor: pointer;
          padding: 0;
          text-align: start;
        }
        .box {
          display: grid;
          place-items: center;
          inline-size: 22px;
          block-size: 22px;
          border: 1px solid var(--mvx-border);
          border-radius: var(--mvx-radius-xs);
          background:
            var(--mvx-control-glaze),
            var(--mvx-bg-inset);
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.12),
            inset 0 -1px 2px rgba(0, 0, 0, 0.26),
            inset 0 0 0 1px rgba(0, 0, 0, 0.08);
          transition: background var(--mvx-duration), border-color var(--mvx-duration), box-shadow var(--mvx-duration), transform var(--mvx-duration-fast);
        }
        .mark {
          position: relative;
          z-index: 1;
          color: var(--mvx-accent);
          font-size: 15px;
          font-weight: 900;
          line-height: 1;
          text-shadow: 0 1px 0 rgba(255, 255, 255, 0.5);
          opacity: 0;
          transform: scale(0.72);
          transition: opacity var(--mvx-duration-fast), transform var(--mvx-duration-fast);
        }
        button[aria-checked="true"] .box,
        button[aria-checked="mixed"] .box {
          border-color: color-mix(in srgb, var(--mvx-accent) 72%, white);
          background:
            linear-gradient(180deg, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.8)),
            #ffffff;
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.24),
            inset 0 -1px 2px rgba(0, 0, 0, 0.28),
            inset 0 0 0 1px rgba(0, 0, 0, 0.12);
        }
        button[aria-checked="true"] .mark,
        button[aria-checked="mixed"] .mark {
          color: #1f66ff;
          opacity: 1;
          transform: scale(1);
        }
        .copy {
          display: grid;
          gap: 2px;
          min-inline-size: 0;
        }
        .label {
          color: var(--mvx-fg);
          font-size: 14px;
          font-weight: 650;
          line-height: 1.35;
        }
        .helper {
          color: var(--mvx-subtle);
          font-size: 12px;
          line-height: 1.35;
        }
        button:hover:not(:disabled) .box {
          border-color: color-mix(in srgb, var(--mvx-accent) 42%, var(--mvx-border-strong));
          box-shadow:
            inset 0 1px 0 rgba(255, 255, 255, 0.12),
            inset 0 -1px 2px rgba(0, 0, 0, 0.26),
            inset 0 0 0 1px rgba(0, 0, 0, 0.08),
          transform: translateY(-1px);
        }
        button:focus-visible {
          outline: none;
        }
        button:focus-visible .box {
          box-shadow:
            var(--mvx-focus),
            inset 0 1px 0 rgba(255, 255, 255, 0.12),
            inset 0 -1px 2px rgba(0, 0, 0, 0.26),
            inset 0 0 0 1px rgba(0, 0, 0, 0.08);
        }
        button:disabled {
          cursor: not-allowed;
          opacity: 0.55;
        }
      </style>
      <button part="checkbox" role="checkbox" aria-checked="${ariaChecked}" ${disabled ? 'disabled' : ''} aria-required="${this.hasAttribute('required')}">
        <span class="box" aria-hidden="true"><span class="mark">${mixed ? '&minus;' : '&#10003;'}</span></span>
        <span class="copy">
          ${label ? `<span class="label">${htmlEscape(label)}</span>` : '<slot></slot>'}
          ${helper ? `<span class="helper">${htmlEscape(helper)}</span>` : ''}
        </span>
      </button>
    `;
    const button = this.shadowRoot.querySelector('button');
    button.addEventListener('click', () => this.toggle());
    button.addEventListener('keydown', event => {
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault();
        this.toggle();
      }
    });
  }
}
