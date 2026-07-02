import { baseStyles, MvxElement, parseData, htmlEscape } from '../../core.js';

export class MvxRadioGroup extends MvxElement {
  static observedAttributes = ['options', 'value', 'label', 'name', 'orientation', 'disabled', 'required'];

  set options(value) {
    this._options = value;
    if (this.isConnected) this.render();
  }

  get options() {
    return parseData(this._options ?? this.getAttribute('options'), []);
  }

  get value() {
    return this._value ?? this.getAttribute('value') ?? '';
  }

  set value(value) {
    this._value = String(value ?? '');
    this.setAttribute('value', this._value);
  }

  normalizedOptions() {
    return this.options.map(option => typeof option === 'string'
      ? { label: option, value: option }
      : {
          label: option.label ?? option.value ?? '',
          value: option.value ?? option.label ?? '',
          description: option.description || option.helper || '',
          disabled: Boolean(option.disabled)
        });
  }

  select(value) {
    if (this.hasAttribute('disabled')) return;
    const option = this.normalizedOptions().find(item => String(item.value) === String(value));
    if (!option || option.disabled) return;
    this._value = String(value);
    this.setAttribute('value', this._value);
    this.emit('mvx-change', { value: this._value, option });
    this.render();
  }

  render() {
    const options = this.normalizedOptions();
    const label = this.getAttribute('label') || this.t('radioGroup', 'Options');
    const horizontal = this.getAttribute('orientation') === 'horizontal';
    const disabled = this.hasAttribute('disabled');
    this.shadowRoot.innerHTML = `
      <style>
        ${baseStyles}
        :host { display: block; }
        fieldset {
          display: grid;
          gap: 10px;
          min-inline-size: 0;
          margin: 0;
          border: 0;
          padding: 0;
        }
        legend {
          color: var(--mvx-muted);
          font-size: 13px;
          font-weight: 750;
          padding: 0;
        }
        .options {
          display: ${horizontal ? 'flex' : 'grid'};
          flex-wrap: wrap;
          gap: 8px;
        }
        button {
          display: grid;
          grid-template-columns: 20px minmax(0, 1fr);
          gap: 9px;
          align-items: start;
          min-block-size: 34px;
          border: 1px solid var(--mvx-border);
          border-radius: var(--mvx-radius-sm);
          background: var(--mvx-bg-inset);
          color: var(--mvx-fg);
          cursor: pointer;
          padding: 8px 10px;
          text-align: start;
        }
        .dot {
          display: grid;
          place-items: center;
          inline-size: 18px;
          block-size: 18px;
          border: 1px solid var(--mvx-border);
          border-radius: 999px;
          background: var(--mvx-bg-panel);
        }
        .dot::after {
          content: "";
          inline-size: 8px;
          block-size: 8px;
          border-radius: 999px;
          background: white;
          opacity: 0;
          transform: scale(0.7);
          transition: opacity var(--mvx-duration-fast), transform var(--mvx-duration-fast);
        }
        button[aria-checked="true"] {
          border-color: color-mix(in srgb, var(--mvx-accent) 58%, var(--mvx-border));
          background: color-mix(in srgb, var(--mvx-accent) 14%, var(--mvx-bg-inset));
        }
        button[aria-checked="true"] .dot {
          border-color: var(--mvx-accent);
          background: var(--mvx-accent);
        }
        button[aria-checked="true"] .dot::after {
          opacity: 1;
          transform: scale(1);
        }
        button:focus-visible {
          outline: none;
          box-shadow: var(--mvx-focus);
        }
        button:disabled {
          cursor: not-allowed;
          opacity: 0.55;
        }
        .copy { display: grid; gap: 2px; }
        .label { font-size: 13px; font-weight: 700; }
        .description { color: var(--mvx-subtle); font-size: 12px; line-height: 1.35; }
      </style>
      <fieldset part="group" role="radiogroup" aria-label="${htmlEscape(label)}" aria-required="${this.hasAttribute('required')}">
        ${label ? `<legend>${htmlEscape(label)}</legend>` : ''}
        <div class="options">
          ${options.map((option, index) => {
            const selected = String(option.value) === String(this.value);
            return `
              <button role="radio" aria-checked="${selected}" tabindex="${selected || (!this.value && index === 0) ? '0' : '-1'}" data-value="${htmlEscape(option.value)}" ${disabled || option.disabled ? 'disabled' : ''}>
                <span class="dot" aria-hidden="true"></span>
                <span class="copy">
                  <span class="label">${htmlEscape(option.label)}</span>
                  ${option.description ? `<span class="description">${htmlEscape(option.description)}</span>` : ''}
                </span>
              </button>
            `;
          }).join('')}
        </div>
      </fieldset>
    `;
    const buttons = [...this.shadowRoot.querySelectorAll('button')];
    buttons.forEach((button, index) => {
      button.addEventListener('click', () => this.select(button.dataset.value));
      button.addEventListener('keydown', event => {
        const direction = ['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : ['ArrowLeft', 'ArrowUp'].includes(event.key) ? -1 : 0;
        if (!direction) return;
        event.preventDefault();
        const next = buttons[(index + direction + buttons.length) % buttons.length];
        next?.focus();
        if (next) this.select(next.dataset.value);
      });
    });
  }
}
