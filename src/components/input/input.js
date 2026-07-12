import { baseStyles, MvxElement, htmlEscape } from '../../core.js';

export class MvxInput extends MvxElement {
  static observedAttributes = ['label', 'placeholder', 'value', 'type', 'helper', 'invalid', 'multiline', 'disabled'];

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
    const stateAttrs = this.hasAttribute('disabled') ? 'disabled' : '';
    const attrs = tag === 'input' ? `type="${htmlEscape(type)}" ${ariaAttrs} ${stateAttrs}` : `rows="4" ${ariaAttrs} ${stateAttrs}`;
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
        :host-context([data-mvx-variant="material"]) label {
          gap: 6px;
          font-weight: 500;
        }
        :host-context([data-mvx-variant="material"]) input,
        :host-context([data-mvx-variant="material"]) textarea {
          min-block-size: 56px;
          border-width: 0 0 1px;
          border-radius: var(--mvx-material-field-radius);
          background: var(--mvx-material-field-bg);
          padding: 16px;
          box-shadow: none;
        }
        :host-context([data-mvx-variant="material"]) input:hover:not(:disabled),
        :host-context([data-mvx-variant="material"]) textarea:hover:not(:disabled) {
          background: color-mix(in srgb, var(--mvx-fg) 9%, var(--mvx-bg-panel));
        }
        input:focus, textarea:focus {
          border-color: var(--mvx-accent);
          box-shadow: var(--mvx-focus);
        }
        :host-context([data-mvx-variant="material"]) input:focus,
        :host-context([data-mvx-variant="material"]) textarea:focus {
          border-block-end-width: 2px;
          box-shadow: none;
        }
        :host([invalid]) input, :host([invalid]) textarea {
          border-color: var(--mvx-danger);
        }
        :host([disabled]) label,
        :host([disabled]) .helper {
          color: var(--mvx-disabled-fg);
        }
        input:disabled,
        textarea:disabled {
          border-color: var(--mvx-disabled-border);
          background: var(--mvx-disabled-bg);
          color: var(--mvx-disabled-fg);
          box-shadow: var(--mvx-disabled-shadow);
          cursor: not-allowed;
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
