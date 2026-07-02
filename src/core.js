export const baseStyles = `
  :host {
    box-sizing: border-box;
    color-scheme: dark;
    color: var(--mvx-fg);
    direction: inherit;
    font-family: var(--mvx-font-sans);
    letter-spacing: 0;
    unicode-bidi: plaintext;
  }

  :host([dir="ltr"]) {
    direction: ltr;
  }

  :host([dir="rtl"]) {
    direction: rtl;
  }

  :host([theme="dark"]),
  :host([theme="graphite"]) {
    --mvx-bg: #111315;
    --mvx-bg-raised: #181a1d;
    --mvx-bg-panel: #202226;
    --mvx-bg-inset: #0d0f11;
    --mvx-fg: #f4f7fb;
    --mvx-muted: #b4bbc6;
    --mvx-subtle: #767f8d;
    --mvx-border: rgba(255, 255, 255, 0.14);
    --mvx-border-strong: rgba(255, 255, 255, 0.24);
    --mvx-accent: #3377ff;
    --mvx-accent-2: #70a0ff;
    --mvx-success: #3ad27a;
    --mvx-warning: #f4b740;
    --mvx-danger: #ff5f75;
    --mvx-info: #61d2ff;
  }

  :host([theme="light"]) {
    color-scheme: light;
    --mvx-bg: #f6f7f9;
    --mvx-bg-raised: #ffffff;
    --mvx-bg-panel: #fdfefe;
    --mvx-bg-inset: #eef1f5;
    --mvx-fg: #14171b;
    --mvx-muted: #4f5968;
    --mvx-subtle: #7a8493;
    --mvx-border: rgba(20, 23, 27, 0.14);
    --mvx-border-strong: rgba(20, 23, 27, 0.24);
    --mvx-accent: #1f66ff;
    --mvx-accent-2: #5c8dff;
    --mvx-success: #188f50;
    --mvx-warning: #a76a00;
    --mvx-danger: #cf2d43;
    --mvx-info: #087ea4;
    --mvx-shadow-raised: 0 14px 34px rgba(26, 34, 47, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.9);
    --mvx-shadow-soft: 0 10px 24px rgba(26, 34, 47, 0.10);
  }

  :host([theme="aurora"]) {
    --mvx-bg: #11161b;
    --mvx-bg-raised: #182024;
    --mvx-bg-panel: #202a2f;
    --mvx-bg-inset: #0e1215;
    --mvx-fg: #f5fbff;
    --mvx-muted: #bbcad0;
    --mvx-subtle: #81929a;
    --mvx-border: rgba(218, 255, 246, 0.15);
    --mvx-border-strong: rgba(218, 255, 246, 0.27);
    --mvx-accent: #2c8cff;
    --mvx-accent-2: #38d6b6;
    --mvx-success: #49dc92;
    --mvx-warning: #ffd166;
    --mvx-danger: #ff6686;
    --mvx-info: #8da2ff;
  }

  :host([theme="terminal"]) {
    --mvx-bg: #070808;
    --mvx-bg-raised: #101211;
    --mvx-bg-panel: #171a18;
    --mvx-bg-inset: #030404;
    --mvx-fg: #e8ffee;
    --mvx-muted: #aac9b5;
    --mvx-subtle: #6a8875;
    --mvx-border: rgba(184, 255, 200, 0.18);
    --mvx-border-strong: rgba(184, 255, 200, 0.32);
    --mvx-accent: #37e878;
    --mvx-accent-2: #9dffba;
    --mvx-success: #37e878;
    --mvx-warning: #e6d05c;
    --mvx-danger: #ff6078;
    --mvx-info: #61d2ff;
  }

  *, *::before, *::after {
    box-sizing: border-box;
  }

  button, input, textarea {
    font: inherit;
    letter-spacing: 0;
  }

  button {
    color: inherit;
  }

  :host([radius]) article,
  :host([radius]) button,
  :host([radius]) input,
  :host([radius]) textarea,
  :host([radius]) span[part="badge"],
  :host([radius]) .edge,
  :host([radius]) .alert,
  :host([radius]) .avatar,
  :host([radius]) .accordion,
  :host([radius]) .column,
  :host([radius]) .dot,
  :host([radius]) .menu,
  :host([radius]) .option,
  :host([radius]) .panel,
  :host([radius]) .skeleton span,
  :host([radius]) .swatch,
  :host([radius]) .tabs,
  :host([radius]) .task,
  :host([radius]) .thumb,
  :host([radius]) .tip,
  :host([radius]) .toast,
  :host([radius]) .track,
  :host([radius]) .wrap {
    border-radius: var(--mvx-radius-md) !important;
  }

  .edge {
    border: 1px solid var(--mvx-border);
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02)),
      var(--mvx-bg-panel);
    box-shadow: var(--mvx-shadow-raised);
  }

  .muted {
    color: var(--mvx-muted);
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
`;

export const toneMap = {
  info: 'var(--mvx-info)',
  success: 'var(--mvx-success)',
  warning: 'var(--mvx-warning)',
  danger: 'var(--mvx-danger)',
  accent: 'var(--mvx-accent)'
};

export const themeStorageKey = 'mivix-ui:theme';

export function readStoredTheme(storageKey = themeStorageKey) {
  try {
    return globalThis.localStorage?.getItem(storageKey) || '';
  } catch {
    return '';
  }
}

export function writeStoredTheme(theme, storageKey = themeStorageKey) {
  try {
    if (theme) {
      globalThis.localStorage?.setItem(storageKey, theme);
    } else {
      globalThis.localStorage?.removeItem(storageKey);
    }
  } catch {
    // Storage may be disabled; theme still applies for the current page.
  }
}

export function applyDocumentTheme(theme, options = {}) {
  if (!theme || typeof document === 'undefined') return '';
  document.documentElement.setAttribute('data-mvx-theme', theme);
  if (options.persist) writeStoredTheme(theme, options.storageKey);
  document.dispatchEvent(new CustomEvent('mvx-theme-change', {
    detail: { theme },
    bubbles: true,
    composed: true
  }));
  return theme;
}

export function restoreDocumentTheme(options = {}) {
  const theme = readStoredTheme(options.storageKey);
  return theme ? applyDocumentTheme(theme, options) : '';
}

export function define(name, component) {
  const registry = globalThis.customElements;
  if (!registry) return;
  if (!registry.get(name)) {
    registry.define(name, component);
  }
}

export function htmlEscape(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function parseData(value, fallback = []) {
  if (Array.isArray(value)) return value;
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

const HTMLElementBase = globalThis.HTMLElement || class {};

export class MvxElement extends HTMLElementBase {
  static globalAttributes = ['theme', 'radius', 'dir', 'lang', 'locale', 'i18n'];

  constructor() {
    super();
    this.attachShadow?.({ mode: 'open' });
  }

  connectedCallback() {
    this.setupGlobalObserver();
    this.applyGlobalAttributes();
    this.render();
  }

  disconnectedCallback() {
    this._globalObserver?.disconnect();
    this._globalObserver = null;
  }

  attributeChangedCallback() {
    if (this.isConnected) this.render();
  }

  setupGlobalObserver() {
    if (this._globalObserver || typeof MutationObserver === 'undefined') return;
    this._globalObserver = new MutationObserver(mutations => {
      this.applyGlobalAttributes();
      if (mutations.some(mutation => ['i18n', 'locale', 'lang', 'dir'].includes(mutation.attributeName))) {
        this.render();
      }
    });
    this._globalObserver.observe(this, {
      attributes: true,
      attributeFilter: MvxElement.globalAttributes
    });
  }

  applyGlobalAttributes() {
    const radius = this.getAttribute('radius');
    if (radius === null) {
      ['--mvx-radius-xs', '--mvx-radius-sm', '--mvx-radius-md', '--mvx-radius-lg'].forEach(token => this.style.removeProperty(token));
      return;
    }
    const value = this.normalizeRadius(radius);
    ['--mvx-radius-xs', '--mvx-radius-sm', '--mvx-radius-md', '--mvx-radius-lg'].forEach(token => this.style.setProperty(token, value));
  }

  normalizeRadius(value) {
    const trimmed = String(value).trim();
    if (!trimmed || trimmed === 'rounded') return 'var(--mvx-radius-md)';
    if (trimmed === 'square') return '0px';
    if (/^-?\d+(\.\d+)?$/.test(trimmed)) return `${Math.max(0, Number(trimmed))}px`;
    return trimmed;
  }

  get i18n() {
    return this._i18n ?? parseData(this.getAttribute('i18n'), {});
  }

  set i18n(value) {
    this._i18n = value && typeof value === 'object' ? value : parseData(value, {});
    if (this.isConnected) this.render();
  }

  t(key, fallback) {
    const dictionary = this.i18n;
    return dictionary && typeof dictionary === 'object' && key in dictionary ? dictionary[key] : fallback;
  }

  get locale() {
    return this.getAttribute('locale') || this.getAttribute('lang') || globalThis.document?.documentElement?.lang || undefined;
  }

  wirePointerMotion(target, options = {}) {
    if (!target || this.getAttribute('motion') === 'none') return;
    const isDisabled = () => options.disabled?.() || target.disabled || target.getAttribute('aria-disabled') === 'true';
    const update = event => {
      if (isDisabled()) return;
      const rect = target.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
      target.style.setProperty('--mx', `${x * 100}%`);
      target.style.setProperty('--my', `${y * 100}%`);
      target.style.setProperty('--tilt-x', `${(x - 0.5) * 7}deg`);
      target.style.setProperty('--tilt-y', `${(0.5 - y) * 5}deg`);
    };
    const reset = () => {
      target.style.removeProperty('--tilt-x');
      target.style.removeProperty('--tilt-y');
    };
    const press = event => {
      if (isDisabled()) return;
      update(event);
      target.style.setProperty('--press-x', target.style.getPropertyValue('--mx') || '50%');
      target.style.setProperty('--press-y', target.style.getPropertyValue('--my') || '50%');
      target.classList.remove('mvx-pressed');
      void target.offsetWidth;
      target.classList.add('mvx-pressed');
    };
    target.addEventListener('pointermove', update);
    target.addEventListener('pointerleave', reset);
    target.addEventListener('pointercancel', reset);
    target.addEventListener('pointerdown', press);
    target.addEventListener('animationend', event => {
      if (event.target === target) target.classList.remove('mvx-pressed');
    });
  }

  emit(name, detail = {}) {
    this.dispatchEvent(new CustomEvent(name, {
      detail,
      bubbles: true,
      composed: true
    }));
  }
}
