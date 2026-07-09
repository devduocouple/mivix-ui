import { baseStyles, MvxElement, htmlEscape } from '../../core.js';

export class MvxTextarea extends MvxElement {
  static observedAttributes = ['label', 'placeholder', 'value', 'rows', 'helper', 'invalid', 'disabled', 'readonly', 'maxlength', 'resize', 'auto-grow'];

  get value() {
    return this._value ?? this.getAttribute('value') ?? '';
  }

  set value(value) {
    this._value = String(value ?? '');
    const field = this.shadowRoot?.querySelector('textarea');
    if (field) field.value = this._value;
  }

  grow(field) {
    if (!this.hasAttribute('auto-grow')) return;
    field.style.height = 'auto';
    field.style.height = `${field.scrollHeight}px`;
  }

  render() {
    const id = `mvx-${Math.random().toString(36).slice(2)}`;
    const label = this.getAttribute('label') || '';
    const helper = this.getAttribute('helper') || '';
    const placeholder = this.getAttribute('placeholder') || '';
    const rows = this.getAttribute('rows') || '4';
    const maxlength = this.getAttribute('maxlength');
    const resize = this.getAttribute('resize') || 'vertical';
    const helperId = helper || maxlength ? `${id}-meta` : '';
    const controlLabel = label || placeholder || this.t('textarea', 'Text area');
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
        textarea {
          inline-size: 100%;
          min-block-size: 80px;
          border: 1px solid var(--mvx-border);
          border-radius: var(--mvx-radius-sm);
          background: var(--mvx-bg-inset);
          color: var(--mvx-fg);
          line-height: 1.45;
          outline: none;
          padding: 10px 12px;
          resize: ${htmlEscape(resize)};
        }
        textarea:focus {
          border-color: var(--mvx-accent);
          box-shadow: var(--mvx-focus);
        }
        :host([invalid]) textarea {
          border-color: var(--mvx-danger);
        }
        :host([disabled]) label,
        :host([disabled]) .meta {
          color: var(--mvx-disabled-fg);
        }
        textarea:disabled,
        textarea[readonly] {
          border-color: var(--mvx-disabled-border);
          background: var(--mvx-disabled-bg);
          color: var(--mvx-disabled-fg);
          box-shadow: var(--mvx-disabled-shadow);
          cursor: not-allowed;
          filter: saturate(0.88);
        }
        .meta {
          display: flex;
          gap: 10px;
          justify-content: space-between;
          color: var(--mvx-subtle);
          font-size: 12px;
          font-weight: 500;
        }
      </style>
      <label for="${id}">
        ${label ? `<span>${htmlEscape(label)}</span>` : ''}
        <textarea part="textarea" id="${id}" rows="${htmlEscape(rows)}" placeholder="${htmlEscape(placeholder)}" aria-label="${htmlEscape(controlLabel)}" ${helperId ? `aria-describedby="${helperId}"` : ''} aria-invalid="${this.hasAttribute('invalid')}" ${maxlength ? `maxlength="${htmlEscape(maxlength)}"` : ''} ${this.hasAttribute('disabled') ? 'disabled' : ''} ${this.hasAttribute('readonly') ? 'readonly' : ''}>${htmlEscape(this.value)}</textarea>
        <span class="meta" ${helperId ? `id="${helperId}"` : ''}>
          <span>${htmlEscape(helper)}</span>
          ${maxlength ? `<span class="count">${this.value.length}/${htmlEscape(maxlength)}</span>` : ''}
        </span>
      </label>
    `;
    const field = this.shadowRoot.querySelector('textarea');
    const count = this.shadowRoot.querySelector('.count');
    field.value = this.value;
    this.grow(field);
    field.addEventListener('input', () => {
      this._value = field.value;
      if (count) count.textContent = `${this._value.length}/${maxlength}`;
      this.grow(field);
      this.emit('mvx-change', { value: this._value });
    });
  }
}
