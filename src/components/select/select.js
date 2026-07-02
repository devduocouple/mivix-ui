import { baseStyles, MvxElement, parseData, htmlEscape } from '../../core.js';

export class MvxSelect extends MvxElement {
  static observedAttributes = ['options', 'value', 'label', 'placeholder', 'helper', 'disabled', 'invalid', 'multiple', 'size', 'required'];

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
    this._value = Array.isArray(value) ? value.join(',') : String(value ?? '');
    this.setAttribute('value', this._value);
  }

  normalizedOptions() {
    return this.options.map(option => typeof option === 'string'
      ? { label: option, value: option }
      : {
          label: option.label ?? option.value ?? '',
          value: option.value ?? option.label ?? '',
          group: option.group || '',
          disabled: Boolean(option.disabled)
        });
  }

  renderOptions(options) {
    const groups = new Map();
    options.forEach(option => {
      const group = option.group || '';
      if (!groups.has(group)) groups.set(group, []);
      groups.get(group).push(option);
    });
    return [...groups.entries()].map(([group, groupOptions]) => {
      const items = groupOptions.map(option => `
        <option value="${htmlEscape(option.value)}" ${String(option.value) === String(this.value) ? 'selected' : ''} ${option.disabled ? 'disabled' : ''}>
          ${htmlEscape(option.label)}
        </option>
      `).join('');
      return group ? `<optgroup label="${htmlEscape(group)}">${items}</optgroup>` : items;
    }).join('');
  }

  render() {
    const id = `mvx-${Math.random().toString(36).slice(2)}`;
    const label = this.getAttribute('label') || '';
    const helper = this.getAttribute('helper') || '';
    const placeholder = this.getAttribute('placeholder') || this.t('selectPlaceholder', 'Select an option');
    const options = this.normalizedOptions();
    const multiple = this.hasAttribute('multiple');
    const size = this.getAttribute('size');
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
        select {
          inline-size: 100%;
          min-block-size: 40px;
          border: 1px solid var(--mvx-border);
          border-radius: var(--mvx-radius-sm);
          background:
            linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02)),
            var(--mvx-bg-inset);
          color: var(--mvx-fg);
          outline: none;
          padding: 9px 11px;
        }
        select:focus {
          border-color: var(--mvx-accent);
          box-shadow: var(--mvx-focus);
        }
        :host([invalid]) select {
          border-color: var(--mvx-danger);
        }
        select:disabled {
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
        <select part="select" id="${id}" ${multiple ? 'multiple' : ''} ${size ? `size="${htmlEscape(size)}"` : ''} ${this.hasAttribute('disabled') ? 'disabled' : ''} ${this.hasAttribute('required') ? 'required' : ''}>
          ${!multiple ? `<option value="">${htmlEscape(placeholder)}</option>` : ''}
          ${this.renderOptions(options)}
        </select>
        ${helper ? `<span class="helper">${htmlEscape(helper)}</span>` : ''}
      </label>
    `;
    const select = this.shadowRoot.querySelector('select');
    if (multiple && this.value) {
      const values = this.value.split(',').map(value => value.trim());
      [...select.options].forEach(option => {
        option.selected = values.includes(option.value);
      });
    } else {
      select.value = this.value;
    }
    select.addEventListener('change', () => {
      const value = multiple ? [...select.selectedOptions].map(option => option.value) : select.value;
      this._value = Array.isArray(value) ? value.join(',') : value;
      if (!multiple) this.setAttribute('value', this._value);
      this.emit('mvx-change', { value, selectedOptions: [...select.selectedOptions].map(option => option.value) });
    });
  }
}
