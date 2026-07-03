import { baseStyles, MvxElement, htmlEscape } from '../../core.js';

export class MvxInput extends MvxElement {
  static observedAttributes = ['label', 'placeholder', 'value', 'type', 'helper', 'invalid', 'multiline'];

  get value() {
    return this._value ?? this.getAttribute('value') ?? '';
  }

  set value(value) {
    this._value = String(value ?? '');
    const field = this.shadowRoot?.querySelector('input, textarea');
    if (field) field.value = this._value;
  }

  render() {
    const id = `mvx-${Math.random().toString(36).slice(2)}`;
    const label = this.getAttribute('label');
    const helper = this.getAttribute('helper');
    const placeholder = this.getAttribute('placeholder') || '';
    const type = this.getAttribute('type') || 'text';
    const tag = this.hasAttribute('multiline') ? 'textarea' : 'input';
    const helperId = helper ? `${id}-helper` : '';
    const controlLabel = label || placeholder || this.t('input', 'Input');
    const ariaAttrs = `aria-label="${htmlEscape(controlLabel)}" ${helperId ? `aria-describedby="${helperId}"` : ''} aria-invalid="${this.hasAttribute('invalid')}"`;
    const attrs = tag === 'input' ? `type="${htmlEscape(type)}" ${ariaAttrs}` : `rows="4" ${ariaAttrs}`;
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
        input, textarea {
          inline-size: 100%;
          min-block-size: 40px;
          border: 1px solid var(--mvx-border);
          border-radius: var(--mvx-radius-sm);
          background: var(--mvx-bg-inset);
          color: var(--mvx-fg);
          padding: 10px 12px;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
          outline: none;
          resize: vertical;
        }
        input:focus, textarea:focus {
          border-color: var(--mvx-accent);
          box-shadow: var(--mvx-focus);
        }
        :host([invalid]) input, :host([invalid]) textarea {
          border-color: var(--mvx-danger);
        }
        .helper {
          color: var(--mvx-subtle);
          font-size: 12px;
          font-weight: 500;
        }
      </style>
      <label for="${id}">
        ${label ? `<span>${htmlEscape(label)}</span>` : ''}
        <${tag} part="input" id="${id}" ${attrs} placeholder="${htmlEscape(placeholder)}">${tag === 'textarea' ? htmlEscape(this.value) : ''}</${tag}>
        ${helper ? `<span class="helper" id="${helperId}">${htmlEscape(helper)}</span>` : ''}
      </label>
    `;
    const field = this.shadowRoot.querySelector(tag);
    field.value = this.value;
    field.addEventListener('input', event => {
      this._value = event.target.value;
      this.emit('mvx-change', { value: this._value });
    });
  }
}
