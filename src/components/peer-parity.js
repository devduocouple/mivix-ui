import { applyDocumentTheme, baseStyles, MvxElement, parseData, htmlEscape, readStoredTheme, safeUrl } from '../core.js';
import { MvxDataTable } from './data-table/data-table.js';
import { MvxDrawer } from './drawer/drawer.js';
import { MvxModal } from './modal/modal.js';
import { MvxSelect } from './select/select.js';
import { MvxSkeleton } from './skeleton/skeleton.js';
import { MvxToast } from './toast/toast.js';

const sharedStyles = `
  ${baseStyles}
  :host { display: block; }
  .surface {
    border: 1px solid var(--mvx-border);
    border-radius: var(--mvx-radius-md);
    background: var(--mvx-surface-glaze), var(--mvx-bg-panel);
    color: var(--mvx-fg);
    box-shadow: var(--mvx-shadow-soft);
    backdrop-filter: var(--mvx-surface-backdrop);
    -webkit-backdrop-filter: var(--mvx-surface-backdrop);
  }
  :host([component-style="clean"]) .surface {
    border-color: transparent;
    border-radius: 0;
    background: transparent;
    box-shadow: none;
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }
  .muted { color: var(--mvx-muted); }
  .subtle { color: var(--mvx-subtle); }
  .row { display: flex; gap: 8px; align-items: center; }
  .stack { display: grid; gap: 10px; }
  button, input, select, textarea {
    font: inherit;
    letter-spacing: 0;
  }
  button {
    border: 1px solid var(--mvx-border);
    border-radius: var(--mvx-radius-sm);
    background: var(--mvx-control-glaze), var(--mvx-bg-inset);
    color: var(--mvx-fg);
    cursor: pointer;
    box-shadow: var(--mvx-control-shadow);
  }
  :host([component-style="clean"]) button {
    border-color: transparent;
    border-radius: var(--mvx-radius-xs);
    background: transparent;
    box-shadow: none;
    color: var(--mvx-muted);
  }
  button:hover:not(:disabled) {
    border-color: var(--mvx-border-strong);
    background: color-mix(in srgb, var(--mvx-accent) 10%, var(--mvx-bg-inset));
  }
  :host([component-style="clean"]) button:hover:not(:disabled) {
    border-color: transparent;
    background: color-mix(in srgb, var(--mvx-accent) 8%, transparent);
    color: var(--mvx-fg);
  }
  button:focus-visible,
  input:focus-visible,
  select:focus-visible,
  textarea:focus-visible,
  a:focus-visible {
    outline: none;
    box-shadow: var(--mvx-focus);
  }
  button:disabled,
  input:disabled,
  select:disabled,
  textarea:disabled {
    cursor: not-allowed;
    opacity: 0.58;
  }
`;

const formStyles = `
  label.field {
    display: grid;
    gap: 7px;
    color: var(--mvx-muted);
    font-size: 13px;
    font-weight: 650;
  }
  input,
  select,
  textarea {
    inline-size: 100%;
    min-block-size: 40px;
    border: 1px solid var(--mvx-border);
    border-radius: var(--mvx-radius-sm);
    background: var(--mvx-bg-inset);
    color: var(--mvx-fg);
    outline: none;
    padding: 9px 11px;
  }
  .helper {
    color: var(--mvx-subtle);
    font-size: 12px;
    font-weight: 500;
  }
`;

function cssLength(value, fallback) {
  const raw = String(value ?? '').trim();
  if (!raw) return fallback;
  return /^-?\d+(\.\d+)?$/.test(raw) ? `${raw}px` : raw;
}

function toneColor(tone) {
  if (tone === 'success') return 'var(--mvx-success)';
  if (tone === 'warning') return 'var(--mvx-warning)';
  if (tone === 'danger') return 'var(--mvx-danger)';
  if (tone === 'info') return 'var(--mvx-info)';
  return 'var(--mvx-accent)';
}

function normalizeItems(items, fallback = []) {
  return parseData(items, fallback).map(item => typeof item === 'string' ? { label: item, value: item } : item);
}

function optionLabel(item, fallback = '') {
  return item?.label ?? item?.title ?? item?.name ?? item?.value ?? fallback;
}

function escapeAttr(value) {
  return htmlEscape(value).replaceAll('\n', ' ');
}

function escapeUrl(value, fallback = '#', options = {}) {
  return escapeAttr(safeUrl(value, fallback, options));
}

function cssUrl(value) {
  const safe = safeUrl(value, '', { allowDataImages: true });
  return safe ? `url("${escapeAttr(safe)}")` : '';
}

const richTextAllowedTags = new Set(['a', 'b', 'blockquote', 'br', 'code', 'div', 'em', 'h1', 'h2', 'h3', 'h4', 'hr', 'i', 'img', 'li', 'ol', 'p', 'pre', 's', 'span', 'strong', 'u', 'ul']);
const richTextAllowedAttrs = new Set(['alt', 'aria-label', 'href', 'src', 'target', 'title']);

function sanitizeRichHtml(value) {
  const html = String(value ?? '');
  const template = document.createElement('template');
  template.innerHTML = html;
  template.content.querySelectorAll('*').forEach(element => {
    const tag = element.localName;
    if (!richTextAllowedTags.has(tag)) {
      element.replaceWith(document.createTextNode(element.textContent || ''));
      return;
    }
    [...element.attributes].forEach(attribute => {
      const name = attribute.name.toLowerCase();
      if (!richTextAllowedAttrs.has(name) || name.startsWith('on')) {
        element.removeAttribute(attribute.name);
        return;
      }
      if (name === 'href') element.setAttribute('href', safeUrl(attribute.value));
      if (name === 'src') element.setAttribute('src', safeUrl(attribute.value, '', { allowDataImages: true }));
      if (name === 'target') {
        const target = attribute.value === '_blank' ? '_blank' : '';
        if (target) {
          element.setAttribute('target', target);
          element.setAttribute('rel', 'noopener noreferrer');
        } else {
          element.removeAttribute(attribute.name);
        }
      }
    });
  });
  return template.innerHTML;
}

class MvxPeerElement extends MvxElement {
  static observedAttributes = [
    'items', 'value', 'label', 'title', 'description', 'helper', 'open', 'active', 'disabled', 'multiple',
    'tone', 'variant', 'size', 'orientation', 'href', 'src', 'alt', 'ratio', 'columns', 'gap', 'max', 'min',
    'step', 'placeholder', 'to', 'duration', 'shape', 'for', 'as', 'level', 'selected', 'checked', 'compact',
    'align', 'justify', 'max-width', 'min-column-width', 'padding', 'responsive', 'fluid', 'wide', 'width'
  ];

  set items(value) {
    this._items = value;
    if (this.isConnected) this.render();
  }

  get items() {
    return normalizeItems(this._items ?? this.getAttribute('items'));
  }

  set value(value) {
    this._value = Array.isArray(value) ? value.join(',') : String(value ?? '');
    this.setAttribute('value', this._value);
  }

  get value() {
    return this._value ?? this.getAttribute('value') ?? '';
  }

  get active() {
    return Number(this.getAttribute('active') ?? 0);
  }

  set active(value) {
    this.setAttribute('active', String(Math.max(0, Number(value) || 0)));
  }

  titleText(fallback = '') {
    return this.getAttribute('title') || this.getAttribute('label') || fallback;
  }

  helperText() {
    return this.getAttribute('helper') || this.getAttribute('description') || '';
  }
}

export class MvxAutocomplete extends MvxPeerElement {
  static observedAttributes = [...MvxPeerElement.observedAttributes, 'options', 'clearable'];

  set options(value) {
    this._options = value;
    if (this.isConnected) this.render();
  }

  get options() {
    return normalizeItems(this._options ?? this.getAttribute('options'));
  }

  filteredOptions(query = '') {
    const normalized = query.trim().toLowerCase();
    return this.options.filter(item => !normalized || optionLabel(item).toLowerCase().includes(normalized));
  }

  select(item) {
    if (item.disabled) return;
    this._value = String(item.value ?? optionLabel(item));
    this.setAttribute('value', this._value);
    this.emit('mvx-select', { item, value: this._value });
    this.emit('mvx-change', { item, value: this._value });
    this.render();
  }

  renderList(query = '') {
    const list = this.shadowRoot.querySelector('.list');
    if (!list) return;
    const options = this.filteredOptions(query);
    list.hidden = !options.length;
    list.innerHTML = options.map((item, index) => `
      <button type="button" class="option" data-index="${index}" ${item.disabled ? 'disabled' : ''}>
        <span>${htmlEscape(optionLabel(item))}</span>
        ${item.description ? `<small>${htmlEscape(item.description)}</small>` : ''}
      </button>
    `).join('');
    list.querySelectorAll('.option').forEach((button, index) => {
      button.addEventListener('click', () => this.select(options[index]));
    });
  }

  render() {
    const label = this.titleText('Autocomplete');
    const helper = this.helperText();
    const placeholder = this.getAttribute('placeholder') || 'Search options';
    this.shadowRoot.innerHTML = `
      <style>
        ${sharedStyles}
        ${formStyles}
        :host { position: relative; }
        .wrap { position: relative; }
        .list {
          position: absolute;
          z-index: 12;
          inset-block-start: calc(100% + 6px);
          inset-inline: 0;
          display: grid;
          gap: 4px;
          max-block-size: 240px;
          overflow: auto;
          padding: 6px;
        }
        .option {
          display: grid;
          gap: 2px;
          inline-size: 100%;
          min-block-size: 34px;
          padding: 7px 9px;
          text-align: start;
        }
        small { color: var(--mvx-subtle); font-size: 11px; }
      </style>
      <label class="field">
        <span>${htmlEscape(label)}</span>
        <span class="wrap">
          <input part="input" role="combobox" aria-expanded="false" placeholder="${htmlEscape(placeholder)}" value="${htmlEscape(this.value)}" ${this.hasAttribute('disabled') ? 'disabled' : ''} />
          <span class="list surface" part="listbox" role="listbox" hidden></span>
        </span>
        ${helper ? `<span class="helper">${htmlEscape(helper)}</span>` : ''}
      </label>
    `;
    const input = this.shadowRoot.querySelector('input');
    input.addEventListener('input', () => {
      this._value = input.value;
      input.setAttribute('aria-expanded', 'true');
      this.renderList(input.value);
    });
    input.addEventListener('focus', () => {
      input.setAttribute('aria-expanded', 'true');
      this.renderList(input.value);
    });
    this.shadowRoot.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        this.shadowRoot.querySelector('.list').hidden = true;
        input.setAttribute('aria-expanded', 'false');
      }
    });
  }
}

export class MvxCombobox extends MvxAutocomplete {}

export class MvxButtonGroup extends MvxPeerElement {
  render() {
    const vertical = this.getAttribute('orientation') === 'vertical';
    this.shadowRoot.innerHTML = `
      <style>
        ${sharedStyles}
        :host { display: inline-flex; }
        .group {
          display: inline-flex;
          flex-direction: ${vertical ? 'column' : 'row'};
          align-items: stretch;
          border-radius: var(--mvx-radius-sm);
          box-shadow: var(--mvx-control-shadow);
          isolation: isolate;
        }
        ::slotted(*) {
          margin: 0 !important;
        }
        ::slotted(mvx-button) {
          --mvx-button-radius: 0;
          --mvx-button-shadow: none;
          position: relative;
        }
        ::slotted(mvx-button:first-child) {
          --mvx-button-radius: ${vertical ? 'var(--mvx-radius-sm) var(--mvx-radius-sm) 0 0' : 'var(--mvx-radius-sm) 0 0 var(--mvx-radius-sm)'};
        }
        ::slotted(mvx-button:last-child) {
          --mvx-button-radius: ${vertical ? '0 0 var(--mvx-radius-sm) var(--mvx-radius-sm)' : '0 var(--mvx-radius-sm) var(--mvx-radius-sm) 0'};
        }
        ::slotted(mvx-button:only-child) {
          --mvx-button-radius: var(--mvx-radius-sm);
        }
        ::slotted(:not(:first-child)) {
          margin-inline-start: ${vertical ? '0' : '-1px'} !important;
          margin-block-start: ${vertical ? '-1px' : '0'} !important;
        }
        ::slotted(:hover),
        ::slotted(:focus-within) {
          z-index: 1;
        }
      </style>
      <div class="group" part="group" role="group" aria-label="${htmlEscape(this.titleText('Button group'))}">
        <slot></slot>
      </div>
    `;
  }
}

export class MvxToggle extends MvxPeerElement {
  toggle() {
    if (this.hasAttribute('disabled')) return;
    const pressed = !this.hasAttribute('pressed');
    this.toggleAttribute('pressed', pressed);
    this.emit('mvx-change', { pressed });
  }

  render() {
    const pressed = this.hasAttribute('pressed') || this.hasAttribute('selected') || this.hasAttribute('checked');
    this.shadowRoot.innerHTML = `
      <style>
        ${sharedStyles}
        :host { display: inline-flex; }
        button {
          min-block-size: 36px;
          padding: 0 12px;
          background: ${pressed
            ? 'linear-gradient(180deg, color-mix(in srgb, var(--mvx-accent-2) 18%, transparent), transparent), color-mix(in srgb, var(--mvx-accent) 20%, var(--mvx-bg-inset))'
            : 'var(--mvx-control-glaze), var(--mvx-bg-inset)'};
          border-color: ${pressed ? 'var(--mvx-accent)' : 'var(--mvx-border)'};
          box-shadow: ${pressed
            ? 'var(--mvx-control-shadow), 0 8px 18px color-mix(in srgb, var(--mvx-accent) 18%, transparent)'
            : 'var(--mvx-control-shadow)'};
          transition: background var(--mvx-duration), border-color var(--mvx-duration), box-shadow var(--mvx-duration), transform var(--mvx-duration-fast);
        }
        button:hover:not(:disabled) {
          transform: translateY(var(--mvx-hover-lift));
        }
      </style>
      <button part="toggle" type="button" aria-pressed="${pressed}" ${this.hasAttribute('disabled') ? 'disabled' : ''}>
        <slot>${htmlEscape(this.titleText('Toggle'))}</slot>
      </button>
    `;
    this.shadowRoot.querySelector('button').addEventListener('click', () => this.toggle());
  }
}

export class MvxToggleGroup extends MvxPeerElement {
  select(item) {
    const value = String(item.value ?? optionLabel(item));
    const current = this.hasAttribute('multiple') ? this.value.split(',').filter(Boolean) : [];
    const values = this.hasAttribute('multiple')
      ? current.includes(value) ? current.filter(itemValue => itemValue !== value) : [...current, value]
      : [value];
    this.value = values.join(',');
    this.emit('mvx-change', { value: this.hasAttribute('multiple') ? values : value, item });
    this.render();
  }

  render() {
    const values = new Set(String(this.value).split(',').filter(Boolean));
    this.shadowRoot.innerHTML = `
      <style>
        ${sharedStyles}
        :host { display: inline-flex; }
        .group { display: inline-flex; flex-wrap: wrap; gap: 6px; }
        button {
          min-block-size: 34px;
          padding: 0 10px;
          background: var(--mvx-control-glaze), var(--mvx-bg-inset);
          transition: background var(--mvx-duration), border-color var(--mvx-duration), box-shadow var(--mvx-duration), transform var(--mvx-duration-fast);
        }
        button:hover:not(:disabled) {
          transform: translateY(var(--mvx-hover-lift));
        }
        button[aria-pressed="true"] {
          border-color: var(--mvx-accent);
          background:
            linear-gradient(180deg, color-mix(in srgb, var(--mvx-accent-2) 18%, transparent), transparent),
            color-mix(in srgb, var(--mvx-accent) 18%, var(--mvx-bg-inset));
          box-shadow: var(--mvx-control-shadow), 0 8px 18px color-mix(in srgb, var(--mvx-accent) 18%, transparent);
        }
      </style>
      <div class="group" role="group" aria-label="${htmlEscape(this.titleText('Toggle group'))}">
        ${this.items.map((item, index) => {
          const value = String(item.value ?? optionLabel(item, index));
          return `<button type="button" data-index="${index}" aria-pressed="${values.has(value)}">${htmlEscape(optionLabel(item, value))}</button>`;
        }).join('')}
      </div>
    `;
    this.shadowRoot.querySelectorAll('button').forEach(button => {
      button.addEventListener('click', () => this.select(this.items[Number(button.dataset.index)]));
    });
  }
}

export class MvxRating extends MvxPeerElement {
  rate(value) {
    if (this.hasAttribute('readonly') || this.hasAttribute('disabled')) return;
    this.value = String(value);
    this.emit('mvx-change', { value });
    this.render();
  }

  render() {
    const max = Math.max(1, Number(this.getAttribute('max') || 5));
    const value = Number(this.value || 0);
    this.shadowRoot.innerHTML = `
      <style>
        ${sharedStyles}
        :host { display: inline-grid; gap: 5px; }
        .stars { display: inline-flex; gap: 2px; }
        button {
          inline-size: 32px;
          block-size: 32px;
          border: 0;
          background: transparent;
          color: var(--mvx-subtle);
          font-size: 22px;
          padding: 0;
        }
        button[data-active="true"] { color: var(--mvx-warning); }
      </style>
      <div class="stars" role="radiogroup" aria-label="${htmlEscape(this.titleText('Rating'))}">
        ${Array.from({ length: max }, (_item, index) => `
          <button type="button" role="radio" data-value="${index + 1}" data-active="${index < value}" aria-checked="${index + 1 === value}">&#9733;</button>
        `).join('')}
      </div>
    `;
    this.shadowRoot.querySelectorAll('button').forEach(button => {
      button.addEventListener('click', () => this.rate(Number(button.dataset.value)));
    });
  }
}

export class MvxFileInput extends MvxPeerElement {
  render() {
    const label = this.titleText('Upload file');
    this.shadowRoot.innerHTML = `
      <style>
        ${sharedStyles}
        ${formStyles}
        input::file-selector-button {
          margin-inline-end: 10px;
          border: 1px solid var(--mvx-border);
          border-radius: var(--mvx-radius-sm);
          background: var(--mvx-bg-panel);
          color: var(--mvx-fg);
          padding: 7px 10px;
        }
        .files { color: var(--mvx-subtle); font-size: 12px; }
      </style>
      <label class="field">
        <span>${htmlEscape(label)}</span>
        <input part="input" type="file" ${this.hasAttribute('multiple') ? 'multiple' : ''} ${this.getAttribute('accept') ? `accept="${escapeAttr(this.getAttribute('accept'))}"` : ''} />
        <span class="files">${htmlEscape(this.helperText())}</span>
      </label>
    `;
    const input = this.shadowRoot.querySelector('input');
    const files = this.shadowRoot.querySelector('.files');
    input.addEventListener('change', () => {
      const selected = [...input.files].map(file => file.name);
      files.textContent = selected.join(', ') || this.helperText();
      this.emit('mvx-change', { files: [...input.files], names: selected });
    });
  }
}

export class MvxInputGroup extends MvxPeerElement {
  render() {
    this.shadowRoot.innerHTML = `
      <style>
        ${sharedStyles}
        :host { display: block; }
        .group {
          display: grid;
          grid-template-columns: auto minmax(0, 1fr) auto;
          align-items: stretch;
          overflow: hidden;
        }
        .slot {
          display: inline-flex;
          align-items: center;
          border-inline-end: 1px solid var(--mvx-border);
          color: var(--mvx-subtle);
          padding: 0 10px;
        }
        .suffix { border-inline: 1px 0 solid var(--mvx-border); }
        ::slotted(input), ::slotted(mvx-input), ::slotted(select) { inline-size: 100%; }
      </style>
      <div class="group surface" part="group">
        <span class="slot"><slot name="prefix"></slot></span>
        <slot></slot>
        <span class="slot suffix"><slot name="suffix"></slot></span>
      </div>
    `;
  }
}

export class MvxOtpInput extends MvxPeerElement {
  render() {
    const length = Math.max(1, Number(this.getAttribute('length') || 6));
    const value = String(this.value).slice(0, length);
    this.shadowRoot.innerHTML = `
      <style>
        ${sharedStyles}
        .cells { display: flex; flex-wrap: wrap; gap: 6px; }
        input {
          inline-size: 38px;
          block-size: 42px;
          border: 1px solid var(--mvx-border);
          border-radius: var(--mvx-radius-sm);
          background: var(--mvx-bg-inset);
          color: var(--mvx-fg);
          text-align: center;
        }
      </style>
      <div class="cells" part="inputs" aria-label="${htmlEscape(this.titleText('One-time code'))}">
        ${Array.from({ length }, (_item, index) => `<input inputmode="numeric" maxlength="1" data-index="${index}" value="${htmlEscape(value[index] || '')}" />`).join('')}
      </div>
    `;
    const inputs = [...this.shadowRoot.querySelectorAll('input')];
    const update = () => {
      this._value = inputs.map(input => input.value).join('');
      this.setAttribute('value', this._value);
      this.emit('mvx-change', { value: this._value });
      if (this._value.length === length) this.emit('mvx-complete', { value: this._value });
    };
    inputs.forEach((input, index) => {
      input.addEventListener('input', () => {
        input.value = input.value.slice(-1);
        if (input.value && inputs[index + 1]) inputs[index + 1].focus();
        update();
      });
      input.addEventListener('keydown', event => {
        if (event.key === 'Backspace' && !input.value && inputs[index - 1]) inputs[index - 1].focus();
      });
    });
  }
}

export class MvxNumberField extends MvxPeerElement {
  stepValue(direction) {
    const step = Number(this.getAttribute('step') || 1);
    const min = Number(this.getAttribute('min') ?? Number.NEGATIVE_INFINITY);
    const max = Number(this.getAttribute('max') ?? Number.POSITIVE_INFINITY);
    const next = Math.max(min, Math.min(max, Number(this.value || 0) + direction * step));
    this.value = String(next);
    this.emit('mvx-change', { value: next });
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        ${sharedStyles}
        ${formStyles}
        .control { display: grid; grid-template-columns: 38px minmax(0, 1fr) 38px; gap: 6px; }
      </style>
      <label class="field">
        <span>${htmlEscape(this.titleText('Number'))}</span>
        <span class="control">
          <button type="button" data-step="-1" aria-label="Decrease">-</button>
          <input type="number" value="${htmlEscape(this.value || this.getAttribute('min') || '0')}" ${this.getAttribute('min') ? `min="${escapeAttr(this.getAttribute('min'))}"` : ''} ${this.getAttribute('max') ? `max="${escapeAttr(this.getAttribute('max'))}"` : ''} ${this.getAttribute('step') ? `step="${escapeAttr(this.getAttribute('step'))}"` : ''} />
          <button type="button" data-step="1" aria-label="Increase">+</button>
        </span>
      </label>
    `;
    this.shadowRoot.querySelectorAll('button').forEach(button => button.addEventListener('click', () => this.stepValue(Number(button.dataset.step))));
    this.shadowRoot.querySelector('input').addEventListener('change', event => {
      this.value = event.target.value;
      this.emit('mvx-change', { value: Number(this.value) });
    });
  }
}

export class MvxCalendar extends MvxPeerElement {
  move(delta) {
    const current = this.currentDate();
    current.setMonth(current.getMonth() + delta);
    this.setAttribute('month', current.toISOString().slice(0, 7));
  }

  currentDate() {
    const raw = this.getAttribute('month') || this.value || new Date().toISOString().slice(0, 7);
    const [year, month] = raw.split('-').map(Number);
    return new Date(year || new Date().getFullYear(), Math.max(0, (month || 1) - 1), 1);
  }

  select(date) {
    this.value = date;
    this.emit('mvx-change', { value: date });
    this.render();
  }

  render() {
    const date = this.currentDate();
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const days = new Date(year, month + 1, 0).getDate();
    const monthName = new Intl.DateTimeFormat(this.locale, { month: 'long', year: 'numeric' }).format(date);
    const cells = [
      ...Array.from({ length: firstDay }, () => ''),
      ...Array.from({ length: days }, (_item, index) => String(index + 1))
    ];
    this.shadowRoot.innerHTML = `
      <style>
        ${sharedStyles}
        .calendar { display: grid; gap: 10px; padding: 12px; }
        .head { display: flex; justify-content: space-between; align-items: center; }
        .grid { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 4px; }
        .day, .dow {
          display: grid;
          place-items: center;
          min-block-size: 32px;
          border-radius: var(--mvx-radius-sm);
          font-size: 12px;
        }
        .dow { color: var(--mvx-subtle); font-weight: 800; }
        .day[aria-pressed="true"] { background: var(--mvx-accent); color: white; }
      </style>
      <section class="calendar surface" part="calendar" aria-label="${htmlEscape(this.titleText('Calendar'))}">
        <div class="head">
          <button type="button" data-move="-1" aria-label="Previous month">&lt;</button>
          <strong>${htmlEscape(monthName)}</strong>
          <button type="button" data-move="1" aria-label="Next month">&gt;</button>
        </div>
        <div class="grid">
          ${['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => `<span class="dow">${day}</span>`).join('')}
          ${cells.map(day => {
            if (!day) return '<span></span>';
            const value = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            return `<button type="button" class="day" data-date="${value}" aria-pressed="${value === this.value}">${day}</button>`;
          }).join('')}
        </div>
      </section>
    `;
    this.shadowRoot.querySelectorAll('[data-move]').forEach(button => button.addEventListener('click', () => this.move(Number(button.dataset.move))));
    this.shadowRoot.querySelectorAll('[data-date]').forEach(button => button.addEventListener('click', () => this.select(button.dataset.date)));
  }
}

export class MvxCarousel extends MvxPeerElement {
  move(delta) {
    const total = Math.max(1, this.items.length);
    this.active = (this.active + delta + total) % total;
    this.emit('mvx-change', { active: this.active, item: this.items[this.active] });
  }

  render() {
    const items = this.items.length ? this.items : [
      { title: this.titleText('Carousel slide'), description: this.helperText() || 'Use items to provide slides.' }
    ];
    const active = Math.min(this.active, items.length - 1);
    const item = items[active] || {};
    this.shadowRoot.innerHTML = `
      <style>
        ${sharedStyles}
        .carousel { display: grid; gap: 10px; overflow: hidden; padding: 12px; }
        .slide {
          display: grid;
          place-items: center;
          min-block-size: 180px;
          border-radius: var(--mvx-radius-sm);
          background: ${item.image ? `${cssUrl(item.image)} center/cover` : 'var(--mvx-bg-inset)'};
          text-align: center;
          padding: 20px;
        }
        .controls { display: flex; justify-content: space-between; align-items: center; }
      </style>
      <section class="carousel surface" part="carousel">
        <div class="slide">
          <span>
            <strong>${htmlEscape(optionLabel(item, `Slide ${active + 1}`))}</strong>
            ${item.description ? `<p class="muted">${htmlEscape(item.description)}</p>` : ''}
          </span>
        </div>
        <div class="controls">
          <button type="button" data-move="-1">Previous</button>
          <span class="subtle">${active + 1} / ${items.length}</span>
          <button type="button" data-move="1">Next</button>
        </div>
      </section>
    `;
    this.shadowRoot.querySelectorAll('[data-move]').forEach(button => button.addEventListener('click', () => this.move(Number(button.dataset.move))));
  }
}

export class MvxChip extends MvxPeerElement {
  render() {
    const tone = toneColor(this.getAttribute('tone'));
    this.shadowRoot.innerHTML = `
      <style>
        ${sharedStyles}
        :host { display: inline-flex; }
        .chip {
          display: inline-flex;
          gap: 7px;
          align-items: center;
          min-block-size: 28px;
          border: 1px solid color-mix(in srgb, ${tone} 42%, var(--mvx-border));
          border-radius: 999px;
          background: color-mix(in srgb, ${tone} 11%, var(--mvx-bg-panel));
          color: var(--mvx-fg);
          font-size: 12px;
          font-weight: 750;
          padding: 0 9px;
        }
        button { border: 0; background: transparent; padding: 0; }
      </style>
      <span class="chip" part="chip">
        <slot>${htmlEscape(this.titleText('Chip'))}</slot>
        ${this.hasAttribute('removable') ? '<button type="button" aria-label="Remove">x</button>' : ''}
      </span>
    `;
    this.shadowRoot.querySelector('button')?.addEventListener('click', () => this.emit('mvx-remove', { value: this.value || this.textContent.trim() }));
  }
}

export class MvxEmptyState extends MvxPeerElement {
  render() {
    this.shadowRoot.innerHTML = `
      <style>
        ${sharedStyles}
        .empty { display: grid; gap: 10px; place-items: center; padding: 24px; text-align: center; }
        .icon { display: grid; place-items: center; inline-size: 44px; block-size: 44px; border-radius: 999px; background: var(--mvx-bg-inset); color: var(--mvx-accent-2); font-weight: 900; }
      </style>
      <section class="empty surface" part="empty">
        <span class="icon"><slot name="icon">${htmlEscape(this.getAttribute('icon') || '0')}</slot></span>
        <strong>${htmlEscape(this.titleText('No results'))}</strong>
        <span class="muted">${htmlEscape(this.helperText() || 'Try adjusting filters or creating a new item.')}</span>
        <slot name="action"></slot>
      </section>
    `;
  }
}

export class MvxTreeView extends MvxPeerElement {
  select(item) {
    this.value = String(item.value ?? optionLabel(item));
    this.emit('mvx-select', { item, value: this.value });
    this.render();
  }

  renderNode(item, indexPath = '') {
    const children = Array.isArray(item.children) ? item.children : [];
    const value = String(item.value ?? optionLabel(item) ?? indexPath);
    if (children.length) {
      return `
        <details ${item.open ? 'open' : ''}>
          <summary>${htmlEscape(optionLabel(item))}</summary>
          <div class="children">
            ${children.map((child, index) => this.renderNode(child, `${indexPath}-${index}`)).join('')}
          </div>
        </details>
      `;
    }
    return `<button type="button" data-value="${escapeAttr(value)}" aria-current="${value === this.value ? 'true' : 'false'}">${htmlEscape(optionLabel(item))}</button>`;
  }

  render() {
    const items = this.items;
    this.shadowRoot.innerHTML = `
      <style>
        ${sharedStyles}
        .tree { display: grid; gap: 4px; padding: 8px; }
        summary, button {
          min-block-size: 30px;
          border: 0;
          border-radius: var(--mvx-radius-sm);
          background: transparent;
          color: var(--mvx-muted);
          padding: 5px 8px;
          text-align: start;
        }
        button[aria-current="true"] { background: color-mix(in srgb, var(--mvx-accent) 14%, var(--mvx-bg-inset)); color: var(--mvx-fg); }
        .children { display: grid; gap: 2px; margin-inline-start: 14px; border-inline-start: 1px solid var(--mvx-border); padding-inline-start: 8px; }
      </style>
      <nav class="tree surface" part="tree" aria-label="${htmlEscape(this.titleText('Tree view'))}">
        ${items.map((item, index) => this.renderNode(item, String(index))).join('')}
      </nav>
    `;
    this.shadowRoot.querySelectorAll('button[data-value]').forEach(button => {
      button.addEventListener('click', () => {
        const item = this.items.flatMap(item => item.children || [item]).find(item => String(item.value ?? optionLabel(item)) === button.dataset.value) || { label: button.textContent, value: button.dataset.value };
        this.select(item);
      });
    });
  }
}

export class MvxMenu extends MvxPeerElement {
  select(item) {
    if (item.disabled) return;
    this.emit('mvx-select', { item, value: item.value ?? optionLabel(item) });
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        ${sharedStyles}
        .menu { display: grid; gap: 3px; padding: 6px; }
        button, a {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 10px;
          min-block-size: 34px;
          border: 0;
          border-radius: var(--mvx-radius-sm);
          background: transparent;
          color: var(--mvx-muted);
          padding: 0 9px;
          text-align: start;
          text-decoration: none;
        }
        button:hover, a:hover { background: color-mix(in srgb, var(--mvx-accent) 12%, var(--mvx-bg-inset)); color: var(--mvx-fg); }
        small { color: var(--mvx-subtle); }
      </style>
      <nav class="menu surface" part="menu" aria-label="${htmlEscape(this.titleText('Menu'))}">
        ${this.items.map((item, index) => item.separator ? '<hr />' : item.href
          ? `<a href="${escapeAttr(item.href)}" data-index="${index}"><span>${htmlEscape(optionLabel(item))}</span>${item.shortcut ? `<small>${htmlEscape(item.shortcut)}</small>` : ''}</a>`
          : `<button type="button" data-index="${index}" ${item.disabled ? 'disabled' : ''}><span>${htmlEscape(optionLabel(item))}</span>${item.shortcut ? `<small>${htmlEscape(item.shortcut)}</small>` : ''}</button>`
        ).join('')}
      </nav>
    `;
    this.shadowRoot.querySelectorAll('[data-index]').forEach(item => item.addEventListener('click', () => this.select(this.items[Number(item.dataset.index)])));
  }
}

export class MvxContextMenu extends MvxMenu {
  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('contextmenu', this._contextHandler = event => {
      event.preventDefault();
      this.toggleAttribute('open', true);
      this.style.setProperty('--menu-x', `${event.offsetX}px`);
      this.style.setProperty('--menu-y', `${event.offsetY}px`);
    });
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._contextHandler) this.removeEventListener('contextmenu', this._contextHandler);
  }

  render() {
    super.render();
    const style = document.createElement('style');
    style.textContent = `
      :host { position: relative; min-block-size: 72px; border: 1px dashed var(--mvx-border); border-radius: var(--mvx-radius-md); padding: 12px; }
      .menu { position: absolute; z-index: 20; inset-inline-start: var(--menu-x, 8px); inset-block-start: var(--menu-y, 8px); display: none; min-inline-size: 200px; }
      :host([open]) .menu { display: grid; }
    `;
    this.shadowRoot.append(style);
    const hint = document.createElement('slot');
    hint.textContent = this.titleText('Right click for menu');
    this.shadowRoot.prepend(hint);
  }
}

export class MvxMenubar extends MvxPeerElement {
  render() {
    this.shadowRoot.innerHTML = `
      <style>
        ${sharedStyles}
        .bar { display: flex; flex-wrap: wrap; gap: 4px; padding: 5px; }
        :host([component-style="clean"]) .bar {
          gap: 14px;
          padding: 0;
          border-block-end: 1px solid var(--mvx-border);
        }
        .item { position: relative; }
        .submenu {
          position: absolute;
          z-index: 10;
          inset-block-start: calc(100% + 5px);
          inset-inline-start: 0;
          display: none;
          min-inline-size: 180px;
          padding: 6px;
        }
        .item:focus-within .submenu, .item:hover .submenu { display: grid; gap: 3px; }
        button { min-block-size: 32px; padding: 0 10px; }
        :host([component-style="clean"]) button {
          min-block-size: 38px;
          border-radius: 0;
          padding-inline: 0;
        }
        :host([component-style="clean"]) .submenu {
          border: 1px solid var(--mvx-border);
          border-radius: var(--mvx-radius-sm);
          background: var(--mvx-bg-panel);
          box-shadow: var(--mvx-shadow-soft);
          padding: 8px;
        }
        :host([component-style="clean"]) .submenu button {
          min-block-size: 32px;
          border-radius: var(--mvx-radius-xs);
          padding-inline: 10px;
          text-align: start;
        }
      </style>
      <nav class="bar surface" part="menubar" role="menubar">
        ${this.items.map((item, index) => `
          <div class="item">
            <button type="button" role="menuitem" data-index="${index}">${htmlEscape(optionLabel(item))}</button>
            ${Array.isArray(item.children) ? `<div class="submenu surface">${item.children.map(child => `<button type="button">${htmlEscape(optionLabel(child))}</button>`).join('')}</div>` : ''}
          </div>
        `).join('')}
      </nav>
    `;
  }
}

export class MvxNavigationMenu extends MvxMenubar {}
export class MvxMegaMenu extends MvxMenubar {}

export class MvxBottomNavigation extends MvxPeerElement {
  select(item) {
    this.value = String(item.value ?? optionLabel(item));
    this.emit('mvx-change', { value: this.value, item });
    this.render();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        ${sharedStyles}
        .dock { display: grid; grid-template-columns: repeat(${Math.max(this.items.length, 1)}, minmax(0, 1fr)); gap: 4px; padding: 6px; }
        button { display: grid; place-items: center; gap: 3px; min-block-size: 48px; border: 0; background: transparent; }
        button[aria-current="page"] { color: var(--mvx-accent-2); background: color-mix(in srgb, var(--mvx-accent) 10%, transparent); }
        :host([component-style="clean"]) .dock {
          gap: 0;
          border-block-start: 1px solid var(--mvx-border);
          padding: 0;
        }
        :host([component-style="clean"]) button {
          position: relative;
          min-block-size: 54px;
          border-radius: 0;
        }
        :host([component-style="clean"]) button::before {
          content: "";
          position: absolute;
          inset-inline: 22%;
          inset-block-start: 0;
          block-size: 2px;
          border-radius: 999px;
          background: transparent;
        }
        :host([component-style="clean"]) button[aria-current="page"] {
          background: transparent;
          color: var(--mvx-accent-2);
        }
        :host([component-style="clean"]) button[aria-current="page"]::before {
          background: var(--mvx-accent);
        }
        small { font-size: 11px; }
      </style>
      <nav class="dock surface" part="navigation">
        ${this.items.map((item, index) => {
          const value = String(item.value ?? optionLabel(item));
          return `<button type="button" data-index="${index}" aria-current="${value === this.value ? 'page' : 'false'}"><span>${htmlEscape(item.icon || '')}</span><small>${htmlEscape(optionLabel(item))}</small></button>`;
        }).join('')}
      </nav>
    `;
    this.shadowRoot.querySelectorAll('button').forEach(button => button.addEventListener('click', () => this.select(this.items[Number(button.dataset.index)])));
  }
}

export class MvxDock extends MvxBottomNavigation {}

export class MvxHoverCard extends MvxPeerElement {
  render() {
    this.shadowRoot.innerHTML = `
      <style>
        ${sharedStyles}
        :host { position: relative; display: inline-block; }
        .panel {
          position: absolute;
          z-index: 20;
          inset-block-start: calc(100% + 8px);
          inset-inline-start: 0;
          display: none;
          inline-size: min(300px, 80vw);
          padding: 12px;
        }
        :host(:hover) .panel, :host(:focus-within) .panel, :host([open]) .panel { display: grid; }
      </style>
      <span tabindex="0"><slot name="trigger">${htmlEscape(this.titleText('Hover card'))}</slot></span>
      <section class="panel surface" part="panel"><slot>${htmlEscape(this.helperText())}</slot></section>
    `;
  }
}

export class MvxFab extends MvxPeerElement {
  render() {
    this.shadowRoot.innerHTML = `
      <style>
        ${sharedStyles}
        :host { display: inline-flex; }
        button {
          display: inline-flex;
          gap: 8px;
          align-items: center;
          justify-content: center;
          min-inline-size: ${this.hasAttribute('extended') ? 'auto' : '52px'};
          block-size: 52px;
          border-radius: 999px;
          background: var(--mvx-accent);
          color: white;
          padding: 0 ${this.hasAttribute('extended') ? '18px' : '0'};
          box-shadow: var(--mvx-shadow-raised);
        }
      </style>
      <button type="button" part="button" aria-label="${htmlEscape(this.titleText('Action'))}">
        <slot name="icon">${htmlEscape(this.getAttribute('icon') || '+')}</slot>
        ${this.hasAttribute('extended') ? `<span><slot>${htmlEscape(this.titleText('Create'))}</slot></span>` : ''}
      </button>
    `;
    this.shadowRoot.querySelector('button').addEventListener('click', () => this.emit('mvx-click', { value: this.value }));
  }
}

export class MvxSpeedDial extends MvxPeerElement {
  static observedAttributes = [
    ...MvxPeerElement.observedAttributes,
    'placement', 'direction', 'persistent', 'persistent-labels', 'open-on-focus',
    'icon', 'open-icon', 'icon-size', 'main-icon-size', 'action-icon-size', 'action-icon-box-size'
  ];

  setOpen(open, focusMain = false) {
    const nextOpen = Boolean(open);
    if (this.hasAttribute('open') !== nextOpen) {
      this.toggleAttribute('open', nextOpen);
      this.emit('mvx-change', { open: nextOpen });
    }
    if (focusMain) requestAnimationFrame(() => this.shadowRoot?.querySelector('.main')?.focus());
  }

  focusAction(index) {
    const actions = [...this.shadowRoot.querySelectorAll('.action')];
    if (!actions.length) return;
    actions[(index + actions.length) % actions.length]?.focus();
  }

  alignLabels() {
    const dial = this.shadowRoot?.querySelector('.dial');
    if (!dial) return;
    dial.classList.remove('labels-before', 'labels-after', 'labels-start', 'labels-end');
    if (!this.hasAttribute('open')) return;

    const rect = dial.getBoundingClientRect();
    const viewportWidth = document.documentElement?.clientWidth || window.innerWidth || 0;
    const edgePadding = 16;
    const labelSpace = 220;
    const parentRect = this.parentElement?.getBoundingClientRect();
    const hasUsableParentBoundary = parentRect && parentRect.width >= rect.width + labelSpace + edgePadding * 2;
    const boundaryLeft = hasUsableParentBoundary ? Math.max(0, parentRect.left) : 0;
    const boundaryRight = hasUsableParentBoundary ? Math.min(viewportWidth, parentRect.right) : viewportWidth;
    const spaceBefore = rect.left - boundaryLeft - edgePadding;
    const spaceAfter = boundaryRight - rect.right - edgePadding;
    const isSide = dial.classList.contains('left') || dial.classList.contains('right');

    if (isSide) {
      if (spaceBefore < labelSpace / 2) dial.classList.add('labels-start');
      if (spaceAfter < labelSpace / 2) dial.classList.add('labels-end');
      return;
    }

    dial.classList.add(spaceBefore < labelSpace && spaceAfter > spaceBefore ? 'labels-after' : 'labels-before');
  }

  render() {
    const open = this.hasAttribute('open');
    const directionMap = { up: 'top', down: 'bottom', left: 'left', right: 'right' };
    const rawDirection = this.getAttribute('direction');
    const placement = directionMap[rawDirection] || this.getAttribute('placement') || 'top';
    const isSide = placement === 'left' || placement === 'right';
    const reverse = placement === 'bottom' || placement === 'right';
    const verticalOffset = reverse ? '-12px' : '12px';
    const sideOffset = placement === 'left' ? '12px' : '-12px';
    const actionIconSize = cssLength(this.getAttribute('action-icon-size') || this.getAttribute('icon-size'), '20px');
    const actionIconBoxSize = cssLength(this.getAttribute('action-icon-box-size'), '40px');
    const mainIconSize = cssLength(this.getAttribute('main-icon-size') || this.getAttribute('icon-size'), '28px');
    const openIcon = this.getAttribute('open-icon');
    const mainIcon = open && openIcon ? openIcon : this.getAttribute('icon') || '+';
    const orientation = isSide ? 'horizontal' : 'vertical';
    const actionsId = 'speed-dial-actions';
    this.shadowRoot.innerHTML = `
      <style>
        ${sharedStyles}
        :host { display: inline-flex; }
        .dial {
          --mvx-speed-stagger: 38ms;
          position: relative;
          display: flex;
          flex-direction: ${isSide ? 'row' : 'column'};
          gap: 12px;
          align-items: ${isSide ? 'center' : 'end'};
          max-inline-size: 100%;
          isolation: isolate;
        }
        .dial.bottom { flex-direction: column-reverse; }
        .dial.left { flex-direction: row-reverse; align-items: center; }
        .dial.right { flex-direction: row; align-items: center; }
        .actions {
          display: flex;
          flex-direction: ${isSide ? 'row' : 'column'};
          gap: 10px;
          align-items: ${isSide ? 'center' : 'end'};
          max-inline-size: 100%;
          min-inline-size: 0;
          pointer-events: ${open ? 'auto' : 'none'};
          z-index: 1;
        }
        .actions.bottom { flex-direction: column-reverse; }
        .actions.left,
        .actions.right {
          align-items: center;
          flex-wrap: wrap;
          max-inline-size: min(100%, calc(100vw - 96px));
        }
        .actions.left { justify-content: flex-start; }
        .actions.right { justify-content: flex-end; }
        .action {
          position: relative;
          display: grid;
          place-items: center;
          inline-size: calc(${actionIconBoxSize} + 8px);
          block-size: calc(${actionIconBoxSize} + 8px);
          overflow: visible;
          border: 1px solid color-mix(in srgb, var(--mvx-border) 84%, transparent);
          border-radius: 999px;
          background:
            radial-gradient(circle at 34% 22%, color-mix(in srgb, white 18%, transparent), transparent 34%),
            linear-gradient(180deg, color-mix(in srgb, var(--mvx-fg) 7%, transparent), transparent 58%),
            color-mix(in srgb, var(--mvx-bg-panel) 96%, var(--mvx-bg-inset));
          color: var(--mvx-fg);
          padding: 3px;
          box-shadow:
            0 10px 22px color-mix(in srgb, #000 18%, transparent),
            inset 0 1px 0 rgba(255, 255, 255, 0.10);
          transform: translateY(${open ? '0' : verticalOffset}) scale(${open ? '1' : '0.88'});
          transform-origin: center ${reverse ? 'top' : 'bottom'};
          opacity: ${open ? '1' : '0'};
          transition:
            opacity var(--mvx-duration),
            transform var(--mvx-duration),
            border-color var(--mvx-duration),
            background var(--mvx-duration),
            box-shadow var(--mvx-duration);
          transition-delay: calc(var(--index) * ${open ? 'var(--mvx-speed-stagger)' : '0ms'});
          white-space: nowrap;
        }
        .dial.left .action,
        .dial.right .action {
          display: inline-grid;
          grid-template-columns: ${actionIconBoxSize} minmax(0, 1fr);
          gap: 9px;
          inline-size: max-content;
          max-inline-size: min(240px, calc(100vw - 96px));
          block-size: auto;
          min-block-size: calc(${actionIconBoxSize} + 8px);
          justify-items: start;
          padding: 3px 12px 3px 3px;
          transform: translateX(${open ? '0' : sideOffset}) scale(${open ? '1' : '0.88'});
          transform-origin: center ${placement === 'left' ? 'right' : 'left'};
        }
        .dial.right .action {
          justify-items: end;
          text-align: end;
        }
        .action:hover,
        .action:focus-visible {
          border-color: color-mix(in srgb, var(--mvx-accent) 54%, var(--mvx-border));
          background:
            radial-gradient(circle at 24% 18%, color-mix(in srgb, var(--mvx-accent-2) 20%, transparent), transparent 38%),
            linear-gradient(180deg, color-mix(in srgb, var(--mvx-accent-2) 12%, transparent), transparent 56%),
            color-mix(in srgb, var(--mvx-accent) 13%, var(--mvx-bg-inset));
          box-shadow:
            var(--mvx-control-shadow),
            0 14px 30px color-mix(in srgb, var(--mvx-accent) 18%, transparent);
        }
        .action:focus-visible {
          outline: none;
          box-shadow: var(--mvx-focus), 0 14px 30px color-mix(in srgb, var(--mvx-accent) 18%, transparent);
        }
        .action-icon {
          display: grid;
          place-items: center;
          inline-size: 100%;
          block-size: 100%;
          border-radius: 999px;
          background:
            linear-gradient(180deg, color-mix(in srgb, var(--mvx-accent-2) 16%, transparent), transparent),
            color-mix(in srgb, var(--mvx-accent) 14%, var(--mvx-bg-inset));
          color: var(--mvx-accent);
          font-size: ${actionIconSize};
          font-weight: 850;
          line-height: 1;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.14);
        }
        .action-label {
          position: absolute;
          inset-block-start: 50%;
          inset-inline-end: calc(100% + 10px);
          inline-size: max-content;
          max-inline-size: 190px;
          border: 1px solid color-mix(in srgb, var(--mvx-border) 86%, transparent);
          border-radius: 999px;
          background:
            linear-gradient(180deg, color-mix(in srgb, var(--mvx-fg) 7%, transparent), transparent),
            color-mix(in srgb, var(--mvx-bg-panel) 96%, var(--mvx-bg-inset));
          box-shadow: 0 12px 24px color-mix(in srgb, #000 18%, transparent);
          color: var(--mvx-fg);
          opacity: ${this.hasAttribute('persistent-labels') ? '1' : '0'};
          overflow: hidden;
          padding: 8px 11px;
          pointer-events: none;
          text-overflow: ellipsis;
          font-size: 13.5px;
          font-weight: 780;
          line-height: 1.1;
          letter-spacing: 0;
          transform: translateY(-50%) scale(${this.hasAttribute('persistent-labels') ? '1' : '0.94'});
          transition: opacity var(--mvx-duration-fast), transform var(--mvx-duration-fast);
          white-space: nowrap;
          z-index: 2;
        }
        .dial.bottom .action-label {
          inset-inline-end: auto;
          inset-inline-start: calc(100% + 10px);
        }
        .dial.left .action-label {
          position: static;
          inline-size: auto;
          min-inline-size: 0;
          max-inline-size: 100%;
          border: 0;
          border-radius: 0;
          background: transparent;
          box-shadow: none;
          opacity: 1;
          padding: 0;
          pointer-events: auto;
          text-align: start;
          transform: none;
        }
        .dial.right .action-label {
          position: static;
          inline-size: auto;
          min-inline-size: 0;
          max-inline-size: 100%;
          border: 0;
          border-radius: 0;
          background: transparent;
          box-shadow: none;
          opacity: 1;
          padding: 0;
          pointer-events: auto;
          text-align: end;
          transform: none;
        }
        .action:hover .action-label,
        .action:focus-visible .action-label {
          opacity: 1;
          transform: translateY(-50%) scale(1);
        }
        .dial.left .action:hover .action-label,
        .dial.left .action:focus-visible .action-label {
          opacity: 1;
          transform: none;
        }
        .dial.right .action:hover .action-label,
        .dial.right .action:focus-visible .action-label {
          opacity: 1;
          transform: none;
        }
        .main {
          position: relative;
          display: grid;
          place-items: center;
          inline-size: 58px;
          block-size: 58px;
          border: 1px solid color-mix(in srgb, var(--mvx-accent) 72%, var(--mvx-border));
          border-radius: 999px;
          background:
            radial-gradient(circle at 32% 22%, color-mix(in srgb, white 36%, transparent), transparent 27%),
            linear-gradient(145deg, color-mix(in srgb, var(--mvx-accent-2) 26%, transparent), transparent 46%),
            var(--mvx-accent);
          color: white;
          box-shadow:
            0 18px 34px color-mix(in srgb, var(--mvx-accent) 32%, transparent),
            0 4px 9px color-mix(in srgb, #000 18%, transparent),
            inset 0 1px 0 rgba(255, 255, 255, 0.32);
          font-size: 24px;
          font-weight: 800;
          z-index: 2;
          transition:
            transform var(--mvx-duration),
            box-shadow var(--mvx-duration),
            background var(--mvx-duration),
            border-color var(--mvx-duration);
        }
        .main::after {
          content: "";
          position: absolute;
          inset: -8px;
          border-radius: inherit;
          background:
            radial-gradient(circle, color-mix(in srgb, var(--mvx-accent) 18%, transparent), transparent 68%);
          opacity: ${open ? '1' : '0'};
          transform: scale(${open ? '1' : '0.72'});
          transition: opacity var(--mvx-duration), transform var(--mvx-duration);
          z-index: -1;
        }
        .main:hover {
          transform: translateY(-2px) scale(1.03);
          box-shadow:
            0 22px 40px color-mix(in srgb, var(--mvx-accent) 38%, transparent),
            0 5px 12px color-mix(in srgb, #000 20%, transparent),
            inset 0 1px 0 rgba(255, 255, 255, 0.36);
        }
        .main:focus-visible {
          outline: none;
          box-shadow: var(--mvx-focus), 0 18px 34px color-mix(in srgb, var(--mvx-accent) 34%, transparent);
        }
        .main-icon {
          display: inline-block;
          font-size: ${mainIconSize};
          line-height: 1;
          transform: rotate(${open && !openIcon ? '45deg' : '0deg'}) scale(${open ? '1.04' : '1'});
          transition: transform var(--mvx-duration);
        }
        @media (prefers-reduced-motion: reduce) {
          .action,
          .main,
          .main::after,
          .main-icon {
            transition: none;
          }
        }
        .dial {
          gap: 16px;
          align-items: center;
          max-inline-size: none;
        }
        .actions {
          gap: 16px;
          align-items: center;
          max-inline-size: none;
          min-inline-size: auto;
        }
        .actions.left,
        .actions.right {
          flex-wrap: nowrap;
          max-inline-size: none;
          justify-content: center;
        }
        .action,
        .dial.left .action,
        .dial.right .action {
          display: grid;
          grid-template-columns: none;
          place-items: center;
          inline-size: ${actionIconBoxSize};
          max-inline-size: ${actionIconBoxSize};
          block-size: ${actionIconBoxSize};
          min-block-size: ${actionIconBoxSize};
          overflow: visible;
          border: 1px solid var(--mvx-border);
          border-radius: 999px;
          background: var(--mvx-control-glaze), var(--mvx-bg-inset);
          color: var(--mvx-fg);
          padding: 0;
          box-shadow:
            0 3px 5px color-mix(in srgb, #000 22%, transparent),
            0 1px 18px color-mix(in srgb, #000 12%, transparent);
          text-align: center;
        }
        .action {
          transform: translateY(${open ? '0' : verticalOffset}) scale(${open ? '1' : '0.2'});
          transition:
            opacity 195ms cubic-bezier(0.4, 0, 0.2, 1),
            transform 195ms cubic-bezier(0.4, 0, 0.2, 1),
            background 150ms cubic-bezier(0.4, 0, 0.2, 1),
            box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1);
        }
        .dial.left .action,
        .dial.right .action {
          transform: translateX(${open ? '0' : sideOffset}) scale(${open ? '1' : '0.2'});
        }
        .action:hover,
        .action:focus-visible {
          border-color: color-mix(in srgb, var(--mvx-accent) 72%, var(--mvx-border-strong));
          background:
            linear-gradient(180deg, color-mix(in srgb, white 8%, transparent), transparent),
            color-mix(in srgb, var(--mvx-accent) 18%, var(--mvx-bg-panel));
          color: var(--mvx-fg);
          box-shadow:
            var(--mvx-control-shadow),
            0 5px 8px color-mix(in srgb, #000 24%, transparent),
            0 3px 14px color-mix(in srgb, #000 16%, transparent);
        }
        .action:hover .action-icon,
        .action:focus-visible .action-icon {
          background: var(--mvx-accent);
          color: white;
        }
        .action-icon {
          inline-size: 100%;
          block-size: 100%;
          background: transparent;
          color: currentColor;
          font-weight: 700;
          box-shadow: none;
          transition: background 150ms cubic-bezier(0.4, 0, 0.2, 1), color 150ms cubic-bezier(0.4, 0, 0.2, 1);
        }
        .action-label,
        .dial.left .action-label,
        .dial.right .action-label {
          position: absolute;
          inset-block-start: 50%;
          inset-inline-start: auto;
          inset-inline-end: calc(100% + 10px);
          inline-size: max-content;
          max-inline-size: min(220px, calc(100vw - 32px));
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-radius: 4px;
          background: rgba(17, 19, 21, 0.96);
          box-shadow: 0 6px 18px color-mix(in srgb, #000 30%, transparent);
          color: white;
          opacity: ${this.hasAttribute('persistent-labels') ? '1' : '0'};
          overflow: hidden;
          padding: 4px 8px;
          pointer-events: none;
          text-align: start;
          text-overflow: ellipsis;
          font-size: 12px;
          font-weight: 500;
          line-height: 1.4;
          transform: translateY(-50%) scale(${this.hasAttribute('persistent-labels') ? '1' : '0.94'});
          transition:
            opacity 150ms cubic-bezier(0.4, 0, 0.2, 1),
            transform 150ms cubic-bezier(0.4, 0, 0.2, 1);
          white-space: nowrap;
        }
        .dial.bottom .action-label {
          inset-inline-start: calc(100% + 10px);
          inset-inline-end: auto;
        }
        .dial.labels-before .action-label {
          inset-inline-start: auto;
          inset-inline-end: calc(100% + 10px);
          text-align: end;
          transform: translateY(-50%) scale(${this.hasAttribute('persistent-labels') ? '1' : '0.94'});
        }
        .dial.labels-after .action-label {
          inset-inline-start: calc(100% + 10px);
          inset-inline-end: auto;
          text-align: start;
          transform: translateY(-50%) scale(${this.hasAttribute('persistent-labels') ? '1' : '0.94'});
        }
        .dial.left .action-label,
        .dial.right .action-label {
          inset-block-start: calc(100% + 10px);
          inset-inline-start: 50%;
          inset-inline-end: auto;
          transform: translateX(-50%) scale(${this.hasAttribute('persistent-labels') ? '1' : '0.94'});
        }
        .dial.left.labels-start .action-label,
        .dial.right.labels-start .action-label {
          inset-inline-start: 0;
          inset-inline-end: auto;
          transform: scale(${this.hasAttribute('persistent-labels') ? '1' : '0.94'});
        }
        .dial.left.labels-end .action-label,
        .dial.right.labels-end .action-label {
          inset-inline-start: auto;
          inset-inline-end: 0;
          transform: scale(${this.hasAttribute('persistent-labels') ? '1' : '0.94'});
        }
        .action:hover .action-label,
        .action:focus-visible .action-label {
          opacity: 1;
          transform: translateY(-50%) scale(1);
        }
        .dial.labels-after .action:hover .action-label,
        .dial.labels-after .action:focus-visible .action-label,
        .dial.labels-before .action:hover .action-label,
        .dial.labels-before .action:focus-visible .action-label {
          transform: translateY(-50%) scale(1);
        }
        .dial.left .action:hover .action-label,
        .dial.left .action:focus-visible .action-label,
        .dial.right .action:hover .action-label,
        .dial.right .action:focus-visible .action-label {
          transform: translateX(-50%) scale(1);
        }
        .dial.left.labels-start .action:hover .action-label,
        .dial.left.labels-start .action:focus-visible .action-label,
        .dial.right.labels-start .action:hover .action-label,
        .dial.right.labels-start .action:focus-visible .action-label,
        .dial.left.labels-end .action:hover .action-label,
        .dial.left.labels-end .action:focus-visible .action-label,
        .dial.right.labels-end .action:hover .action-label,
        .dial.right.labels-end .action:focus-visible .action-label {
          transform: scale(1);
        }
        .main {
          inline-size: 56px;
          block-size: 56px;
          border: 0;
          background: var(--mvx-accent);
          box-shadow:
            0 3px 5px color-mix(in srgb, #000 26%, transparent),
            0 6px 10px color-mix(in srgb, #000 18%, transparent);
          font-weight: 600;
          transform: none;
        }
        .main::after {
          display: none;
        }
        .main:hover {
          background:
            linear-gradient(180deg, color-mix(in srgb, white 10%, transparent), transparent),
            color-mix(in srgb, var(--mvx-accent) 92%, black);
          transform: none;
          box-shadow:
            0 5px 8px color-mix(in srgb, #000 28%, transparent),
            0 8px 12px color-mix(in srgb, #000 20%, transparent);
        }
        .main-icon {
          transform: rotate(${open && !openIcon ? '45deg' : '0deg'});
          transition: transform 150ms cubic-bezier(0.4, 0, 0.2, 1);
        }
      </style>
      <div class="dial ${placement}" part="dial">
        <div id="${actionsId}" class="actions ${placement}" part="actions" role="menu" aria-orientation="${orientation}" aria-hidden="${!open}">
          ${this.items.map((item, index) => {
            const label = optionLabel(item, `Action ${index + 1}`);
            const icon = item.icon || item.shortcut || label.trim().charAt(0).toUpperCase();
            const iconSize = item.iconSize || item['icon-size'] || '';
            const labelId = `${actionsId}-label-${index}`;
            return `
              <button type="button" class="action" part="action" role="menuitem" data-index="${index}" style="--index:${index}" tabindex="${open ? '0' : '-1'}" aria-label="${escapeAttr(label)}" aria-describedby="${labelId}">
                <span class="action-icon" aria-hidden="true" ${iconSize ? `style="font-size:${escapeAttr(cssLength(iconSize, actionIconSize))}"` : ''}>${htmlEscape(icon)}</span>
                <span id="${labelId}" class="action-label">${htmlEscape(label)}</span>
              </button>
            `;
          }).join('')}
        </div>
        <button type="button" class="main" part="button" aria-label="${htmlEscape(this.titleText(open ? 'Close actions' : 'Open actions'))}" aria-haspopup="menu" aria-controls="${actionsId}" aria-expanded="${open}">
          <span class="main-icon" aria-hidden="true">${htmlEscape(mainIcon)}</span>
        </button>
      </div>
    `;
    this.shadowRoot.querySelector('.main').addEventListener('click', () => {
      this.setOpen(!this.hasAttribute('open'));
    });
    this.shadowRoot.querySelector('.main').addEventListener('focus', () => {
      if (this.hasAttribute('open-on-focus') && !this.hasAttribute('open')) this.setOpen(true);
    });
    this.shadowRoot.querySelector('.main').addEventListener('keydown', event => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        event.preventDefault();
        if (!this.hasAttribute('open')) this.setOpen(true);
        requestAnimationFrame(() => this.focusAction(reverse ? this.items.length - 1 : 0));
      }
      if (event.key === 'Escape' && this.hasAttribute('open')) {
        event.preventDefault();
        this.setOpen(false, true);
      }
    });
    this.shadowRoot.querySelectorAll('[data-index]').forEach(button => button.addEventListener('click', () => {
      const item = this.items[Number(button.dataset.index)];
      this.emit('mvx-select', { item });
      if (!this.hasAttribute('persistent')) this.setOpen(false);
    }));
    this.shadowRoot.querySelectorAll('[data-index]').forEach((button, index) => button.addEventListener('keydown', event => {
      const actions = [...this.shadowRoot.querySelectorAll('.action')];
      if (['ArrowUp', 'ArrowLeft'].includes(event.key)) {
        event.preventDefault();
        this.focusAction(index - 1);
      }
      if (['ArrowDown', 'ArrowRight'].includes(event.key)) {
        event.preventDefault();
        this.focusAction(index + 1);
      }
      if (event.key === 'Home') {
        event.preventDefault();
        this.focusAction(0);
      }
      if (event.key === 'End') {
        event.preventDefault();
        this.focusAction(actions.length - 1);
      }
      if (event.key === 'Escape') {
        event.preventDefault();
        this.setOpen(false, true);
      }
    }));
    requestAnimationFrame(() => this.alignLabels());
  }
}

export class MvxCollapse extends MvxPeerElement {
  render() {
    this.shadowRoot.innerHTML = `
      <style>
        ${sharedStyles}
        .panel { display: ${this.hasAttribute('open') ? 'grid' : 'none'}; gap: 8px; padding: 12px; }
        button { inline-size: 100%; min-block-size: 38px; text-align: start; padding: 0 12px; }
      </style>
      <button type="button" aria-expanded="${this.hasAttribute('open')}">${htmlEscape(this.titleText('Collapse'))}</button>
      <div class="panel surface" part="panel"><slot>${htmlEscape(this.helperText())}</slot></div>
    `;
    this.shadowRoot.querySelector('button').addEventListener('click', () => {
      this.toggleAttribute('open');
      this.emit('mvx-change', { open: this.hasAttribute('open') });
    });
  }
}

export class MvxScrollArea extends MvxPeerElement {
  render() {
    this.shadowRoot.innerHTML = `
      <style>
        ${sharedStyles}
        .viewport {
          max-block-size: ${cssLength(this.getAttribute('height'), '220px')};
          overflow: auto;
          padding: 12px;
          scrollbar-color: var(--mvx-border-strong) transparent;
        }
      </style>
      <div class="viewport surface" part="viewport"><slot></slot></div>
    `;
  }
}

export class MvxResizable extends MvxPeerElement {
  render() {
    const direction = this.getAttribute('direction') || 'both';
    this.shadowRoot.innerHTML = `
      <style>
        ${sharedStyles}
        .box {
          overflow: auto;
          resize: ${htmlEscape(direction)};
          min-inline-size: 140px;
          min-block-size: 90px;
          inline-size: ${cssLength(this.getAttribute('width'), '260px')};
          block-size: ${cssLength(this.getAttribute('height'), '140px')};
          padding: 12px;
        }
      </style>
      <div class="box surface" part="panel"><slot>${htmlEscape(this.helperText() || 'Resize this panel.')}</slot></div>
    `;
  }
}

export class MvxAspectRatio extends MvxPeerElement {
  render() {
    const ratio = this.getAttribute('ratio') || '16 / 9';
    this.shadowRoot.innerHTML = `
      <style>
        ${sharedStyles}
        .ratio { aspect-ratio: ${htmlEscape(ratio)}; overflow: hidden; display: grid; place-items: center; }
        ::slotted(img), ::slotted(video), ::slotted(canvas) { inline-size: 100%; block-size: 100%; object-fit: cover; }
      </style>
      <div class="ratio surface" part="ratio"><slot>${htmlEscape(ratio)}</slot></div>
    `;
  }
}

export class MvxBox extends MvxPeerElement {
  render() {
    this.shadowRoot.innerHTML = `<style>${sharedStyles}:host{display:block;}</style><div part="box"><slot></slot></div>`;
  }
}

export class MvxContainer extends MvxPeerElement {
  render() {
    const fallbackMaxWidth = this.hasAttribute('wide') ? 'var(--mvx-container-wide, 1920px)' : 'var(--mvx-container-max, 1440px)';
    const maxWidth = cssLength(this.getAttribute('max-width') || this.getAttribute('width'), fallbackMaxWidth);
    const padding = cssLength(this.getAttribute('padding'), 'var(--mvx-container-padding, clamp(12px, 2vw, 32px))');
    this.shadowRoot.innerHTML = `
      <style>
        ${sharedStyles}
        :host { display: block; inline-size: 100%; }
        .container {
          inline-size: min(100%, ${maxWidth});
          margin-inline: auto;
          padding-inline: ${padding};
        }
        :host([fluid]) .container {
          inline-size: 100%;
          max-inline-size: none;
        }
        @media (max-width: 360px) {
          .container { padding-inline: min(${padding}, 12px); }
        }
      </style>
      <div class="container" part="container"><slot></slot></div>
    `;
  }
}

export class MvxGrid extends MvxPeerElement {
  render() {
    const columns = Math.max(1, Number(this.getAttribute('columns') || 3) || 3);
    const gap = cssLength(this.getAttribute('gap'), 'var(--mvx-grid-gap, clamp(10px, 1.1vw, 22px))');
    const minColumn = cssLength(this.getAttribute('min-column-width'), 'var(--mvx-grid-min-column, 220px)');
    const useAutoFit = this.hasAttribute('min-column-width') || this.getAttribute('responsive') === 'auto-fit';
    const shouldCollapse = this.getAttribute('responsive') !== 'false';
    const desktopColumns = Math.min(columns, 3);
    const tabletColumns = Math.min(columns, 2);
    this.shadowRoot.innerHTML = `
      <style>
        ${sharedStyles}
        :host { display: block; inline-size: 100%; }
        .grid {
          display: grid;
          grid-template-columns: ${useAutoFit ? `repeat(auto-fit, minmax(min(100%, ${minColumn}), 1fr))` : `repeat(${columns}, minmax(0, 1fr))`};
          gap: ${gap};
          align-items: ${this.getAttribute('align') || 'stretch'};
        }
        ${useAutoFit || !shouldCollapse ? '' : `
          @media (max-width: 1280px) {
            .grid { grid-template-columns: repeat(${desktopColumns}, minmax(0, 1fr)); }
          }
          @media (max-width: 820px) {
            .grid { grid-template-columns: repeat(${tabletColumns}, minmax(0, 1fr)); }
          }
          @media (max-width: 520px) {
            .grid { grid-template-columns: 1fr; }
          }
        `}
      </style>
      <div class="grid" part="grid"><slot></slot></div>
    `;
  }
}

export class MvxStack extends MvxPeerElement {
  render() {
    const horizontal = this.getAttribute('orientation') === 'horizontal';
    const gap = cssLength(this.getAttribute('gap'), 'var(--mvx-stack-gap, clamp(8px, 0.8vw, 18px))');
    const align = this.getAttribute('align') || (horizontal ? 'center' : 'stretch');
    const justify = this.getAttribute('justify') || 'start';
    this.shadowRoot.innerHTML = `
      <style>
        ${sharedStyles}
        :host { display: block; inline-size: 100%; }
        .stack {
          display: ${horizontal ? 'flex' : 'grid'};
          flex-wrap: wrap;
          gap: ${gap};
          align-items: ${align};
          justify-content: ${justify};
        }
        @media (max-width: 420px) {
          :host([orientation="horizontal"][responsive]:not([responsive="false"])) .stack {
            align-items: stretch;
            flex-direction: column;
          }
        }
      </style>
      <div class="stack" part="stack"><slot></slot></div>
    `;
  }
}

export class MvxPaper extends MvxPeerElement {
  render() {
    this.shadowRoot.innerHTML = `<style>${sharedStyles}.paper{padding:${cssLength(this.getAttribute('padding'), '14px')};}</style><section class="paper surface" part="paper"><slot></slot></section>`;
  }
}

export class MvxTypography extends MvxPeerElement {
  render() {
    const as = this.getAttribute('as') || 'p';
    const variant = this.getAttribute('variant') || 'body';
    const sizes = { h1: '32px', h2: '26px', h3: '21px', h4: '18px', body: '14px', caption: '12px', overline: '11px' };
    this.shadowRoot.innerHTML = `
      <style>${sharedStyles}.text{margin:0;color:${variant === 'caption' || variant === 'overline' ? 'var(--mvx-subtle)' : 'var(--mvx-fg)'};font-size:${sizes[variant] || sizes.body};font-weight:${variant.startsWith('h') ? '850' : variant === 'overline' ? '800' : '500'};text-transform:${variant === 'overline' ? 'uppercase' : 'none'};line-height:1.35;}</style>
      <${as} class="text" part="text"><slot>${htmlEscape(this.textContent || this.titleText('Text'))}</slot></${as}>
    `;
  }
}

export class MvxLink extends MvxPeerElement {
  render() {
    this.shadowRoot.innerHTML = `
      <style>${sharedStyles}:host{display:inline;}.link{color:var(--mvx-accent-2);font-weight:700;text-decoration:none;}.link:hover{text-decoration:underline;}</style>
      <a class="link" part="link" href="${escapeUrl(this.getAttribute('href') || '#')}" ${this.getAttribute('target') === '_blank' ? 'target="_blank" rel="noopener noreferrer"' : ''}><slot>${htmlEscape(this.titleText('Link'))}</slot></a>
    `;
  }
}

export class MvxKbd extends MvxPeerElement {
  render() {
    this.shadowRoot.innerHTML = `<style>${sharedStyles}:host{display:inline-flex;}kbd{border:1px solid var(--mvx-border);border-radius:var(--mvx-radius-xs);background:var(--mvx-bg-inset);color:var(--mvx-fg);font-family:var(--mvx-font-mono);font-size:12px;padding:2px 6px;}</style><kbd part="kbd"><slot>${htmlEscape(this.titleText('K'))}</slot></kbd>`;
  }
}

export class MvxLabel extends MvxPeerElement {
  render() {
    this.shadowRoot.innerHTML = `<style>${sharedStyles}:host{display:inline-flex;}label{color:var(--mvx-muted);font-size:13px;font-weight:700;}</style><label part="label" for="${escapeAttr(this.getAttribute('for') || '')}"><slot>${htmlEscape(this.titleText('Label'))}</slot></label>`;
  }
}

export class MvxStat extends MvxPeerElement {
  render() {
    const delta = this.getAttribute('delta') || '';
    this.shadowRoot.innerHTML = `
      <style>${sharedStyles}.stat{display:grid;gap:5px;padding:14px;}.value{font-size:28px;font-weight:900;}.delta{color:${delta.startsWith('-') ? 'var(--mvx-danger)' : 'var(--mvx-success)'};font-size:12px;font-weight:800;}</style>
      <section class="stat surface" part="stat"><span class="subtle">${htmlEscape(this.titleText('Metric'))}</span><strong class="value">${htmlEscape(this.value || '0')}</strong>${delta ? `<span class="delta">${htmlEscape(delta)}</span>` : ''}</section>
    `;
  }
}

export class MvxStatus extends MvxPeerElement {
  render() {
    const tone = toneColor(this.getAttribute('tone'));
    this.shadowRoot.innerHTML = `
      <style>${sharedStyles}:host{display:inline-flex;}.status{display:inline-flex;gap:7px;align-items:center;color:var(--mvx-muted);font-size:13px;}.dot{inline-size:9px;block-size:9px;border-radius:999px;background:${tone};box-shadow:0 0 0 4px color-mix(in srgb, ${tone} 15%, transparent);}</style>
      <span class="status" part="status"><span class="dot"></span><slot>${htmlEscape(this.titleText('Online'))}</slot></span>
    `;
  }
}

export class MvxRadialProgress extends MvxPeerElement {
  render() {
    const max = Number(this.getAttribute('max') || 100);
    const value = Number(this.value || 0);
    const pct = Math.max(0, Math.min(100, (value / max) * 100));
    this.shadowRoot.innerHTML = `
      <style>${sharedStyles}:host{display:inline-grid;}.radial{display:grid;place-items:center;inline-size:96px;block-size:96px;border-radius:999px;background:conic-gradient(var(--mvx-accent) ${pct}%, var(--mvx-bg-inset) 0);}.inner{display:grid;place-items:center;inline-size:72px;block-size:72px;border-radius:999px;background:var(--mvx-bg-panel);font-weight:850;}</style>
      <span class="radial" role="progressbar" aria-valuenow="${value}" aria-valuemin="0" aria-valuemax="${max}"><span class="inner">${Math.round(pct)}%</span></span>
    `;
  }
}

export class MvxCountdown extends MvxPeerElement {
  connectedCallback() {
    super.connectedCallback();
    if (!this._timer) this._timer = setInterval(() => this.render(), 1000);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    clearInterval(this._timer);
    this._timer = null;
  }

  remaining() {
    const to = this.getAttribute('to');
    const duration = Number(this.getAttribute('duration') || 0);
    const end = to ? new Date(to).getTime() : this._start ? this._start + duration * 1000 : Date.now();
    if (!this._start) this._start = Date.now();
    return Math.max(0, Math.floor((end - Date.now()) / 1000));
  }

  render() {
    const total = this.remaining();
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const seconds = total % 60;
    this.shadowRoot.innerHTML = `
      <style>${sharedStyles}:host{display:inline-flex;}.count{display:inline-flex;gap:6px;align-items:center;font-family:var(--mvx-font-mono);font-weight:850;}.part{border:1px solid var(--mvx-border);border-radius:var(--mvx-radius-sm);background:var(--mvx-bg-inset);padding:6px 8px;}</style>
      <span class="count" part="countdown"><span class="part">${String(hours).padStart(2, '0')}</span><span class="part">${String(minutes).padStart(2, '0')}</span><span class="part">${String(seconds).padStart(2, '0')}</span></span>
    `;
  }
}

export class MvxFooter extends MvxPeerElement {
  render() {
    this.shadowRoot.innerHTML = `<style>${sharedStyles}.footer{display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:space-between;padding:18px;}</style><footer class="footer surface" part="footer"><slot>${htmlEscape(this.titleText('Footer'))}</slot></footer>`;
  }
}

export class MvxHero extends MvxPeerElement {
  render() {
    this.shadowRoot.innerHTML = `
      <style>${sharedStyles}.hero{display:grid;gap:14px;place-items:start;padding:32px;min-block-size:260px;background:linear-gradient(135deg,color-mix(in srgb,var(--mvx-accent) 18%,var(--mvx-bg-panel)),var(--mvx-bg-panel));}.hero h1{margin:0;font-size:clamp(28px,5vw,52px);}.hero p{margin:0;max-inline-size:620px;color:var(--mvx-muted);line-height:1.5;}</style>
      <section class="hero surface" part="hero"><h1>${htmlEscape(this.titleText('Hero'))}</h1><p>${htmlEscape(this.helperText())}</p><slot></slot></section>
    `;
  }
}

export class MvxDiff extends MvxPeerElement {
  render() {
    const value = Math.max(0, Math.min(100, Number(this.value || 50)));
    this.shadowRoot.innerHTML = `
      <style>${sharedStyles}.diff{position:relative;display:grid;min-block-size:180px;overflow:hidden;}.before,.after{display:grid;place-items:center;grid-area:1/1;padding:20px;}.before{background:var(--mvx-bg-inset);clip-path:inset(0 ${100 - value}% 0 0);}.after{background:color-mix(in srgb,var(--mvx-accent) 14%,var(--mvx-bg-panel));}.range{position:absolute;inset-inline:12px;inset-block-end:12px;}</style>
      <section class="diff surface" part="diff"><div class="after"><slot name="after">${htmlEscape(this.getAttribute('after') || 'After')}</slot></div><div class="before"><slot name="before">${htmlEscape(this.getAttribute('before') || 'Before')}</slot></div><input class="range" type="range" min="0" max="100" value="${value}" /></section>
    `;
    this.shadowRoot.querySelector('input').addEventListener('input', event => {
      this.value = event.target.value;
      this.emit('mvx-change', { value: Number(this.value) });
    });
  }
}

export class MvxCodeBlock extends MvxPeerElement {
  render() {
    const code = this.getAttribute('code') || this.textContent.trim() || '<mvx-button>Action</mvx-button>';
    this.shadowRoot.innerHTML = `<style>${sharedStyles}pre{overflow:auto;margin:0;border-radius:var(--mvx-radius-md);background:#1e1e1e;color:#f8f8f2;font-family:var(--mvx-font-mono);font-size:12px;line-height:1.55;padding:12px;}</style><pre part="code"><code>${htmlEscape(code)}</code></pre>`;
  }
}

export class MvxBrowserMockup extends MvxPeerElement {
  render() {
    this.shadowRoot.innerHTML = `<style>${sharedStyles}.bar{display:flex;gap:5px;padding:9px;border-block-end:1px solid var(--mvx-border);}.dot{inline-size:10px;block-size:10px;border-radius:999px;background:var(--mvx-border-strong);}.body{min-block-size:150px;padding:14px;}</style><section class="surface"><div class="bar"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div><div class="body"><slot></slot></div></section>`;
  }
}

export class MvxWindowMockup extends MvxBrowserMockup {}

export class MvxPhoneMockup extends MvxPeerElement {
  render() {
    this.shadowRoot.innerHTML = `<style>${sharedStyles}.phone{inline-size:220px;min-block-size:360px;border:8px solid var(--mvx-border-strong);border-radius:28px;background:var(--mvx-bg-panel);padding:14px;}.notch{inline-size:72px;block-size:6px;border-radius:999px;background:var(--mvx-border);margin:0 auto 12px;}</style><section class="phone" part="phone"><div class="notch"></div><slot></slot></section>`;
  }
}

export class MvxIndicator extends MvxPeerElement {
  render() {
    this.shadowRoot.innerHTML = `<style>${sharedStyles}:host{display:inline-block;position:relative;}.badge{position:absolute;inset-block-start:-7px;inset-inline-end:-7px;min-inline-size:18px;block-size:18px;border-radius:999px;background:${toneColor(this.getAttribute('tone'))};color:white;font-size:11px;font-weight:850;display:grid;place-items:center;padding:0 5px;}</style><span part="content"><slot></slot></span><span class="badge" part="indicator">${htmlEscape(this.value || this.getAttribute('label') || '')}</span>`;
  }
}

export class MvxMask extends MvxPeerElement {
  render() {
    const shape = this.getAttribute('shape') || 'squircle';
    const clip = shape === 'circle' ? 'circle(50%)' : shape === 'diamond' ? 'polygon(50% 0,100% 50%,50% 100%,0 50%)' : 'inset(0 round 22%)';
    this.shadowRoot.innerHTML = `<style>${sharedStyles}.mask{display:grid;place-items:center;inline-size:${cssLength(this.getAttribute('width'), '96px')};block-size:${cssLength(this.getAttribute('height'), '96px')};clip-path:${clip};background:var(--mvx-bg-inset);overflow:hidden;}</style><span class="mask" part="mask"><slot></slot></span>`;
  }
}

export class MvxJoin extends MvxPeerElement {
  render() {
    const vertical = this.getAttribute('orientation') === 'vertical';
    this.shadowRoot.innerHTML = `<style>${sharedStyles}.join{display:inline-flex;flex-direction:${vertical ? 'column' : 'row'};}::slotted(*){margin:0!important;}::slotted(:not(:first-child)){margin-inline-start:${vertical ? '0' : '-1px'}!important;margin-block-start:${vertical ? '-1px' : '0'}!important;}</style><div class="join" part="join"><slot></slot></div>`;
  }
}

export class MvxAura extends MvxPeerElement {
  render() {
    this.shadowRoot.innerHTML = `<style>${sharedStyles}.aura{position:relative;border-radius:var(--mvx-radius-lg);padding:2px;background:linear-gradient(135deg,var(--mvx-accent),var(--mvx-accent-2),var(--mvx-warning));}.inner{border-radius:calc(var(--mvx-radius-lg) - 2px);background:var(--mvx-bg-panel);padding:${cssLength(this.getAttribute('padding'), '14px')};}</style><div class="aura" part="aura"><div class="inner"><slot></slot></div></div>`;
  }
}

export class MvxHoverGallery extends MvxPeerElement {
  render() {
    const items = this.items.length ? this.items : [{ label: 'One' }, { label: 'Two' }, { label: 'Three' }];
    this.shadowRoot.innerHTML = `
      <style>${sharedStyles}.gallery{display:grid;grid-template-columns:repeat(${items.length},minmax(48px,1fr));gap:4px;min-block-size:150px;}.item{display:grid;place-items:end start;border-radius:var(--mvx-radius-sm);background:var(--mvx-bg-inset);padding:10px;transition:flex var(--mvx-duration);}.item:hover{background:color-mix(in srgb,var(--mvx-accent) 18%,var(--mvx-bg-inset));}.label{font-weight:800;}</style>
      <div class="gallery" part="gallery">${items.map(item => `<div class="item" style="${item.image ? `background-image:${cssUrl(item.image)};background-size:cover;background-position:center;` : ''}"><span class="label">${htmlEscape(optionLabel(item))}</span></div>`).join('')}</div>
    `;
  }
}

export class MvxImageList extends MvxPeerElement {
  render() {
    const columns = Number(this.getAttribute('columns') || 3);
    this.shadowRoot.innerHTML = `<style>${sharedStyles}.images{display:grid;grid-template-columns:repeat(${columns},minmax(0,1fr));gap:8px;}.image{aspect-ratio:1;border-radius:var(--mvx-radius-sm);background:var(--mvx-bg-inset);display:grid;place-items:center;color:var(--mvx-subtle);overflow:hidden;}.image img{inline-size:100%;block-size:100%;object-fit:cover;}</style><div class="images" part="list">${this.items.map(item => `<figure class="image">${item.src ? `<img src="${escapeUrl(item.src, '', { allowDataImages: true })}" alt="${escapeAttr(item.alt || optionLabel(item))}" />` : htmlEscape(optionLabel(item))}</figure>`).join('')}</div>`;
  }
}

export class MvxIcon extends MvxPeerElement {
  static observedAttributes = [...MvxPeerElement.observedAttributes, 'name', 'icon', 'size'];

  render() {
    const icons = {
      add: '+',
      plus: '+',
      minus: '-',
      close: 'x',
      x: 'x',
      check: '✓',
      success: '✓',
      menu: '☰',
      more: '⋯',
      kebab: '⋮',
      search: '⌕',
      settings: '⚙',
      gear: '⚙',
      user: '◎',
      users: '◉',
      warning: '!',
      danger: '!',
      error: '!',
      info: 'i',
      help: '?',
      arrow: '→',
      'arrow-right': '→',
      'arrow-left': '←',
      'arrow-up': '↑',
      'arrow-down': '↓',
      chevron: '›',
      'chevron-right': '›',
      'chevron-left': '‹',
      'chevron-up': '⌃',
      'chevron-down': '⌄',
      external: '↗',
      upload: '⇧',
      download: '⇩',
      refresh: '↻',
      undo: '↶',
      redo: '↷',
      play: '▶',
      pause: 'Ⅱ',
      stop: '■',
      edit: '✎',
      copy: '⧉',
      save: '▣',
      trash: '⌫',
      delete: '⌫',
      filter: '⧨',
      sort: '↕',
      calendar: '◷',
      clock: '◴',
      mail: '✉',
      lock: '⌑',
      unlock: '◇',
      home: '⌂',
      link: '↔',
      star: '★',
      heart: '♥',
      flag: '⚑',
      bell: '◉',
      command: '⌘',
      terminal: '▹',
      code: '</>',
      database: '▤',
      table: '▦',
      chart: '▧',
      grid: '▦',
      list: '☷',
      layers: '▰',
      image: '▧',
      file: '□',
      folder: '▱',
      cloud: '☁',
      sparkles: '✦',
      ai: '✦',
      bot: '◌',
      workflow: '↬',
      lightning: '↯',
      rocket: '▲',
      package: '▣',
      npm: 'npm',
      github: '⌘'
    };
    const name = this.getAttribute('name') || this.getAttribute('icon') || 'check';
    const size = cssLength(this.getAttribute('size'), '1em');
    const label = this.getAttribute('label') || name;
    this.shadowRoot.innerHTML = `
      <style>
        ${sharedStyles}
        :host { display: inline-grid; place-items: center; inline-size: ${size}; block-size: ${size}; }
        .icon { display: inline-grid; place-items: center; inline-size: 100%; block-size: 100%; color: ${toneColor(this.getAttribute('tone'))}; font-size: ${size}; font-weight: 850; line-height: 1; }
      </style>
      <span class="icon" part="icon" role="img" aria-label="${htmlEscape(label)}"><slot>${htmlEscape(icons[name] || name.charAt(0).toUpperCase())}</slot></span>
    `;
  }
}

export class MvxIcons extends MvxPeerElement {
  render() {
    const items = this.items.length ? this.items : ['check', 'close', 'plus', 'search', 'settings', 'chart', 'table', 'sparkles'];
    this.shadowRoot.innerHTML = `
      <style>
        ${sharedStyles}
        .icons { display: flex; flex-wrap: wrap; gap: 8px; }
        .item { display: grid; place-items: center; inline-size: 34px; block-size: 34px; border: 1px solid var(--mvx-border); border-radius: var(--mvx-radius-sm); background: var(--mvx-bg-inset); }
      </style>
      <span class="icons" part="icons" aria-label="${htmlEscape(this.titleText('Icons'))}">
        ${items.map(item => `<span class="item"><mvx-icon name="${escapeAttr(optionLabel(item, item))}"></mvx-icon></span>`).join('')}
      </span>
    `;
  }
}

export class MvxMasonry extends MvxPeerElement {
  render() {
    this.shadowRoot.innerHTML = `
      <style>
        ${sharedStyles}
        .masonry {
          column-count: ${Math.max(1, Number(this.getAttribute('columns') || 3))};
          column-gap: ${cssLength(this.getAttribute('gap'), '12px')};
        }
        ::slotted(*) {
          display: block;
          break-inside: avoid;
          margin-block-end: ${cssLength(this.getAttribute('gap'), '12px')};
        }
        @media (max-width: 720px) { .masonry { column-count: 1; } }
      </style>
      <div class="masonry" part="masonry"><slot></slot></div>
    `;
  }
}

export class MvxSwap extends MvxPeerElement {
  static observedAttributes = [...MvxPeerElement.observedAttributes, 'loading'];

  attributeChangedCallback(name, oldValue, newValue) {
    if (['checked', 'loading'].includes(name) && oldValue !== newValue && this.isConnected && this.shadowRoot?.querySelector('button')) {
      this.syncPressedState();
      return;
    }
    super.attributeChangedCallback(name, oldValue, newValue);
  }

  syncPressedState() {
    const button = this.shadowRoot?.querySelector('button');
    if (!button) return;
    button.setAttribute('aria-pressed', String(this.hasAttribute('checked')));
    button.setAttribute('aria-busy', String(this.hasAttribute('loading')));
    button.disabled = this.hasAttribute('disabled') || this.hasAttribute('loading');
  }

  toggle() {
    if (this.hasAttribute('disabled') || this.hasAttribute('loading')) return;
    this.toggleAttribute('checked');
    this.syncPressedState();
    this.emit('mvx-change', { checked: this.hasAttribute('checked') });
  }

  render() {
    const checked = this.hasAttribute('checked');
    this.shadowRoot.innerHTML = `
      <style>
        ${sharedStyles}
        :host { display: inline-flex; }
        button {
          position: relative;
          display: inline-grid;
          grid-template-areas: "stack";
          min-block-size: 36px;
          min-inline-size: ${cssLength(this.getAttribute('width'), '72px')};
          border: 0;
          background: transparent;
          box-shadow: none;
          color: var(--mvx-fg);
          overflow: hidden;
          padding: 0;
          perspective: 720px;
        }
        button:hover:not(:disabled) {
          transform: translateY(var(--mvx-hover-lift));
        }
        .face {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          grid-area: stack;
          display: inline-flex;
          gap: 6px;
          align-items: center;
          justify-content: center;
          min-block-size: 36px;
          min-inline-size: 100%;
          border: 1px solid var(--mvx-border);
          border-radius: var(--mvx-radius-sm);
          background: var(--mvx-control-glaze), var(--mvx-bg-inset);
          box-shadow: var(--mvx-control-shadow);
          pointer-events: none;
          padding: 0 12px;
          text-align: center;
          transform-origin: 50% 0%;
          transition:
            opacity 500ms cubic-bezier(0.2, 0.8, 0.2, 1),
            transform 500ms cubic-bezier(0.2, 0.8, 0.2, 1),
            border-color 500ms cubic-bezier(0.2, 0.8, 0.2, 1),
            background 500ms cubic-bezier(0.2, 0.8, 0.2, 1),
            box-shadow 500ms cubic-bezier(0.2, 0.8, 0.2, 1);
          white-space: nowrap;
        }
        .loading {
          border-color: color-mix(in srgb, var(--mvx-accent) 46%, var(--mvx-border));
          background:
            linear-gradient(180deg, color-mix(in srgb, var(--mvx-accent-2) 10%, transparent), transparent),
            var(--mvx-bg-inset);
          opacity: 0;
          transform: translateY(-50%) rotateX(90deg);
        }
        .front {
          opacity: 1;
          position: relative;
          transform: translateY(0) rotateX(0);
        }
        .back {
          border-color: var(--mvx-accent);
          background:
            linear-gradient(180deg, color-mix(in srgb, var(--mvx-accent-2) 18%, transparent), transparent),
            color-mix(in srgb, var(--mvx-accent) 18%, var(--mvx-bg-inset));
          box-shadow: var(--mvx-control-shadow), 0 8px 18px color-mix(in srgb, var(--mvx-accent) 18%, transparent);
          opacity: 0;
          transform: translateY(-50%) rotateX(90deg);
        }
        :host([checked]) .back {
          opacity: 1;
          transform: translateY(0) rotateX(0);
        }
        :host([checked]) .front {
          opacity: 0;
          transform: translateY(50%) rotateX(90deg);
        }
        :host([loading]) .front,
        :host([loading]) .back {
          opacity: 0;
          transform: translateY(50%) rotateX(90deg);
        }
        :host([loading]) .loading {
          opacity: 1;
          transform: translateY(0) rotateX(0);
        }
        .spinner {
          inline-size: 14px;
          block-size: 14px;
          border: 2px solid currentColor;
          border-block-start-color: transparent;
          border-radius: 999px;
          animation: mvx-swap-spin 800ms linear infinite;
        }
        @keyframes mvx-swap-spin { to { transform: rotate(360deg); } }
        button:focus-visible {
          outline: none;
        }
        button:focus-visible .face {
          box-shadow: var(--mvx-focus), var(--mvx-control-shadow);
        }
        @media (prefers-reduced-motion: reduce) {
          button,
          .spinner,
          .face {
            transition: none;
            animation: none;
          }
        }
      </style>
      <button type="button" part="button" aria-pressed="${checked}" aria-busy="${this.hasAttribute('loading')}" ${this.hasAttribute('disabled') || this.hasAttribute('loading') ? 'disabled' : ''}>
        <span class="face front" part="off"><slot name="off">Off</slot></span>
        <span class="face back" part="on"><slot name="on">On</slot></span>
        <span class="face loading" part="loading"><slot name="loading"><span class="spinner" aria-hidden="true"></span>Loading</slot></span>
      </button>
    `;
    this.shadowRoot.querySelector('button').addEventListener('click', () => this.toggle());
  }
}

export class MvxTextRotate extends MvxPeerElement {
  connectedCallback() {
    super.connectedCallback();
    if (!this._rotateTimer) {
      this._rotateTimer = setInterval(() => {
        const items = this.items.length ? this.items : String(this.textContent || '').split(',').filter(Boolean);
        if (!items.length) return;
        this.active = (this.active + 1) % items.length;
      }, Number(this.getAttribute('duration') || 2400));
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    clearInterval(this._rotateTimer);
    this._rotateTimer = null;
  }

  render() {
    const items = this.items.length ? this.items : [{ label: this.titleText('Mivix') }];
    const item = items[Math.min(this.active, items.length - 1)] || items[0];
    this.shadowRoot.innerHTML = `
      <style>
        ${sharedStyles}
        :host { display: inline-flex; }
        .text { color: var(--mvx-accent-2); font-weight: 850; transition: opacity var(--mvx-duration); }
      </style>
      <span class="text" part="text">${htmlEscape(optionLabel(item))}</span>
    `;
  }
}

export class MvxHover3dCard extends MvxPeerElement {
  render() {
    this.shadowRoot.innerHTML = `
      <style>
        ${sharedStyles}
        .card {
          display: grid;
          gap: 8px;
          min-block-size: 150px;
          padding: 18px;
          transform: perspective(760px) rotateX(var(--tilt-y, 0deg)) rotateY(var(--tilt-x, 0deg));
          transform-style: preserve-3d;
          transition: transform var(--mvx-duration), box-shadow var(--mvx-duration);
        }
        .card:hover { box-shadow: var(--mvx-shadow-raised); }
      </style>
      <article class="card surface" part="card">
        <strong>${htmlEscape(this.titleText('Hover 3D card'))}</strong>
        <span class="muted"><slot>${htmlEscape(this.helperText() || 'Pointer-reactive card tilt.')}</slot></span>
      </article>
    `;
    this.wirePointerMotion(this.shadowRoot.querySelector('.card'));
  }
}

export class MvxThemeController extends MvxPeerElement {
  get themes() {
    return (this.getAttribute('themes') || 'dark,light,graphite,aurora,terminal').split(',').map(item => item.trim()).filter(Boolean);
  }

  select(theme) {
    applyDocumentTheme(theme, { persist: true });
    this.value = theme;
    this.emit('mvx-change', { value: theme });
    this.render();
  }

  render() {
    const active = this.value || document.documentElement.getAttribute('data-mvx-theme') || readStoredTheme() || 'graphite';
    this.shadowRoot.innerHTML = `
      <style>
        ${sharedStyles}
        .themes { display: flex; flex-wrap: wrap; gap: 6px; }
        button { min-block-size: 34px; padding: 0 10px; }
        button[aria-pressed="true"] { border-color: var(--mvx-accent); background: color-mix(in srgb, var(--mvx-accent) 16%, var(--mvx-bg-inset)); }
      </style>
      <div class="themes" part="themes" role="group" aria-label="${htmlEscape(this.titleText('Theme controller'))}">
        ${this.themes.map(theme => `<button type="button" data-theme="${htmlEscape(theme)}" aria-pressed="${theme === active}">${htmlEscape(theme)}</button>`).join('')}
      </div>
    `;
    this.shadowRoot.querySelectorAll('button').forEach(button => button.addEventListener('click', () => this.select(button.dataset.theme)));
  }
}

export class MvxFigure extends MvxPeerElement {
  render() {
    this.shadowRoot.innerHTML = `
      <style>
        ${sharedStyles}
        figure { display: grid; gap: 8px; margin: 0; }
        .media { display: grid; place-items: center; min-block-size: 160px; overflow: hidden; background: var(--mvx-bg-inset); }
        img { inline-size: 100%; block-size: 100%; object-fit: ${this.getAttribute('fit') || 'cover'}; }
        figcaption { color: var(--mvx-subtle); font-size: 12px; line-height: 1.4; }
      </style>
      <figure part="figure">
        <span class="media surface">${this.getAttribute('src') ? `<img src="${escapeUrl(this.getAttribute('src'), '', { allowDataImages: true })}" alt="${escapeAttr(this.getAttribute('alt') || this.titleText('Figure'))}" loading="${escapeAttr(this.getAttribute('loading') || 'lazy')}" />` : '<slot></slot>'}</span>
        <figcaption>${htmlEscape(this.getAttribute('caption') || this.helperText() || this.titleText(''))}</figcaption>
      </figure>
    `;
  }
}

export class MvxImage extends MvxPeerElement {
  render() {
    const src = this.getAttribute('src');
    this.shadowRoot.innerHTML = `
      <style>
        ${sharedStyles}
        :host { display: block; }
        img { display: block; inline-size: 100%; block-size: ${cssLength(this.getAttribute('height'), 'auto')}; border-radius: var(--mvx-radius-md); object-fit: ${this.getAttribute('fit') || 'cover'}; background: var(--mvx-bg-inset); }
        .fallback { display: grid; place-items: center; min-block-size: ${cssLength(this.getAttribute('height'), '160px')}; border: 1px solid var(--mvx-border); border-radius: var(--mvx-radius-md); background: var(--mvx-bg-inset); color: var(--mvx-subtle); }
      </style>
      ${src
        ? `<img part="image" src="${escapeUrl(src, '', { allowDataImages: true })}" alt="${escapeAttr(this.getAttribute('alt') || this.titleText('Image'))}" loading="${escapeAttr(this.getAttribute('loading') || 'lazy')}" />`
        : `<span class="fallback" part="fallback"><slot>${htmlEscape(this.titleText('Image preview'))}</slot></span>`}
    `;
  }
}

function schemaFieldType(schema = {}, ui = {}) {
  if (ui.widget) return ui.widget;
  if (schema.enum) return 'select';
  if (schema.format === 'date' || schema.format === 'date-time' || schema.format === 'time') return schema.format;
  if (schema.format === 'email') return 'email';
  if (schema.format === 'password') return 'password';
  if (schema.type === 'boolean') return 'checkbox';
  if (schema.type === 'number' || schema.type === 'integer') return 'number';
  if (schema.type === 'array') return 'array';
  if (schema.type === 'object') return 'object';
  return 'text';
}

export class MvxJsonSchemaForm extends MvxPeerElement {
  static observedAttributes = [...MvxPeerElement.observedAttributes, 'schema', 'ui-schema', 'form-data', 'submit-label'];

  set schema(value) {
    this._schema = value;
    if (this.isConnected) this.render();
  }

  get schema() {
    return parseData(this._schema ?? this.getAttribute('schema'), { type: 'object', properties: {} });
  }

  set uiSchema(value) {
    this._uiSchema = value;
    if (this.isConnected) this.render();
  }

  get uiSchema() {
    return parseData(this._uiSchema ?? this.getAttribute('ui-schema'), {});
  }

  set formData(value) {
    this._formData = value && typeof value === 'object' ? value : parseData(value, {});
    if (this.isConnected) this.render();
  }

  get formData() {
    return this._formData ?? parseData(this.getAttribute('form-data'), {});
  }

  updateValue(name, value) {
    this._formData = { ...this.formData, [name]: value };
    this.emit('mvx-change', { formData: this._formData, name, value });
  }

  fieldMarkup(name, schema, ui = {}, value = '') {
    const label = ui.label || schema.title || name;
    const helper = ui.helper || schema.description || '';
    const required = (this.schema.required || []).includes(name);
    const type = schemaFieldType(schema, ui);
    const common = `data-field="${escapeAttr(name)}" ${required ? 'required' : ''}`;
    if (type === 'checkbox') {
      return `<label class="check"><input type="checkbox" ${common} ${value ? 'checked' : ''} /> <span>${htmlEscape(label)}</span></label>${helper ? `<small>${htmlEscape(helper)}</small>` : ''}`;
    }
    if (type === 'select') {
      return `<label class="field"><span>${htmlEscape(label)}</span><select ${common}>${(schema.enum || []).map(option => `<option value="${escapeAttr(option)}" ${String(option) === String(value) ? 'selected' : ''}>${htmlEscape(option)}</option>`).join('')}</select>${helper ? `<small>${htmlEscape(helper)}</small>` : ''}</label>`;
    }
    if (type === 'textarea' || type === 'markdown') {
      return `<label class="field"><span>${htmlEscape(label)}</span><textarea ${common} placeholder="${escapeAttr(ui.placeholder || '')}">${htmlEscape(value)}</textarea>${helper ? `<small>${htmlEscape(helper)}</small>` : ''}</label>`;
    }
    if (type === 'array' || type === 'object') {
      return `<label class="field"><span>${htmlEscape(label)}</span><textarea ${common} data-json="true">${htmlEscape(JSON.stringify(value || (type === 'array' ? [] : {}), null, 2))}</textarea>${helper ? `<small>${htmlEscape(helper)}</small>` : ''}</label>`;
    }
    const inputType = type === 'date-time' ? 'datetime-local' : type;
    return `<label class="field"><span>${htmlEscape(label)}</span><input type="${escapeAttr(inputType)}" ${common} value="${escapeAttr(value ?? '')}" placeholder="${escapeAttr(ui.placeholder || '')}" />${helper ? `<small>${htmlEscape(helper)}</small>` : ''}</label>`;
  }

  render() {
    const schema = this.schema;
    const uiSchema = this.uiSchema;
    const data = this.formData;
    const properties = schema.properties || {};
    const order = uiSchema['ui:order'] || Object.keys(properties);
    this.shadowRoot.innerHTML = `
      <style>
        ${sharedStyles}
        ${formStyles}
        form { display: grid; gap: 12px; padding: 14px; }
        h3 { margin: 0; font-size: 16px; }
        small { color: var(--mvx-subtle); font-size: 12px; }
        .check { display: flex; gap: 8px; align-items: center; color: var(--mvx-muted); font-size: 13px; font-weight: 650; }
        .actions { display: flex; justify-content: end; }
      </style>
      <form class="surface" part="form">
        ${schema.title ? `<h3>${htmlEscape(schema.title)}</h3>` : ''}
        ${schema.description ? `<small>${htmlEscape(schema.description)}</small>` : ''}
        ${order.filter(name => properties[name]).map(name => this.fieldMarkup(name, properties[name], uiSchema[name] || {}, data[name])).join('')}
        <div class="actions"><button type="submit">${htmlEscape(this.getAttribute('submit-label') || 'Submit')}</button></div>
      </form>
    `;
    const form = this.shadowRoot.querySelector('form');
    form.addEventListener('input', event => {
      const target = event.target;
      const name = target.dataset.field;
      if (!name) return;
      let value = target.type === 'checkbox' ? target.checked : target.value;
      if (target.dataset.json === 'true') {
        try { value = JSON.parse(target.value); } catch { value = target.value; }
      }
      if (target.type === 'number') value = Number(value);
      this.updateValue(name, value);
    });
    form.addEventListener('submit', event => {
      event.preventDefault();
      this.emit('mvx-submit', { formData: this.formData });
    });
  }
}

export class MvxSchemaForm extends MvxJsonSchemaForm {}

function renderJsonNode(node) {
  if (node == null) return '';
  if (typeof node === 'string' || typeof node === 'number') return htmlEscape(node);
  if (Array.isArray(node)) return node.map(renderJsonNode).join('');
  const tag = String(node.tag || node.component || 'div').toLowerCase();
  const allowed = tag.startsWith('mvx-') || ['div', 'section', 'article', 'p', 'span', 'strong', 'em', 'ul', 'ol', 'li', 'nav', 'header', 'footer', 'main'].includes(tag);
  const safeTag = allowed ? tag : 'div';
  const attrs = Object.entries(node.attrs || node.props || {})
    .filter(([name]) => !/^on/i.test(name) && name !== 'style')
    .map(([name, value]) => {
      const safeName = String(name).replace(/[^a-zA-Z0-9:._-]/g, '');
      if (!safeName) return '';
      if (value === true) return htmlEscape(safeName);
      const serialized = typeof value === 'object' ? JSON.stringify(value) : value;
      const safeValue = ['href', 'src', 'poster', 'xlink:href'].includes(safeName.toLowerCase())
        ? safeUrl(serialized, safeName.toLowerCase() === 'href' ? '#' : '', { allowDataImages: true })
        : serialized;
      return `${htmlEscape(safeName)}="${escapeAttr(safeValue)}"`;
    })
    .filter(Boolean)
    .join(' ');
  const children = node.text != null ? htmlEscape(node.text) : renderJsonNode(node.children || []);
  return `<${safeTag}${attrs ? ` ${attrs}` : ''}>${children}</${safeTag}>`;
}

export class MvxJsonRenderer extends MvxPeerElement {
  static observedAttributes = [...MvxPeerElement.observedAttributes, 'config'];

  set config(value) {
    this._config = value;
    if (this.isConnected) this.render();
  }

  get config() {
    return parseData(this._config ?? this.getAttribute('config'), []);
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>
        ${sharedStyles}
        .rendered { display: block; }
      </style>
      <div class="rendered" part="rendered">${renderJsonNode(this.config)}</div>
    `;
  }
}

export class MvxRichTextEditor extends MvxPeerElement {
  static observedAttributes = [...MvxPeerElement.observedAttributes, 'endpoint', 'method', 'provider', 'model', 'headers', 'system-prompt', 'placeholder', 'readonly', 'disabled', 'height', 'ai-label', 'chat-label', 'response-mode'];

  set value(value) {
    this._value = sanitizeRichHtml(value);
    const editor = this.shadowRoot?.querySelector('.editor');
    if (editor && editor.innerHTML !== this._value) editor.innerHTML = this._value;
  }

  get value() {
    return sanitizeRichHtml(this._value ?? this.getAttribute('value') ?? '');
  }

  set messages(value) {
    this._messages = Array.isArray(value) ? value : parseData(value, []);
  }

  get messages() {
    return this._messages ?? parseData(this.getAttribute('messages'), []);
  }

  set headers(value) {
    this._headers = value && typeof value === 'object' ? value : parseData(value, {});
  }

  get headers() {
    return this._headers ?? parseData(this.getAttribute('headers'), {});
  }

  exec(command, value = null) {
    if (this.hasAttribute('disabled') || this.hasAttribute('readonly')) return;
    const editor = this.shadowRoot.querySelector('.editor');
    let nextValue = value;
    if ((command === 'createLink' || command === 'insertImage') && value) {
      nextValue = safeUrl(value, '', { allowDataImages: command === 'insertImage' });
      if (!nextValue) return;
    }
    if (command === 'insertHTML') nextValue = sanitizeRichHtml(value);
    editor.focus();
    document.execCommand(command, false, nextValue);
    this.capture();
  }

  capture() {
    const editor = this.shadowRoot.querySelector('.editor');
    const sanitized = sanitizeRichHtml(editor.innerHTML);
    if (editor.innerHTML !== sanitized) editor.innerHTML = sanitized;
    this._value = sanitized;
    this.emit('mvx-change', { value: this._value, html: this._value, text: editor.textContent || '' });
  }

  promptLink(command) {
    const value = window.prompt(command === 'createLink' ? 'Enter URL' : 'Enter image URL');
    if (value) this.exec(command, value);
  }

  syncChat() {
    const chat = this.shadowRoot?.querySelector('.chat');
    if (!chat) return;
    chat.innerHTML = this.messages.map(message => `
      <div class="chat-row" data-role="${escapeAttr(message.role || 'assistant')}">
        <strong>${htmlEscape(message.role || 'assistant')}</strong>
        <span>${htmlEscape(message.content || message.text || '')}</span>
      </div>
    `).join('');
  }

  async runAi(mode = this.getAttribute('response-mode') || 'insert') {
    const endpoint = this.getAttribute('endpoint');
    const prompt = this.shadowRoot.querySelector('.ai-prompt').value.trim();
    const editor = this.shadowRoot.querySelector('.editor');
    if (!endpoint || !prompt) return;
    this._messages = [...this.messages, { role: 'user', content: prompt }];
    this.syncChat();
    const payload = {
      prompt,
      content: editor.textContent || '',
      html: editor.innerHTML,
      provider: this.getAttribute('provider') || '',
      model: this.getAttribute('model') || '',
      messages: this.messages,
      systemPrompt: this.getAttribute('system-prompt') || '',
      mode
    };
    this.emit('mvx-ai-request', payload);
    this.toggleAttribute('loading', true);
    try {
      const response = await fetch(endpoint, {
        method: this.getAttribute('method') || 'POST',
        headers: { 'Content-Type': 'application/json', ...this.headers },
        body: JSON.stringify(payload)
      });
      if (!response.ok) throw new Error(`AI request failed with ${response.status}`);
      const contentType = response.headers.get('content-type') || '';
      const data = contentType.includes('application/json') ? await response.json() : { text: await response.text() };
      const html = sanitizeRichHtml(data.html || data.content || data.text || '');
      const assistantContent = data.message || data.text || String(html).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      this._messages = [...this.messages, { role: 'assistant', content: assistantContent }];
      this.syncChat();
      let inserted = '';
      if (html && mode !== 'chat') {
        if (mode === 'replace') {
          editor.innerHTML = html;
          this.capture();
        } else {
          this.exec('insertHTML', html);
        }
        inserted = html;
      }
      if (html) {
        this.emit('mvx-ai-response', { response: data, inserted, mode });
      }
      this.shadowRoot.querySelector('.ai-prompt').value = '';
    } catch (error) {
      this.emit('mvx-ai-error', { message: error.message });
    } finally {
      this.toggleAttribute('loading', false);
    }
  }

  render() {
    const readonly = this.hasAttribute('readonly') || this.hasAttribute('disabled');
    const endpoint = this.getAttribute('endpoint') || '';
    const messages = this.messages;
    this.shadowRoot.innerHTML = `
      <style>
        ${sharedStyles}
        .editor-shell { display: grid; gap: 0; overflow: hidden; }
        .toolbar {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          border-block-end: 1px solid var(--mvx-border);
          padding: 8px;
        }
        .toolbar button, .toolbar select {
          min-block-size: 30px;
          border: 1px solid var(--mvx-border);
          border-radius: var(--mvx-radius-xs);
          background: var(--mvx-bg-inset);
          color: var(--mvx-fg);
          padding: 0 8px;
        }
        .editor {
          min-block-size: ${cssLength(this.getAttribute('height'), '260px')};
          padding: 14px;
          color: var(--mvx-fg);
          line-height: 1.55;
          outline: none;
          overflow: auto;
        }
        .editor:empty::before { content: attr(data-placeholder); color: var(--mvx-subtle); }
        .ai {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto auto;
          gap: 8px;
          border-block-start: 1px solid var(--mvx-border);
          padding: 8px;
        }
        .ai input {
          min-block-size: 34px;
          border: 1px solid var(--mvx-border);
          border-radius: var(--mvx-radius-sm);
          background: var(--mvx-bg-inset);
          color: var(--mvx-fg);
          padding: 0 10px;
        }
        .chat {
          display: grid;
          gap: 7px;
          max-block-size: 160px;
          overflow: auto;
          border-block-start: 1px solid var(--mvx-border);
          padding: 8px;
        }
        .chat:empty { display: none; }
        .chat-row {
          display: grid;
          gap: 2px;
          border-radius: var(--mvx-radius-sm);
          background: var(--mvx-bg-inset);
          padding: 8px;
        }
        .chat-row strong { color: var(--mvx-accent-2); font-size: 11px; text-transform: uppercase; }
        .chat-row span { color: var(--mvx-muted); font-size: 12px; line-height: 1.45; }
        :host([loading]) .ai button { opacity: 0.65; }
        @media (max-width: 640px) { .ai { grid-template-columns: 1fr; } }
      </style>
      <section class="editor-shell surface" part="editor">
        <div class="toolbar" part="toolbar">
          <button type="button" data-command="undo" title="Undo">↶</button>
          <button type="button" data-command="redo" title="Redo">↷</button>
          <button type="button" data-command="bold" title="Bold"><strong>B</strong></button>
          <button type="button" data-command="italic" title="Italic"><em>I</em></button>
          <button type="button" data-command="underline" title="Underline"><u>U</u></button>
          <button type="button" data-command="strikeThrough" title="Strike"><s>S</s></button>
          <button type="button" data-block="H2" title="Heading">H2</button>
          <button type="button" data-block="P" title="Paragraph">P</button>
          <button type="button" data-command="insertUnorderedList" title="Bulleted list">UL</button>
          <button type="button" data-command="insertOrderedList" title="Numbered list">OL</button>
          <button type="button" data-command="outdent" title="Outdent">Out</button>
          <button type="button" data-command="indent" title="Indent">In</button>
          <button type="button" data-command="justifyLeft" title="Align left">Left</button>
          <button type="button" data-command="justifyCenter" title="Align center">Center</button>
          <button type="button" data-command="justifyRight" title="Align right">Right</button>
          <button type="button" data-command="formatBlock" data-value="blockquote" title="Quote">Quote</button>
          <button type="button" data-command="formatBlock" data-value="pre" title="Code">Code</button>
          <button type="button" data-command="insertHorizontalRule" title="Divider">Rule</button>
          <button type="button" data-special="link" title="Link">Link</button>
          <button type="button" data-special="image" title="Image">Image</button>
          <button type="button" data-command="removeFormat" title="Clear formatting">Clear</button>
        </div>
        <div class="editor" part="content" contenteditable="${readonly ? 'false' : 'true'}" data-placeholder="${escapeAttr(this.getAttribute('placeholder') || 'Write rich content...')}">${this.value}</div>
        <div class="ai" part="ai">
          <input class="ai-prompt" type="text" placeholder="${endpoint ? 'Ask configured model to draft or rewrite...' : 'Set endpoint to enable AI generation'}" ${endpoint ? '' : 'disabled'} />
          <button type="button" class="ai-run" ${endpoint ? '' : 'disabled'}>${htmlEscape(this.getAttribute('ai-label') || 'Generate')}</button>
          <button type="button" class="ai-chat" ${endpoint ? '' : 'disabled'}>${htmlEscape(this.getAttribute('chat-label') || 'Chat')}</button>
        </div>
        <div class="chat" part="messages">${messages.map(message => `
          <div class="chat-row" data-role="${escapeAttr(message.role || 'assistant')}">
            <strong>${htmlEscape(message.role || 'assistant')}</strong>
            <span>${htmlEscape(message.content || message.text || '')}</span>
          </div>
        `).join('')}</div>
      </section>
    `;
    this.shadowRoot.querySelectorAll('[data-command]').forEach(button => {
      button.addEventListener('click', () => this.exec(button.dataset.command, button.dataset.value || null));
    });
    this.shadowRoot.querySelectorAll('[data-block]').forEach(button => {
      button.addEventListener('click', () => this.exec('formatBlock', button.dataset.block));
    });
    this.shadowRoot.querySelector('[data-special="link"]').addEventListener('click', () => this.promptLink('createLink'));
    this.shadowRoot.querySelector('[data-special="image"]').addEventListener('click', () => this.promptLink('insertImage'));
    this.shadowRoot.querySelector('.editor').addEventListener('input', () => this.capture());
    this.shadowRoot.querySelector('.ai-run').addEventListener('click', () => this.runAi(this.getAttribute('response-mode') || 'insert'));
    this.shadowRoot.querySelector('.ai-chat').addEventListener('click', () => this.runAi('chat'));
  }
}

export class MvxTransferList extends MvxPeerElement {
  move(value, direction) {
    const selected = String(value);
    const items = this.items.map(item => ({ ...item }));
    const item = items.find(item => String(item.value ?? optionLabel(item)) === selected);
    if (item) item.side = direction;
    this.items = items;
    this.emit('mvx-change', { items, moved: item, side: direction });
  }

  renderColumn(side, label) {
    return `
      <section class="col">
        <strong>${label}</strong>
        ${this.items.filter(item => (item.side || 'left') === side).map(item => {
          const value = String(item.value ?? optionLabel(item));
          return `<button type="button" data-value="${escapeAttr(value)}" data-side="${side}">${htmlEscape(optionLabel(item))}</button>`;
        }).join('')}
      </section>
    `;
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>${sharedStyles}.transfer{display:grid;grid-template-columns:1fr auto 1fr;gap:10px;align-items:center;}.col{display:grid;gap:6px;min-block-size:180px;padding:10px;border:1px solid var(--mvx-border);border-radius:var(--mvx-radius-md);background:var(--mvx-bg-panel);}.actions{display:grid;gap:6px;}button[data-side]{text-align:start;padding:7px 9px;}</style>
      <div class="transfer" part="transfer">${this.renderColumn('left', 'Available')}<div class="actions"><span class="subtle">Move</span></div>${this.renderColumn('right', 'Selected')}</div>
    `;
    this.shadowRoot.querySelectorAll('[data-side]').forEach(button => button.addEventListener('click', () => this.move(button.dataset.value, button.dataset.side === 'left' ? 'right' : 'left')));
  }
}

export class MvxBackdrop extends MvxPeerElement {
  render() {
    this.shadowRoot.innerHTML = `<style>${sharedStyles}:host{position:fixed;inset:0;z-index:40;display:${this.hasAttribute('open') ? 'grid' : 'none'};place-items:center;background:rgba(0,0,0,.55);backdrop-filter:blur(4px);}:host([inline]){position:relative;inset:auto;z-index:auto;min-block-size:120px;border-radius:var(--mvx-radius-md);background:color-mix(in srgb,var(--mvx-bg-inset) 82%,transparent);}.panel{padding:18px;}</style><section class="panel surface" part="panel"><slot>${htmlEscape(this.titleText('Loading'))}</slot></section>`;
  }
}

export class MvxFieldset extends MvxPeerElement {
  render() {
    this.shadowRoot.innerHTML = `<style>${sharedStyles}fieldset{display:grid;gap:10px;margin:0;border:1px solid var(--mvx-border);border-radius:var(--mvx-radius-md);padding:14px;}legend{color:var(--mvx-muted);font-size:13px;font-weight:800;padding:0 6px;}.helper{color:var(--mvx-subtle);font-size:12px;}</style><fieldset part="fieldset"><legend>${htmlEscape(this.titleText('Fieldset'))}</legend><slot></slot>${this.helperText() ? `<span class="helper">${htmlEscape(this.helperText())}</span>` : ''}</fieldset>`;
  }
}

export class MvxField extends MvxPeerElement {
  render() {
    this.shadowRoot.innerHTML = `<style>${sharedStyles}.field{display:grid;gap:7px;}.label{color:var(--mvx-muted);font-size:13px;font-weight:700;}.helper{color:var(--mvx-subtle);font-size:12px;}</style><label class="field" part="field"><span class="label">${htmlEscape(this.titleText('Field'))}</span><slot></slot>${this.helperText() ? `<span class="helper">${htmlEscape(this.helperText())}</span>` : ''}</label>`;
  }
}

export class MvxValidator extends MvxPeerElement {
  render() {
    const state = this.getAttribute('state') || 'neutral';
    const color = state === 'valid' ? 'var(--mvx-success)' : state === 'invalid' ? 'var(--mvx-danger)' : 'var(--mvx-border)';
    this.shadowRoot.innerHTML = `<style>${sharedStyles}.validator{display:grid;gap:6px;border-inline-start:3px solid ${color};padding-inline-start:10px;}.message{color:${color};font-size:12px;font-weight:700;}</style><div class="validator" part="validator"><slot></slot><span class="message">${htmlEscape(this.helperText() || this.titleText('Validation state'))}</span></div>`;
  }
}

export class MvxFloatingLabel extends MvxPeerElement {
  render() {
    this.shadowRoot.innerHTML = `<style>${sharedStyles}.float{position:relative;display:block;}.float ::slotted(input),.float ::slotted(textarea){padding-block-start:18px!important;}.label{position:absolute;inset-block-start:5px;inset-inline-start:12px;color:var(--mvx-subtle);font-size:11px;font-weight:750;pointer-events:none;}</style><label class="float" part="field"><slot></slot><span class="label">${htmlEscape(this.titleText('Label'))}</span></label>`;
  }
}

export class MvxFilter extends MvxToggleGroup {}

export class MvxAttachment extends MvxPeerElement {
  render() {
    this.shadowRoot.innerHTML = `<style>${sharedStyles}.attachment{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:10px;align-items:center;padding:10px;}.icon{display:grid;place-items:center;inline-size:32px;block-size:32px;border-radius:var(--mvx-radius-sm);background:var(--mvx-bg-inset);}.name{font-weight:750;}.meta{color:var(--mvx-subtle);font-size:12px;}</style><article class="attachment surface" part="attachment"><span class="icon">${htmlEscape(this.getAttribute('icon') || 'file')}</span><span><span class="name">${htmlEscape(this.titleText('Attachment'))}</span><br><span class="meta">${htmlEscape(this.getAttribute('meta') || this.helperText())}</span></span><slot name="action"></slot></article>`;
  }
}

export class MvxMessage extends MvxPeerElement {
  render() {
    const role = this.getAttribute('role') || this.getAttribute('author') || 'Assistant';
    this.shadowRoot.innerHTML = `<style>${sharedStyles}.message{display:grid;gap:6px;max-inline-size:680px;padding:12px;}.author{color:var(--mvx-accent-2);font-size:12px;font-weight:850;}.bubble{color:var(--mvx-muted);line-height:1.5;}</style><article class="message surface" part="message"><span class="author">${htmlEscape(role)}</span><div class="bubble"><slot>${htmlEscape(this.helperText() || this.textContent.trim())}</slot></div></article>`;
  }
}

export class MvxMessageScroller extends MvxPeerElement {
  render() {
    this.shadowRoot.innerHTML = `<style>${sharedStyles}.scroller{display:grid;gap:10px;max-block-size:${cssLength(this.getAttribute('height'), '320px')};overflow:auto;padding:10px;}</style><section class="scroller surface" part="scroller"><slot></slot></section>`;
  }
}

export class MvxMarker extends MvxPeerElement {
  render() {
    this.shadowRoot.innerHTML = `<style>${sharedStyles}:host{display:inline;}.marker{border-radius:var(--mvx-radius-xs);background:color-mix(in srgb,var(--mvx-warning) 28%,transparent);color:var(--mvx-fg);padding:0 3px;}</style><mark class="marker" part="marker"><slot>${htmlEscape(this.titleText('Marked'))}</slot></mark>`;
  }
}

export class MvxCloseButton extends MvxPeerElement {
  render() {
    this.shadowRoot.innerHTML = `<style>${sharedStyles}:host{display:inline-flex;}button{display:grid;place-items:center;inline-size:32px;block-size:32px;border-radius:999px;padding:0;}</style><button type="button" part="button" aria-label="${htmlEscape(this.titleText('Close'))}">x</button>`;
    this.shadowRoot.querySelector('button').addEventListener('click', () => this.emit('mvx-close', {}));
  }
}

export class MvxScrollspy extends MvxPeerElement {
  render() {
    this.shadowRoot.innerHTML = `<style>${sharedStyles}.spy{display:flex;flex-wrap:wrap;gap:6px;padding:6px;}.spy a{border-radius:var(--mvx-radius-sm);color:var(--mvx-muted);padding:7px 9px;text-decoration:none;}.spy a:hover{background:var(--mvx-bg-inset);color:var(--mvx-fg);}</style><nav class="spy surface" part="scrollspy">${this.items.map(item => `<a href="${escapeAttr(item.href || '#')}">${htmlEscape(optionLabel(item))}</a>`).join('')}</nav>`;
  }
}

export class MvxBubble extends MvxMessage {}
export class MvxChatBubble extends MvxMessage {}

export class MvxItem extends MvxPeerElement {
  render() {
    this.shadowRoot.innerHTML = `<style>${sharedStyles}.item{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:10px;align-items:center;min-block-size:44px;padding:9px;border-radius:var(--mvx-radius-sm);}.icon{color:var(--mvx-accent-2);}.copy{display:grid;gap:2px;}.title{font-weight:750;}.description{color:var(--mvx-subtle);font-size:12px;}</style><article class="item surface" part="item"><span class="icon"><slot name="media">${htmlEscape(this.getAttribute('icon') || '')}</slot></span><span class="copy"><span class="title"><slot>${htmlEscape(this.titleText('Item'))}</slot></span>${this.helperText() ? `<span class="description">${htmlEscape(this.helperText())}</span>` : ''}</span><slot name="actions"></slot></article>`;
  }
}

export class MvxSeparator extends MvxPeerElement {
  render() {
    const vertical = this.getAttribute('orientation') === 'vertical';
    this.shadowRoot.innerHTML = `<style>${sharedStyles}:host{display:${vertical ? 'inline-block' : 'block'};${vertical ? 'block-size:100%;min-block-size:40px;' : 'inline-size:100%;'}}.line{display:block;background:var(--mvx-border);${vertical ? 'inline-size:1px;block-size:100%;' : 'inline-size:100%;block-size:1px;'}}</style><span class="line" part="separator" role="separator" aria-orientation="${vertical ? 'vertical' : 'horizontal'}"></span>`;
  }
}

export class MvxNativeSelect extends MvxSelect {
  static observedAttributes = [...MvxSelect.observedAttributes, 'items'];

  get options() {
    return parseData(this._options ?? this.getAttribute('options') ?? this.getAttribute('items'), []);
  }

  set options(value) {
    this._options = value;
    if (this.isConnected) this.render();
  }

  set items(value) {
    this.options = value;
  }
}

export class MvxTable extends MvxDataTable {
  static observedAttributes = [...MvxDataTable.observedAttributes, 'items'];

  get rows() {
    return parseData(this._data ?? this.getAttribute('data') ?? this.getAttribute('items'), []);
  }

  set items(value) {
    this.data = value;
  }
}

export class MvxDialog extends MvxModal {}
export class MvxAlertDialog extends MvxModal {}
export class MvxSheet extends MvxDrawer {}
export class MvxOffcanvas extends MvxDrawer {}
export class MvxPlaceholder extends MvxSkeleton {}
export class MvxSonner extends MvxToast {}
