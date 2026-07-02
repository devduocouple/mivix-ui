import { baseStyles, MvxElement, htmlEscape } from '../../core.js';

export class MvxDatePicker extends MvxElement {
  static observedAttributes = ['label', 'value', 'start', 'end', 'min', 'max', 'helper', 'disabled', 'required', 'range', 'type'];

  get value() {
    return this._value ?? this.getAttribute('value') ?? '';
  }

  set value(value) {
    this._value = Array.isArray(value) ? value.join(',') : String(value ?? '');
    this.setAttribute('value', this._value);
  }

  render() {
    const id = `mvx-${Math.random().toString(36).slice(2)}`;
    const label = this.getAttribute('label') || '';
    const helper = this.getAttribute('helper') || '';
    const type = this.getAttribute('type') || 'date';
    const min = this.getAttribute('min') || '';
    const max = this.getAttribute('max') || '';
    const range = this.hasAttribute('range');
    const disabled = this.hasAttribute('disabled');
    const [startValue, endValue] = String(this.value || `${this.getAttribute('start') || ''},${this.getAttribute('end') || ''}`).split(',');
    this.shadowRoot.innerHTML = `
      <style>
        ${baseStyles}
        :host { display: block; }
        label {
          display: grid;
          gap: 7px;
          color: var(--mvx-muted);
          font-size: 13px;
          font-weight: 650;
        }
        .inputs {
          display: grid;
          grid-template-columns: ${range ? 'minmax(0, 1fr) minmax(0, 1fr)' : 'minmax(0, 1fr)'};
          gap: 8px;
        }
        input {
          inline-size: 100%;
          min-block-size: 40px;
          border: 1px solid var(--mvx-border);
          border-radius: var(--mvx-radius-sm);
          background: var(--mvx-bg-inset);
          color: var(--mvx-fg);
          outline: none;
          padding: 9px 11px;
        }
        input:focus {
          border-color: var(--mvx-accent);
          box-shadow: var(--mvx-focus);
        }
        input:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }
        .helper {
          color: var(--mvx-subtle);
          font-size: 12px;
          font-weight: 500;
        }
      </style>
      <label for="${id}">
        ${label ? `<span>${htmlEscape(label)}</span>` : ''}
        <span class="inputs">
          <input part="input" id="${id}" data-date="start" type="${htmlEscape(type)}" value="${htmlEscape(startValue || '')}" ${min ? `min="${htmlEscape(min)}"` : ''} ${max ? `max="${htmlEscape(max)}"` : ''} ${disabled ? 'disabled' : ''} ${this.hasAttribute('required') ? 'required' : ''} />
          ${range ? `<input part="input" data-date="end" type="${htmlEscape(type)}" value="${htmlEscape(endValue || '')}" ${min ? `min="${htmlEscape(min)}"` : ''} ${max ? `max="${htmlEscape(max)}"` : ''} ${disabled ? 'disabled' : ''} />` : ''}
        </span>
        ${helper ? `<span class="helper">${htmlEscape(helper)}</span>` : ''}
      </label>
    `;
    const inputs = [...this.shadowRoot.querySelectorAll('input')];
    inputs.forEach(input => {
      input.addEventListener('change', () => {
        const values = inputs.map(item => item.value);
        this._value = range ? values.join(',') : values[0];
        this.setAttribute('value', this._value);
        this.emit('mvx-change', { value: range ? values : values[0], start: values[0], end: values[1] || '' });
      });
    });
  }
}
