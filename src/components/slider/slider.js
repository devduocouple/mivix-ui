import { baseStyles, MvxElement, htmlEscape } from '../../core.js';

export class MvxSlider extends MvxElement {
  static observedAttributes = ['label', 'value', 'min', 'max', 'step', 'disabled', 'range', 'show-value', 'unit'];

  get value() {
    return this._value ?? this.getAttribute('value') ?? (this.hasAttribute('range') ? `${this.min},${this.max}` : String(this.min));
  }

  set value(value) {
    this._value = Array.isArray(value) ? value.join(',') : String(value ?? '');
    this.setAttribute('value', this._value);
  }

  get min() {
    return Number(this.getAttribute('min') ?? 0);
  }

  get max() {
    return Number(this.getAttribute('max') ?? 100);
  }

  get step() {
    return this.getAttribute('step') ?? '1';
  }

  values() {
    const parts = String(this.value).split(',').map(value => Number(value.trim()));
    if (this.hasAttribute('range')) {
      const first = Number.isFinite(parts[0]) ? parts[0] : this.min;
      const second = Number.isFinite(parts[1]) ? parts[1] : this.max;
      return [Math.min(first, second), Math.max(first, second)];
    }
    return [Number.isFinite(parts[0]) ? parts[0] : this.min];
  }

  render() {
    const label = this.getAttribute('label') || '';
    const unit = this.getAttribute('unit') || '';
    const range = this.hasAttribute('range');
    const disabled = this.hasAttribute('disabled');
    const values = this.values();
    const display = range ? `${values[0]}${unit} - ${values[1]}${unit}` : `${values[0]}${unit}`;
    const sliderLabel = label || this.t('slider', 'Slider');
    this.shadowRoot.innerHTML = `
      <style>
        ${baseStyles}
        :host { display: block; }
        .wrap {
          display: grid;
          gap: 8px;
        }
        .head {
          display: flex;
          gap: 10px;
          justify-content: space-between;
          color: var(--mvx-muted);
          font-size: 13px;
          font-weight: 700;
        }
        .value {
          color: var(--mvx-accent-2);
          font-family: var(--mvx-font-mono);
          font-size: 12px;
        }
        .inputs {
          display: grid;
          gap: 6px;
        }
        input[type="range"] {
          inline-size: 100%;
          accent-color: var(--mvx-accent);
        }
        input:focus-visible {
          outline: none;
          box-shadow: var(--mvx-focus);
        }
        input:disabled {
          cursor: not-allowed;
          opacity: 0.55;
        }
      </style>
      <div class="wrap" part="slider">
        <div class="head">
          <span>${htmlEscape(label)}</span>
          ${this.hasAttribute('show-value') ? `<span class="value">${htmlEscape(display)}</span>` : ''}
        </div>
        <div class="inputs">
          <input data-handle="0" type="range" aria-label="${htmlEscape(range ? `${sliderLabel} ${this.t('minimum', 'minimum')}` : sliderLabel)}" min="${this.min}" max="${this.max}" step="${htmlEscape(this.step)}" value="${values[0]}" ${disabled ? 'disabled' : ''} />
          ${range ? `<input data-handle="1" type="range" aria-label="${htmlEscape(`${sliderLabel} ${this.t('maximum', 'maximum')}`)}" min="${this.min}" max="${this.max}" step="${htmlEscape(this.step)}" value="${values[1]}" ${disabled ? 'disabled' : ''} />` : ''}
        </div>
      </div>
    `;
    const inputs = [...this.shadowRoot.querySelectorAll('input')];
    inputs.forEach(input => {
      input.addEventListener('input', () => {
        const current = inputs.map(item => Number(item.value));
        const next = range ? `${Math.min(...current)},${Math.max(...current)}` : String(current[0]);
        this._value = next;
        this.setAttribute('value', next);
        this.emit('mvx-change', { value: range ? this.values() : this.values()[0] });
      });
    });
  }
}
