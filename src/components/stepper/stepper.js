import { baseStyles, MvxElement, parseData, htmlEscape } from '../../core.js';

export class MvxStepper extends MvxElement {
  static observedAttributes = ['steps', 'active', 'orientation', 'linear'];

  set steps(value) {
    this._steps = value;
    if (this.isConnected) this.render();
  }

  get steps() {
    return parseData(this._steps ?? this.getAttribute('steps'), []);
  }

  get active() {
    return Number(this.getAttribute('active') ?? 0);
  }

  set active(value) {
    this.setAttribute('active', String(Math.max(0, Number(value) || 0)));
  }

  select(index) {
    const steps = this.steps;
    const step = steps[index];
    if (!step || step.disabled) return;
    if (this.hasAttribute('linear') && index > this.active + 1) return;
    this.active = index;
    this.emit('mvx-change', { active: index, step });
    this.render();
  }

  render() {
    const steps = this.steps.map(step => typeof step === 'string' ? { label: step } : step);
    const vertical = this.getAttribute('orientation') === 'vertical';
    this.shadowRoot.innerHTML = `
      <style>
        ${baseStyles}
        :host { display: block; }
        ol {
          display: grid;
          grid-template-columns: ${vertical ? '1fr' : `repeat(${Math.max(steps.length, 1)}, minmax(0, 1fr))`};
          gap: ${vertical ? '8px' : '10px'};
          margin: 0;
          padding: 0;
          list-style: none;
        }
        button {
          display: grid;
          grid-template-columns: 30px minmax(0, 1fr);
          gap: 9px;
          align-items: start;
          inline-size: 100%;
          min-block-size: 46px;
          border: 1px solid var(--mvx-border);
          border-radius: var(--mvx-radius-sm);
          background: var(--mvx-bg-panel);
          color: var(--mvx-muted);
          cursor: pointer;
          padding: 8px;
          text-align: start;
        }
        .index {
          display: grid;
          place-items: center;
          inline-size: 28px;
          block-size: 28px;
          border-radius: 999px;
          background: var(--mvx-bg-inset);
          color: var(--mvx-subtle);
          font-size: 12px;
          font-weight: 850;
        }
        button[data-state="active"],
        button[data-state="complete"] {
          border-color: color-mix(in srgb, var(--mvx-accent) 52%, var(--mvx-border));
          color: var(--mvx-fg);
        }
        button[data-state="active"] .index,
        button[data-state="complete"] .index {
          background: var(--mvx-accent);
          color: white;
        }
        .copy { display: grid; gap: 2px; min-inline-size: 0; }
        .label { font-size: 13px; font-weight: 750; }
        .description { color: var(--mvx-subtle); font-size: 12px; line-height: 1.35; }
        button:focus-visible { outline: none; box-shadow: var(--mvx-focus); }
        button:disabled { cursor: not-allowed; opacity: 0.55; }
      </style>
      <ol part="stepper" aria-label="${htmlEscape(this.t('steps', 'Steps'))}">
        ${steps.map((step, index) => {
          const state = index === this.active ? 'active' : index < this.active ? 'complete' : 'pending';
          return `
            <li>
              <button data-index="${index}" data-state="${state}" aria-current="${index === this.active ? 'step' : 'false'}" ${step.disabled ? 'disabled' : ''}>
                <span class="index">${state === 'complete' ? '&#10003;' : index + 1}</span>
                <span class="copy">
                  <span class="label">${htmlEscape(step.label || '')}</span>
                  ${step.description ? `<span class="description">${htmlEscape(step.description)}</span>` : ''}
                </span>
              </button>
            </li>
          `;
        }).join('')}
      </ol>
    `;
    this.shadowRoot.querySelectorAll('button[data-index]').forEach(button => {
      button.addEventListener('click', () => this.select(Number(button.dataset.index)));
    });
  }
}
