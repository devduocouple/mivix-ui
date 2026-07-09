import { baseStyles, MvxElement, htmlEscape } from '../../core.js';

function parseIsoDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || '').trim());
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatIsoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDays(date, days) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

function addMonths(date, months) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

function isBetween(value, start, end) {
  return Boolean(start && end && value > start && value < end);
}

export class MvxDatePicker extends MvxElement {
  static observedAttributes = ['label', 'value', 'start', 'end', 'min', 'max', 'helper', 'disabled', 'required', 'range', 'type', 'open', 'auto-close'];

  constructor() {
    super();
    this._viewDate = null;
    this._onDocumentPointerDown = event => {
      if (!this.hasAttribute('open')) return;
      if (event.composedPath?.().includes(this)) return;
      this.removeAttribute('open');
    };
  }

  get value() {
    return this._value ?? this.getAttribute('value') ?? '';
  }

  set value(value) {
    this._value = Array.isArray(value) ? value.join(',') : String(value ?? '');
    this.setAttribute('value', this._value);
  }

  get open() {
    return this.hasAttribute('open');
  }

  set open(value) {
    this.toggleAttribute('open', Boolean(value));
  }

  connectedCallback() {
    super.connectedCallback();
    this.ownerDocument?.addEventListener('pointerdown', this._onDocumentPointerDown);
  }

  disconnectedCallback() {
    this.ownerDocument?.removeEventListener('pointerdown', this._onDocumentPointerDown);
    super.disconnectedCallback();
  }

  rangeParts() {
    const raw = String(this.value || `${this.getAttribute('start') || ''},${this.getAttribute('end') || ''}`);
    const [start = '', end = ''] = raw.split(',').map(item => item.trim());
    return [parseIsoDate(start) ? start : '', parseIsoDate(end) ? end : ''];
  }

  viewDate(startValue, endValue) {
    if (this._viewDate) return this._viewDate;
    return parseIsoDate(startValue) || parseIsoDate(endValue) || new Date();
  }

  monthLabel(date) {
    try {
      return new Intl.DateTimeFormat(this.locale, { month: 'long', year: 'numeric' }).format(date);
    } catch {
      return new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(date);
    }
  }

  shortDate(value) {
    const date = parseIsoDate(value);
    if (!date) return '';
    try {
      return new Intl.DateTimeFormat(this.locale, { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
    } catch {
      return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
    }
  }

  weekdayLabels() {
    const base = new Date(2026, 0, 4);
    return Array.from({ length: 7 }, (_, index) => {
      try {
        return new Intl.DateTimeFormat(this.locale, { weekday: 'short' }).format(addDays(base, index));
      } catch {
        return new Intl.DateTimeFormat(undefined, { weekday: 'short' }).format(addDays(base, index));
      }
    });
  }

  calendarDays(viewDate) {
    const first = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
    const gridStart = addDays(first, -first.getDay());
    return Array.from({ length: 42 }, (_, index) => addDays(gridStart, index));
  }

  isDisabledDate(value, min, max) {
    return Boolean((min && value < min) || (max && value > max));
  }

  displayRange(startValue, endValue) {
    if (startValue && endValue) return `${this.shortDate(startValue)} - ${this.shortDate(endValue)}`;
    if (startValue) return `${this.shortDate(startValue)} - Select end`;
    return this.getAttribute('placeholder') || 'Select date range';
  }

  commitRange(startValue = '', endValue = '', options = {}) {
    const nextValue = endValue ? `${startValue},${endValue}` : startValue;
    const previousValue = this.getAttribute('value') || '';
    this._value = nextValue;
    if (nextValue) {
      this.setAttribute('value', nextValue);
    } else {
      this.removeAttribute('value');
    }
    if (options.close) this.removeAttribute('open');
    this.emit('mvx-change', {
      value: startValue ? [startValue, endValue] : [],
      start: startValue,
      end: endValue
    });
    if (!options.close && previousValue === nextValue) this.render();
  }

  renderNativePicker({ id, label, helper, type, min, max, range, disabled, startValue, endValue }) {
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
        :host([disabled]) label,
        :host([disabled]) .helper {
          color: var(--mvx-disabled-fg);
        }
        input:disabled {
          cursor: not-allowed;
          border-color: var(--mvx-disabled-border);
          background: var(--mvx-disabled-bg);
          color: var(--mvx-disabled-fg);
          box-shadow: var(--mvx-disabled-shadow);
          filter: saturate(0.88);
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

  renderRangeCalendar({ id, label, helper, min, max, disabled, startValue, endValue }) {
    const viewDate = this.viewDate(startValue, endValue);
    const monthLabel = this.monthLabel(viewDate);
    const isOpen = this.hasAttribute('open');
    const today = formatIsoDate(new Date());
    const days = this.calendarDays(viewDate);
    const weekdays = this.weekdayLabels();
    this.shadowRoot.innerHTML = `
      <style>
        ${baseStyles}
        :host {
          display: block;
          position: relative;
        }
        .field {
          display: grid;
          gap: 7px;
          color: var(--mvx-muted);
          font-size: 13px;
          font-weight: 650;
        }
        .trigger {
          position: relative;
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 10px;
          align-items: center;
          inline-size: 100%;
          min-block-size: 42px;
          border: 1px solid var(--mvx-border);
          border-radius: var(--mvx-radius-sm);
          background: var(--mvx-control-glaze), var(--mvx-bg-inset);
          color: var(--mvx-fg);
          box-shadow: var(--mvx-control-shadow);
          cursor: pointer;
          padding: 9px 12px;
          text-align: start;
          transition: border-color var(--mvx-duration), box-shadow var(--mvx-duration), transform var(--mvx-duration-fast);
        }
        .trigger:hover:not(:disabled),
        .trigger[aria-expanded="true"] {
          border-color: var(--mvx-border-strong);
          transform: translateY(var(--mvx-hover-lift));
        }
        .trigger:focus-visible {
          outline: none;
          box-shadow: var(--mvx-focus), var(--mvx-control-shadow);
        }
        .trigger:disabled {
          cursor: not-allowed;
          border-color: var(--mvx-disabled-border);
          background: var(--mvx-disabled-bg);
          color: var(--mvx-disabled-fg);
          box-shadow: var(--mvx-disabled-shadow);
          transform: none;
          filter: saturate(0.88);
        }
        :host([disabled]) .field,
        :host([disabled]) .helper {
          color: var(--mvx-disabled-fg);
        }
        .value {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .calendar-icon {
          position: relative;
          inline-size: 17px;
          block-size: 17px;
          border: 1px solid currentColor;
          border-radius: 4px;
          opacity: 0.8;
        }
        .calendar-icon::before {
          content: "";
          position: absolute;
          inset-inline: 3px;
          inset-block-start: 4px;
          block-size: 1px;
          background: currentColor;
        }
        .calendar-icon::after {
          content: "";
          position: absolute;
          inset-inline-start: 4px;
          inset-block-start: -3px;
          inline-size: 2px;
          block-size: 5px;
          border-radius: 999px;
          background: currentColor;
          box-shadow: 7px 0 0 currentColor;
        }
        .helper {
          color: var(--mvx-subtle);
          font-size: 12px;
          font-weight: 500;
        }
        .popover {
          position: absolute;
          inset-block-start: calc(100% + 8px);
          inset-inline-start: 0;
          z-index: 30;
          display: ${isOpen ? 'grid' : 'none'};
          gap: 12px;
          inline-size: min(360px, max(100%, 320px));
          padding: 12px;
        }
        .calendar-head {
          display: grid;
          grid-template-columns: 34px minmax(0, 1fr) 34px;
          gap: 8px;
          align-items: center;
        }
        .month {
          color: var(--mvx-fg);
          font-size: 14px;
          font-weight: 800;
          text-align: center;
        }
        .nav {
          display: grid;
          place-items: center;
          inline-size: 34px;
          block-size: 34px;
          border: 1px solid var(--mvx-border);
          border-radius: var(--mvx-radius-sm);
          background: var(--mvx-control-glaze), var(--mvx-bg-inset);
          color: var(--mvx-fg);
          cursor: pointer;
        }
        .nav:hover:not(:disabled) {
          border-color: var(--mvx-border-strong);
          color: var(--mvx-accent-2);
        }
        .weekdays,
        .days {
          display: grid;
          grid-template-columns: repeat(7, minmax(0, 1fr));
          gap: 4px;
        }
        .weekday {
          color: var(--mvx-subtle);
          font-size: 11px;
          font-weight: 800;
          text-align: center;
        }
        .day {
          position: relative;
          display: grid;
          place-items: center;
          aspect-ratio: 1;
          min-block-size: 34px;
          border: 1px solid transparent;
          border-radius: var(--mvx-radius-sm);
          background: transparent;
          color: var(--mvx-muted);
          cursor: pointer;
          font: inherit;
          font-size: 12px;
          font-weight: 750;
          transition: background var(--mvx-duration-fast), border-color var(--mvx-duration-fast), color var(--mvx-duration-fast), transform var(--mvx-duration-fast);
        }
        .day:hover:not(:disabled) {
          border-color: var(--mvx-border-strong);
          background: color-mix(in srgb, var(--mvx-accent) 12%, var(--mvx-bg-inset));
          color: var(--mvx-fg);
          transform: translateY(var(--mvx-hover-lift));
        }
        .day:focus-visible {
          outline: none;
          box-shadow: var(--mvx-focus);
        }
        .day.outside {
          color: var(--mvx-subtle);
          opacity: 0.58;
        }
        .day.in-range {
          border-color: color-mix(in srgb, var(--mvx-accent) 14%, transparent);
          background: color-mix(in srgb, var(--mvx-accent) 15%, var(--mvx-bg-inset));
          color: var(--mvx-fg);
        }
        .day.selected {
          border-color: color-mix(in srgb, var(--mvx-accent-2) 50%, var(--mvx-accent));
          background: linear-gradient(180deg, color-mix(in srgb, var(--mvx-accent-2) 26%, var(--mvx-accent)), var(--mvx-accent));
          color: #fff;
          box-shadow: 0 8px 18px color-mix(in srgb, var(--mvx-accent) 26%, transparent);
        }
        .day.today:not(.selected)::after {
          content: "";
          position: absolute;
          inset-block-end: 4px;
          inline-size: 4px;
          block-size: 4px;
          border-radius: 999px;
          background: var(--mvx-accent-2);
        }
        .day:disabled {
          cursor: not-allowed;
          border-color: transparent;
          background: transparent;
          color: var(--mvx-disabled-fg);
          box-shadow: none;
          filter: saturate(0.88);
        }
        .range-preview {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px;
        }
        .chip {
          min-block-size: 42px;
          border: 1px solid var(--mvx-border);
          border-radius: var(--mvx-radius-sm);
          background: color-mix(in srgb, var(--mvx-bg-inset) 82%, transparent);
          padding: 7px 9px;
        }
        .chip span {
          display: block;
          color: var(--mvx-subtle);
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
        }
        .chip strong {
          display: block;
          overflow: hidden;
          color: var(--mvx-fg);
          font-size: 12px;
          font-weight: 800;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .actions {
          display: flex;
          justify-content: end;
          gap: 8px;
        }
        .action {
          min-block-size: 32px;
          border: 1px solid var(--mvx-border);
          border-radius: var(--mvx-radius-sm);
          background: var(--mvx-control-glaze), var(--mvx-bg-inset);
          color: var(--mvx-fg);
          cursor: pointer;
          font: inherit;
          font-size: 12px;
          font-weight: 800;
          padding: 0 10px;
        }
        .action.primary {
          border-color: color-mix(in srgb, var(--mvx-accent) 64%, var(--mvx-border));
          background: var(--mvx-accent);
          color: #fff;
        }
        @media (max-width: 460px) {
          .popover {
            position: fixed;
            inset-inline: 12px;
            inset-block-start: 76px;
            inline-size: auto;
          }
        }
      </style>
      <div class="field">
        ${label ? `<span id="${id}-label">${htmlEscape(label)}</span>` : ''}
        <button
          part="trigger"
          class="trigger"
          type="button"
          aria-haspopup="dialog"
          aria-expanded="${isOpen}"
          ${label ? `aria-labelledby="${id}-label ${id}-value"` : `aria-label="${htmlEscape(this.displayRange(startValue, endValue))}"`}
          ${disabled ? 'disabled' : ''}
        >
          <span class="value" id="${id}-value">${htmlEscape(this.displayRange(startValue, endValue))}</span>
          <span class="calendar-icon" aria-hidden="true"></span>
        </button>
        ${helper ? `<span class="helper">${htmlEscape(helper)}</span>` : ''}
        <section class="popover edge" part="calendar" role="dialog" aria-label="${htmlEscape(label || 'Select date range')}">
          <div class="calendar-head">
            <button class="nav" type="button" data-nav="-1" aria-label="Previous month">&lt;</button>
            <span class="month">${htmlEscape(monthLabel)}</span>
            <button class="nav" type="button" data-nav="1" aria-label="Next month">&gt;</button>
          </div>
          <div class="weekdays" aria-hidden="true">
            ${weekdays.map(day => `<span class="weekday">${htmlEscape(day)}</span>`).join('')}
          </div>
          <div class="days" role="grid">
            ${days.map(date => {
              const value = formatIsoDate(date);
              const selected = value === startValue || value === endValue;
              const disabledDate = this.isDisabledDate(value, min, max);
              const className = [
                'day',
                date.getMonth() !== viewDate.getMonth() ? 'outside' : '',
                isBetween(value, startValue, endValue) ? 'in-range' : '',
                selected ? 'selected' : '',
                value === today ? 'today' : ''
              ].filter(Boolean).join(' ');
              return `<button class="${className}" type="button" role="gridcell" data-date="${value}" aria-pressed="${selected}" ${disabledDate ? 'disabled' : ''}>${date.getDate()}</button>`;
            }).join('')}
          </div>
          <div class="range-preview">
            <span class="chip"><span>Start</span><strong>${htmlEscape(this.shortDate(startValue) || '-')}</strong></span>
            <span class="chip"><span>End</span><strong>${htmlEscape(this.shortDate(endValue) || '-')}</strong></span>
          </div>
          <div class="actions">
            <button class="action" type="button" data-action="clear">Clear</button>
            <button class="action primary" type="button" data-action="done">Done</button>
          </div>
        </section>
      </div>
    `;

    this.shadowRoot.querySelector('.trigger')?.addEventListener('click', () => {
      if (disabled) return;
      this.toggleAttribute('open');
    });
    this.shadowRoot.querySelectorAll('[data-nav]').forEach(button => {
      button.addEventListener('click', () => {
        this._viewDate = addMonths(viewDate, Number(button.dataset.nav || 0));
        this.render();
      });
    });
    this.shadowRoot.querySelectorAll('[data-date]').forEach(button => {
      button.addEventListener('click', () => {
        const selected = button.dataset.date;
        let [start, end] = this.rangeParts();
        if (!start || end) {
          start = selected;
          end = '';
        } else if (selected < start) {
          end = start;
          start = selected;
        } else if (selected === start) {
          end = '';
        } else {
          end = selected;
        }
        this._viewDate = parseIsoDate(selected);
        this.commitRange(start, end, { close: this.hasAttribute('auto-close') && Boolean(start && end) });
      });
    });
    this.shadowRoot.querySelector('[data-action="clear"]')?.addEventListener('click', () => {
      this.commitRange('', '', { close: false });
    });
    this.shadowRoot.querySelector('[data-action="done"]')?.addEventListener('click', () => {
      this.removeAttribute('open');
    });
    this.shadowRoot.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        event.preventDefault();
        this.removeAttribute('open');
        this.shadowRoot.querySelector('.trigger')?.focus();
      }
    });
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
    const [startValue, endValue] = String(this.value || `${this.getAttribute('start') || ''},${this.getAttribute('end') || ''}`).split(',').map(item => item.trim());

    if (range && type === 'date') {
      this.renderRangeCalendar({ id, label, helper, min, max, disabled, startValue, endValue });
      return;
    }

    this.renderNativePicker({ id, label, helper, type, min, max, range, disabled, startValue, endValue });
  }
}
