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

function normalizeIgnoredDate(value) {
  const raw = String(value || '').trim();
  const date = parseIsoDate(raw);
  return date && formatIsoDate(date) === raw ? raw : '';
}

function normalizeIgnoredRange(item) {
  if (typeof item === 'string') {
    const [rawStart, rawEnd = rawStart] = item.includes('..') ? item.split('..') : item.split(':');
    const start = normalizeIgnoredDate(rawStart);
    const end = normalizeIgnoredDate(rawEnd);
    if (!start || !end) return null;
    return start <= end ? { start, end, reason: '' } : { start: end, end: start, reason: '' };
  }
  if (Array.isArray(item)) {
    const start = normalizeIgnoredDate(item[0]);
    const end = normalizeIgnoredDate(item[1] ?? item[0]);
    if (!start || !end) return null;
    const reason = String(item[2] ?? '').trim();
    return start <= end ? { start, end, reason } : { start: end, end: start, reason };
  }
  if (item && typeof item === 'object') {
    const start = normalizeIgnoredDate(item.start ?? item.from ?? item.date);
    const end = normalizeIgnoredDate(item.end ?? item.to ?? item.start ?? item.from ?? item.date);
    if (!start || !end) return null;
    const reason = String(item.reason ?? item.hint ?? item.title ?? '').trim();
    return start <= end ? { start, end, reason } : { start: end, end: start, reason };
  }
  return null;
}

function normalizeIgnoredRanges(value) {
  if (!value) return [];
  const source = typeof value === 'string'
    ? (() => {
        try {
          return JSON.parse(value);
        } catch {
          return value.split(',').map(item => item.trim()).filter(Boolean);
        }
      })()
    : value;
  const items = Array.isArray(source) ? source : [source];
  return items.map(normalizeIgnoredRange).filter(Boolean);
}

function normalizeIgnoredDateEntry(item) {
  if (typeof item === 'string') {
    const date = normalizeIgnoredDate(item);
    return date ? { date, reason: '' } : null;
  }
  if (Array.isArray(item)) {
    const date = normalizeIgnoredDate(item[0]);
    return date ? { date, reason: String(item[1] ?? '').trim() } : null;
  }
  if (item && typeof item === 'object') {
    const date = normalizeIgnoredDate(item.date ?? item.value ?? item.day);
    const reason = String(item.reason ?? item.hint ?? item.title ?? '').trim();
    return date ? { date, reason } : null;
  }
  return null;
}

function normalizeIgnoredDates(value) {
  if (!value) return [];
  const source = typeof value === 'string'
    ? (() => {
        try {
          return JSON.parse(value);
        } catch {
          return value.split(',').map(item => item.trim()).filter(Boolean);
        }
      })()
    : value;
  const items = Array.isArray(source) ? source : [source];
  return items.map(normalizeIgnoredDateEntry).filter(Boolean);
}

export class MvxDatePicker extends MvxElement {
  static observedAttributes = ['label', 'value', 'start', 'end', 'min', 'max', 'helper', 'disabled', 'required', 'range', 'type', 'open', 'auto-close', 'mark-weekends', 'disable-before', 'disable-after', 'disable-before-reason', 'disable-after-reason', 'disabled-hints', 'ignored-dates', 'ignored-ranges', 'disabled-ranges'];

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

  get ignoredRanges() {
    return normalizeIgnoredRanges(this._ignoredRanges ?? this.getAttribute('ignored-ranges') ?? this.getAttribute('disabled-ranges'));
  }

  set ignoredRanges(value) {
    this._ignoredRanges = value;
    if (this.isConnected) this.render();
  }

  get ignoredDates() {
    return normalizeIgnoredDates(this._ignoredDates ?? this.getAttribute('ignored-dates'));
  }

  set ignoredDates(value) {
    this._ignoredDates = value;
    if (this.isConnected) this.render();
  }

  get markWeekends() {
    return this.hasAttribute('mark-weekends');
  }

  set markWeekends(value) {
    this.toggleAttribute('mark-weekends', Boolean(value));
  }

  get disabledHints() {
    return this.hasAttribute('disabled-hints');
  }

  set disabledHints(value) {
    this.toggleAttribute('disabled-hints', Boolean(value));
  }

  get disableBefore() {
    return this.getAttribute('disable-before') || '';
  }

  set disableBefore(value) {
    if (value === null || value === undefined || value === '') this.removeAttribute('disable-before');
    else this.setAttribute('disable-before', String(value));
  }

  get disableAfter() {
    return this.getAttribute('disable-after') || '';
  }

  set disableAfter(value) {
    if (value === null || value === undefined || value === '') this.removeAttribute('disable-after');
    else this.setAttribute('disable-after', String(value));
  }

  get disableBeforeReason() {
    return this.getAttribute('disable-before-reason') || '';
  }

  set disableBeforeReason(value) {
    if (value === null || value === undefined || value === '') this.removeAttribute('disable-before-reason');
    else this.setAttribute('disable-before-reason', String(value));
  }

  get disableAfterReason() {
    return this.getAttribute('disable-after-reason') || '';
  }

  set disableAfterReason(value) {
    if (value === null || value === undefined || value === '') this.removeAttribute('disable-after-reason');
    else this.setAttribute('disable-after-reason', String(value));
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

  monthLabels() {
    return Array.from({ length: 12 }, (_, index) => {
      const date = new Date(2026, index, 1);
      try {
        return new Intl.DateTimeFormat(this.locale, { month: 'short' }).format(date);
      } catch {
        return new Intl.DateTimeFormat(undefined, { month: 'short' }).format(date);
      }
    });
  }

  calendarDays(viewDate) {
    const first = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
    const gridStart = addDays(first, -first.getDay());
    return Array.from({ length: 42 }, (_, index) => addDays(gridStart, index));
  }

  scrollYearIntoView(year) {
    const scroller = this.shadowRoot.querySelector('.year-accordion');
    if (!scroller) return;
    requestAnimationFrame(() => {
      const row = scroller.querySelector(`[data-year-toggle="${year}"]`) || scroller.querySelector('.year-row.selected');
      if (!row) return;
      scroller.scrollTop = row.offsetTop - (scroller.clientHeight / 2) + (row.clientHeight / 2);
    });
  }

  disabledReasonForDate(value, min, max) {
    const disableBefore = normalizeIgnoredDate(this.getAttribute('disable-before'));
    const disableAfter = normalizeIgnoredDate(this.getAttribute('disable-after'));
    if (disableBefore && value < disableBefore) return this.getAttribute('disable-before-reason') || `Before ${disableBefore}`;
    if (disableAfter && value > disableAfter) return this.getAttribute('disable-after-reason') || `After ${disableAfter}`;
    if (min && value < min) return `Before ${min}`;
    if (max && value > max) return `After ${max}`;
    const ignoredDate = this.ignoredDates.find(item => item.date === value);
    if (ignoredDate) return ignoredDate.reason || 'Unavailable date';
    const ignoredRange = this.ignoredRanges.find(range => value >= range.start && value <= range.end);
    if (ignoredRange) return ignoredRange.reason || 'Unavailable date range';
    return '';
  }

  isDisabledDate(value, min, max) {
    return Boolean(this.disabledReasonForDate(value, min, max));
  }

  disabledHintAttributes(value, min, max) {
    if (!this.hasAttribute('disabled-hints')) return '';
    const reason = this.disabledReasonForDate(value, min, max);
    return reason ? ` title="${htmlEscape(reason)}" aria-label="${htmlEscape(`${value}. ${reason}`)}"` : '';
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
    const headerMonthLabel = (() => {
      try {
        return new Intl.DateTimeFormat(this.locale, { month: 'long' }).format(viewDate);
      } catch {
        return new Intl.DateTimeFormat(undefined, { month: 'long' }).format(viewDate);
      }
    })();
    const headerYearLabel = String(viewDate.getFullYear());
    const isOpen = this.hasAttribute('open');
    const today = formatIsoDate(new Date());
    const days = this.calendarDays(viewDate);
    const weekdays = this.weekdayLabels();
    const monthLabels = this.monthLabels();
    const calendarMode = this._calendarMode === 'years' ? 'years' : 'days';
    const year = viewDate.getFullYear();
    const expandedYear = Number.isInteger(this._expandedYear) ? this._expandedYear : null;
    const yearRangeCenter = expandedYear ?? year;
    const yearRangeStart = yearRangeCenter - 50;
    const headerStep = calendarMode === 'years' ? 144 : 1;
    const headerLabel = calendarMode === 'years' ? `${yearRangeStart}-${yearRangeStart + 100}` : monthLabel;
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
        :host-context([data-mvx-variant="material"]) .trigger {
          transition:
            border-color var(--mvx-motion-duration-short) var(--mvx-motion-easing-standard),
            background var(--mvx-motion-duration-short) var(--mvx-motion-easing-standard);
        }
        :host-context([data-mvx-variant="material"]) .trigger:hover:not(:disabled),
        :host-context([data-mvx-variant="material"]) .trigger[aria-expanded="true"] {
          background: var(--mvx-state-layer-hover);
          transform: none;
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
          overflow: hidden;
          border-radius: var(--mvx-radius-lg);
          padding: 12px;
        }
        .calendar-head {
          display: grid;
          grid-template-columns: 36px minmax(0, 1fr) 36px;
          gap: 8px;
          align-items: center;
        }
        .title-controls {
          display: flex;
          justify-content: center;
          gap: 4px;
          min-inline-size: 0;
        }
        .title-trigger {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          min-inline-size: 0;
          min-block-size: 36px;
          border-color: transparent;
          border-radius: var(--mvx-radius-sm);
          background: transparent;
          box-shadow: none;
          color: var(--mvx-fg);
          cursor: pointer;
          font: inherit;
          overflow: hidden;
          padding: 0 12px;
          text-align: center;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .title-month {
          display: block;
          overflow: hidden;
          color: var(--mvx-fg);
          font-size: 14px;
          font-weight: 820;
          line-height: 16px;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .title-year {
          display: block;
          color: var(--mvx-muted);
          font-size: 12px;
          font-variant-numeric: tabular-nums;
          font-weight: 720;
          line-height: 16px;
        }
        .title-trigger:hover:not(:disabled) .title-year,
        .title-trigger.active .title-year {
          color: color-mix(in srgb, var(--mvx-accent) 72%, var(--mvx-fg));
        }
        .title-trigger:hover:not(:disabled),
        .title-trigger.active {
          border-color: transparent;
          background: color-mix(in srgb, var(--mvx-accent) 10%, transparent);
        }
        .title-trigger:focus-visible {
          outline: none;
          box-shadow: var(--mvx-focus);
        }
        .nav {
          --chevron-size: 9px;
          display: grid;
          place-items: center;
          inline-size: 36px;
          block-size: 36px;
          border-color: transparent;
          border-radius: 999px;
          background: transparent;
          box-shadow: none;
          color: var(--mvx-muted);
          cursor: pointer;
          padding: 0;
        }
        .nav:hover:not(:disabled) {
          border-color: transparent;
          background: color-mix(in srgb, var(--mvx-accent) 10%, transparent);
          color: var(--mvx-fg);
        }
        .nav::before {
          content: "";
          inline-size: var(--chevron-size);
          block-size: var(--chevron-size);
          border-block-start: 2px solid currentColor;
          border-inline-start: 2px solid currentColor;
        }
        .nav[data-direction="previous"]::before {
          transform: translateX(2px) rotate(-45deg);
        }
        .nav[data-direction="next"]::before {
          transform: translateX(-2px) rotate(135deg);
        }
        .weekdays,
        .days {
          display: grid;
          grid-template-columns: repeat(7, 36px);
          justify-content: center;
          gap: 2px;
        }
        .year-accordion {
          display: grid;
          gap: 2px;
          max-block-size: 252px;
          overflow-y: auto;
          overscroll-behavior: contain;
          padding-inline-end: 2px;
          scrollbar-gutter: stable;
        }
        .year-panel {
          display: grid;
          gap: 2px;
          border: 1px solid transparent;
          border-radius: var(--mvx-radius-sm);
        }
        .year-panel.expanded {
          gap: 4px;
          border-color: color-mix(in srgb, var(--mvx-accent) 36%, var(--mvx-border));
          background: color-mix(in srgb, var(--mvx-accent) 16%, var(--mvx-bg-panel));
          padding: 4px;
          box-shadow:
            inset 0 1px 0 color-mix(in srgb, white 38%, transparent),
            0 6px 16px color-mix(in srgb, var(--mvx-accent) 10%, transparent);
        }
        .year-month-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 3px;
          padding: 0;
        }
        .year-row,
        .month-option {
          display: grid;
          place-items: center;
          min-block-size: 34px;
          border: 1px solid transparent;
          border-radius: var(--mvx-radius-sm);
          background: transparent;
          color: var(--mvx-muted);
          cursor: pointer;
          font: inherit;
          font-size: 11px;
          font-weight: 760;
          padding: 0;
          transition: background var(--mvx-duration-fast), border-color var(--mvx-duration-fast), color var(--mvx-duration-fast);
        }
        .year-row {
          justify-items: center;
          text-align: center;
          padding: 0 8px;
        }
        .year-panel.expanded .year-row {
          background: transparent;
          border-color: transparent;
          color: var(--mvx-fg);
          min-block-size: 28px;
        }
        .year-row span {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .month-option:hover:not(:disabled),
        .year-row:hover:not(:disabled) {
          border-color: color-mix(in srgb, var(--mvx-accent) 22%, var(--mvx-border));
          background: color-mix(in srgb, var(--mvx-accent) 7%, transparent);
          color: var(--mvx-fg);
        }
        .year-row.selected {
          border-color: color-mix(in srgb, var(--mvx-accent) 18%, transparent);
          background: color-mix(in srgb, var(--mvx-accent) 8%, transparent);
          color: var(--mvx-fg);
        }
        .month-option.selected {
          inline-size: 34px;
          block-size: 34px;
          justify-self: center;
          border-color: color-mix(in srgb, var(--mvx-accent) 46%, var(--mvx-border));
          border-radius: var(--mvx-radius-sm);
          background: color-mix(in srgb, var(--mvx-accent) 7%, var(--mvx-bg-inset));
          color: var(--mvx-fg);
          box-shadow:
            inset 0 1px 2px color-mix(in srgb, black 18%, transparent),
            inset 0 -1px 0 color-mix(in srgb, white 28%, transparent);
        }
        .weekday {
          display: grid;
          place-items: center;
          min-block-size: 24px;
          color: var(--mvx-subtle);
          font-size: 11px;
          font-weight: 850;
        }
        .weekday.weekend {
          color: color-mix(in srgb, var(--mvx-warning) 48%, var(--mvx-subtle));
        }
        .day {
          position: relative;
          display: grid;
          place-items: center;
          aspect-ratio: 1;
          inline-size: 34px;
          block-size: 34px;
          justify-self: center;
          border: 1px solid transparent;
          border-radius: var(--mvx-radius-sm);
          background: transparent;
          color: var(--mvx-muted);
          cursor: pointer;
          font: inherit;
          font-size: 12px;
          font-weight: 800;
          padding: 0;
          transition: background var(--mvx-duration-fast), border-color var(--mvx-duration-fast), color var(--mvx-duration-fast), transform var(--mvx-duration-fast);
        }
        .day:hover:not(:disabled) {
          border-color: var(--mvx-border-strong);
          background: color-mix(in srgb, var(--mvx-accent) 10%, var(--mvx-bg-inset));
          color: var(--mvx-fg);
          transform: translateY(var(--mvx-hover-lift));
        }
        :host-context([data-mvx-variant="material"]) .day:hover:not(:disabled) {
          background: var(--mvx-state-layer-hover);
          transform: none;
        }
        .day.weekend:not(.selected):not(.in-range):not(:disabled) {
          color: color-mix(in srgb, var(--mvx-warning) 46%, var(--mvx-muted));
        }
        .day:focus-visible {
          outline: none;
          box-shadow: var(--mvx-focus);
        }
        .day.outside {
          color: var(--mvx-subtle);
          opacity: 0.56;
        }
        .day.in-range {
          border-color: color-mix(in srgb, var(--mvx-accent) 14%, transparent);
          background: color-mix(in srgb, var(--mvx-accent) 15%, var(--mvx-bg-inset));
          color: var(--mvx-fg);
        }
        .day.selected {
          border-color: color-mix(in srgb, var(--mvx-accent-2) 55%, var(--mvx-accent));
          background: linear-gradient(180deg, color-mix(in srgb, var(--mvx-accent-2) 24%, var(--mvx-accent)), var(--mvx-accent));
          color: #fff;
          box-shadow: 0 8px 18px color-mix(in srgb, var(--mvx-accent) 25%, transparent);
        }
        .day.today:not(.selected)::after {
          content: "";
          position: absolute;
          inset-block-end: 5px;
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
          transform: none;
        }
        .range-preview {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0;
        }
        .chip {
          min-block-size: 42px;
          border: 1px solid var(--mvx-border);
          border-radius: 0;
          background: color-mix(in srgb, var(--mvx-bg-inset) 82%, transparent);
          padding: 7px 9px;
        }
        .chip:first-child {
          border-start-start-radius: var(--mvx-radius-sm);
          border-end-start-radius: var(--mvx-radius-sm);
        }
        .chip + .chip {
          border-inline-start: 0;
        }
        .chip:last-child {
          border-start-end-radius: var(--mvx-radius-sm);
          border-end-end-radius: var(--mvx-radius-sm);
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
          flex-wrap: wrap;
          align-items: stretch;
          justify-content: stretch;
          gap: 0;
          min-block-size: 40px;
          border-block-start: 1px solid var(--mvx-border);
          background: color-mix(in srgb, var(--mvx-bg-inset) 72%, transparent);
          margin: 0 -12px -12px;
          padding: 0;
        }
        .action {
          --picker-action-tone: var(--mvx-muted);
          flex: 1 1 0;
          min-block-size: 40px;
          border: 1px solid var(--mvx-border);
          border-block-start: 0;
          border-block-end: 0;
          border-inline-end: 0;
          border-radius: 0;
          background: var(--mvx-bg-inset);
          color: var(--mvx-fg);
          cursor: pointer;
          font: inherit;
          font-size: 12px;
          font-weight: 750;
          padding: 0 14px;
          transition:
            background var(--mvx-duration-fast),
            border-color var(--mvx-duration-fast),
            color var(--mvx-duration-fast),
            box-shadow var(--mvx-duration-fast),
            transform var(--mvx-duration-fast);
        }
        .action:first-child {
          border-inline-start: 1px solid var(--mvx-border);
          border-end-start-radius: var(--mvx-radius-lg);
        }
        .action:last-child {
          border-end-end-radius: var(--mvx-radius-lg);
        }
        .action:hover:not(:disabled) {
          background: color-mix(in srgb, var(--picker-action-tone) 12%, var(--mvx-bg-inset));
          border-color: var(--mvx-border-strong);
          color: var(--picker-action-tone);
          transform: none;
        }
        .action:active:not(:disabled) {
          transform: none;
          filter: brightness(0.96);
        }
        .action span {
          display: inline-block;
          transition: transform var(--mvx-duration-fast);
        }
        .action:hover:not(:disabled) span {
          transform: scale(0.97);
        }
        .action:active:not(:disabled) span {
          transform: scale(0.94);
        }
        .action:focus-visible {
          outline: none;
          box-shadow: var(--mvx-focus);
          z-index: 1;
        }
        .action.primary {
          --picker-action-tone: var(--mvx-accent);
          border-color: var(--picker-action-tone);
          background: var(--picker-action-tone);
          color: #fff;
        }
        .action.primary:hover:not(:disabled) {
          background: color-mix(in srgb, var(--picker-action-tone) 12%, var(--mvx-bg-inset));
          border-color: var(--mvx-border-strong);
          color: var(--picker-action-tone);
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
            <button class="nav" type="button" data-direction="previous" data-nav="${-headerStep}" aria-label="${calendarMode === 'years' ? 'Previous years' : 'Previous month'}"></button>
            <span class="title-controls" aria-label="${htmlEscape(headerLabel)}">
              <button class="title-trigger ${calendarMode === 'years' ? 'active' : ''}" type="button" data-calendar-mode="years" aria-label="Choose month and year">
                <span class="title-month">${htmlEscape(headerMonthLabel)}</span>
                <span class="title-year">${htmlEscape(headerYearLabel)}</span>
              </button>
            </span>
            <button class="nav" type="button" data-direction="next" data-nav="${headerStep}" aria-label="${calendarMode === 'years' ? 'Next years' : 'Next month'}"></button>
          </div>
          ${calendarMode === 'years'
            ? `<div class="year-accordion" aria-label="Choose year and month">
                ${Array.from({ length: 101 }, (_item, index) => yearRangeStart + index).map(optionYear => {
                  const expanded = optionYear === expandedYear;
                  return `<div class="year-panel ${expanded ? 'expanded' : ''}">
                    <button class="year-row ${optionYear === year ? 'selected' : ''}" type="button" data-year-toggle="${optionYear}" aria-expanded="${expanded}"><span>${optionYear}</span></button>
                    ${expanded ? `<div class="year-month-grid" role="grid" aria-label="Choose month in ${optionYear}">
                      ${monthLabels.map((monthName, index) => `<button class="month-option ${optionYear === year && index === viewDate.getMonth() ? 'selected' : ''}" type="button" role="gridcell" data-year="${optionYear}" data-month="${index}" aria-pressed="${optionYear === year && index === viewDate.getMonth()}">${htmlEscape(monthName)}</button>`).join('')}
                    </div>` : ''}
                  </div>`;
                }).join('')}
              </div>`
            : `<div class="weekdays" aria-hidden="true">
                ${weekdays.map((day, index) => {
                  const weekend = this.markWeekends && (index === 0 || index === 6);
                  return `<span class="weekday ${weekend ? 'weekend' : ''}">${htmlEscape(day)}</span>`;
                }).join('')}
              </div>
              <div class="days" role="grid">
                ${days.map(date => {
                  const value = formatIsoDate(date);
                  const selected = value === startValue || value === endValue;
                  const disabledDate = this.isDisabledDate(value, min, max);
                  const disabledHint = disabledDate ? this.disabledHintAttributes(value, min, max) : '';
                  const className = [
                    'day',
                    this.markWeekends && (date.getDay() === 0 || date.getDay() === 6) ? 'weekend' : '',
                    date.getMonth() !== viewDate.getMonth() ? 'outside' : '',
                    isBetween(value, startValue, endValue) ? 'in-range' : '',
                    selected ? 'selected' : '',
                    value === today ? 'today' : ''
                  ].filter(Boolean).join(' ');
                  return `<button class="${className}" type="button" role="gridcell" data-date="${value}" aria-pressed="${selected}"${disabledHint} ${disabledDate ? 'disabled' : ''}>${date.getDate()}</button>`;
                }).join('')}
              </div>`}
          <div class="range-preview">
            <span class="chip"><span>Start</span><strong>${htmlEscape(this.shortDate(startValue) || '-')}</strong></span>
            <span class="chip"><span>End</span><strong>${htmlEscape(this.shortDate(endValue) || '-')}</strong></span>
          </div>
          <div class="actions">
            <button class="action" type="button" data-action="clear"><span>Clear</span></button>
            <button class="action primary" type="button" data-action="done"><span>Done</span></button>
          </div>
        </section>
      </div>
    `;

    this.shadowRoot.querySelector('.trigger')?.addEventListener('click', () => {
      if (disabled) return;
      if (!this.hasAttribute('open')) this._calendarMode = 'days';
      this.toggleAttribute('open');
    });
    this.shadowRoot.querySelectorAll('[data-nav]').forEach(button => {
      button.addEventListener('click', () => {
        this._viewDate = addMonths(viewDate, Number(button.dataset.nav || 0));
        if (calendarMode === 'years') this._expandedYear = this._viewDate.getFullYear();
        this.render();
      });
    });
    this.shadowRoot.querySelectorAll('[data-calendar-mode]').forEach(button => {
      button.addEventListener('click', () => {
        this._calendarMode = button.dataset.calendarMode === 'years' ? 'years' : 'days';
        if (this._calendarMode === 'years') this._expandedYear = this._expandedYear ?? viewDate.getFullYear();
        this.render();
      });
    });
    this.shadowRoot.querySelectorAll('[data-month]').forEach(button => {
      button.addEventListener('click', () => {
        this._viewDate = new Date(Number(button.dataset.year || viewDate.getFullYear()), Number(button.dataset.month || 0), 1);
        this._expandedYear = this._viewDate.getFullYear();
        this._calendarMode = 'days';
        this.render();
      });
    });
    this.shadowRoot.querySelectorAll('[data-year-toggle]').forEach(button => {
      button.addEventListener('click', () => {
        const nextYear = Number(button.dataset.yearToggle || viewDate.getFullYear());
        this._expandedYear = this._expandedYear === nextYear ? null : nextYear;
        this._viewDate = new Date(nextYear, viewDate.getMonth(), 1);
        this._calendarMode = 'years';
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
    if (calendarMode === 'years') this.scrollYearIntoView(expandedYear ?? year);
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
