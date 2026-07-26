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
    const valuePercent = value => {
      const span = this.max - this.min;
      if (!Number.isFinite(span) || span <= 0) return 0;
      return Math.max(0, Math.min(100, ((Number(value) - this.min) / span) * 100));
    };
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
          --slider-track-size: 4px;
          --slider-thumb-size: 18px;
          --slider-fill: var(--mvx-accent);
          --slider-rest: color-mix(in srgb, var(--mvx-muted) 28%, var(--mvx-bg-inset));
          appearance: none;
          -webkit-appearance: none;
          inline-size: 100%;
          block-size: 28px;
          margin: 0;
          border-radius: 999px;
          background:
            linear-gradient(90deg, var(--slider-fill) 0 var(--slider-percent, 0%), var(--slider-rest) var(--slider-percent, 0%) 100%) center / 100% var(--slider-track-size) no-repeat;
          cursor: pointer;
        }
        input[type="range"]::-webkit-slider-runnable-track {
          block-size: var(--slider-track-size);
          border: 0;
          border-radius: 999px;
          background: transparent;
        }
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          -webkit-appearance: none;
          inline-size: var(--slider-thumb-size);
          block-size: var(--slider-thumb-size);
          border: 0;
          border-radius: 999px;
          background: linear-gradient(180deg, white, #bfc7d3);
          box-shadow: 0 2px 7px rgba(0, 0, 0, 0.4);
          margin-block-start: calc((var(--slider-track-size) - var(--slider-thumb-size)) / 2);
          transition:
            box-shadow var(--mvx-duration),
            transform var(--mvx-duration-fast);
        }
        input[type="range"]::-moz-range-track {
          block-size: var(--slider-track-size);
          border: 0;
          border-radius: 999px;
          background: transparent;
        }
        input[type="range"]::-moz-range-thumb {
          inline-size: var(--slider-thumb-size);
          block-size: var(--slider-thumb-size);
          border: 0;
          border-radius: 999px;
          background: linear-gradient(180deg, white, #bfc7d3);
          box-shadow: 0 2px 7px rgba(0, 0, 0, 0.4);
          transition:
            box-shadow var(--mvx-duration),
            transform var(--mvx-duration-fast);
        }
        input[type="range"]:hover:not(:disabled)::-webkit-slider-thumb {
          transform: scale(1.04);
        }
        input[type="range"]:hover:not(:disabled)::-moz-range-thumb {
          transform: scale(1.04);
        }
        input[type="range"]:active:not(:disabled)::-webkit-slider-thumb {
          transform: scale(1.12);
        }
        input[type="range"]:active:not(:disabled)::-moz-range-thumb {
          transform: scale(1.12);
        }
        input:focus-visible {
          outline: none;
          box-shadow: none;
        }
        input:focus-visible::-webkit-slider-thumb {
          box-shadow: var(--mvx-focus), 0 2px 7px rgba(0, 0, 0, 0.4);
        }
        input:focus-visible::-moz-range-thumb {
          box-shadow: var(--mvx-focus), 0 2px 7px rgba(0, 0, 0, 0.4);
        }
        input:disabled {
          cursor: not-allowed;
          filter: grayscale(0.18) saturate(0.82);
        }
        input:disabled::-webkit-slider-thumb {
          background: color-mix(in srgb, var(--mvx-disabled-fg) 34%, var(--mvx-bg-panel));
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.18);
        }
        input:disabled::-moz-range-thumb {
          background: color-mix(in srgb, var(--mvx-disabled-fg) 34%, var(--mvx-bg-panel));
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.18);
        }
        :host-context([data-mvx-variant="material"]) input[type="range"] {
          --slider-track-size: 4px;
          --slider-rest: color-mix(in srgb, var(--mvx-fg) 28%, transparent);
        }
        :host-context([data-mvx-variant="material"]) input[type="range"]::-webkit-slider-thumb {
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.28);
          transition:
            box-shadow var(--mvx-motion-duration-short) var(--mvx-motion-easing-standard),
            transform var(--mvx-motion-duration-short) var(--mvx-motion-easing-standard);
        }
        :host-context([data-mvx-variant="material"]) input[type="range"]::-moz-range-thumb {
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.28);
          transition:
            box-shadow var(--mvx-motion-duration-short) var(--mvx-motion-easing-standard),
            transform var(--mvx-motion-duration-short) var(--mvx-motion-easing-standard);
        }
        :host-context([data-mvx-variant="material"]) input[type="range"]:hover:not(:disabled)::-webkit-slider-thumb {
          box-shadow: 0 0 0 10px var(--mvx-state-layer-hover), 0 1px 3px rgba(0, 0, 0, 0.28);
          transform: none;
        }
        :host-context([data-mvx-variant="material"]) input[type="range"]:hover:not(:disabled)::-moz-range-thumb {
          box-shadow: 0 0 0 10px var(--mvx-state-layer-hover), 0 1px 3px rgba(0, 0, 0, 0.28);
          transform: none;
        }
        :host-context([data-mvx-variant="material"]) input[type="range"]:active:not(:disabled)::-webkit-slider-thumb {
          box-shadow: 0 0 0 10px var(--mvx-state-layer-pressed), 0 1px 3px rgba(0, 0, 0, 0.28);
          transform: scaleX(1.25);
        }
        :host-context([data-mvx-variant="material"]) input[type="range"]:active:not(:disabled)::-moz-range-thumb {
          box-shadow: 0 0 0 10px var(--mvx-state-layer-pressed), 0 1px 3px rgba(0, 0, 0, 0.28);
          transform: scaleX(1.25);
        }
        :host([disabled]) .head,
        :host([disabled]) .value {
          color: var(--mvx-disabled-fg);
        }
      </style>
      <div class="wrap" part="slider">
        <div class="head">
          <span>${htmlEscape(label)}</span>
          ${this.hasAttribute('show-value') ? `<span class="value">${htmlEscape(display)}</span>` : ''}
        </div>
        <div class="inputs">
          <input data-handle="0" type="range" style="--slider-percent:${valuePercent(values[0])}%" aria-label="${htmlEscape(range ? `${sliderLabel} ${this.t('minimum', 'minimum')}` : sliderLabel)}" min="${this.min}" max="${this.max}" step="${htmlEscape(this.step)}" value="${values[0]}" ${disabled ? 'disabled' : ''} />
          ${range ? `<input data-handle="1" type="range" style="--slider-percent:${valuePercent(values[1])}%" aria-label="${htmlEscape(`${sliderLabel} ${this.t('maximum', 'maximum')}`)}" min="${this.min}" max="${this.max}" step="${htmlEscape(this.step)}" value="${values[1]}" ${disabled ? 'disabled' : ''} />` : ''}
        </div>
      </div>
    `;
    const inputs = [...this.shadowRoot.querySelectorAll('input')];
    const syncInputProgress = input => {
      input.style.setProperty('--slider-percent', `${valuePercent(input.value)}%`);
    };
    inputs.forEach(input => {
      input.addEventListener('input', () => {
        const current = inputs.map(item => Number(item.value));
        const next = range ? `${Math.min(...current)},${Math.max(...current)}` : String(current[0]);
        this._value = next;
        this.setAttribute('value', next);
        inputs.forEach(syncInputProgress);
        this.emit('mvx-change', { value: range ? this.values() : this.values()[0] });
      });
    });
  }
}
