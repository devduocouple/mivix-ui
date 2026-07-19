export const baseStyles = `
  :host {
    box-sizing: border-box;
    color-scheme: var(--mvx-color-scheme, dark);
    color: var(--mvx-fg);
    direction: inherit;
    font-family: var(--mvx-font-sans);
    letter-spacing: 0;
    unicode-bidi: plaintext;
    --mvx-surface-glaze: linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02));
    --mvx-surface-backdrop: none;
    --mvx-control-glaze: linear-gradient(180deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.02));
    --mvx-control-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.16), 0 8px 18px rgba(0, 0, 0, 0.18);
    --mvx-disabled-fg: color-mix(in srgb, var(--mvx-muted) 82%, var(--mvx-fg) 18%);
    --mvx-disabled-bg: color-mix(in srgb, var(--mvx-bg-inset) 74%, var(--mvx-bg-panel));
    --mvx-disabled-border: color-mix(in srgb, var(--mvx-border) 82%, var(--mvx-muted) 18%);
    --mvx-disabled-shadow: inset 0 1px 0 color-mix(in srgb, var(--mvx-fg) 4%, transparent);
    --mvx-hover-lift: -1px;
    --mvx-touch-target: 44px;
    --mvx-container-max: 1440px;
    --mvx-container-wide: 1920px;
    --mvx-container-padding: clamp(12px, 2vw, 32px);
    --mvx-grid-gap: clamp(10px, 1.1vw, 22px);
    --mvx-grid-min-column: 220px;
    --mvx-stack-gap: clamp(8px, 0.8vw, 18px);
  }

  :host([font="system"]),
  :host([font="inter"]) {
    --mvx-font-sans: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  :host([font="mono"]),
  :host([font="monospace"]) {
    --mvx-font-sans: var(--mvx-font-mono);
  }

  :host([font="serif"]) {
    --mvx-font-sans: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
  }

  :host([font="rounded"]) {
    --mvx-font-sans: ui-rounded, "SF Pro Rounded", "Avenir Next Rounded", "Nunito Sans", Inter, ui-sans-serif, system-ui, sans-serif;
  }

  :host([font="humanist"]) {
    --mvx-font-sans: "Avenir Next", Avenir, "Segoe UI", Frutiger, Candara, Inter, ui-sans-serif, system-ui, sans-serif;
  }

  :host([font="geometric"]) {
    --mvx-font-sans: Montserrat, Avenir, "Century Gothic", Inter, ui-sans-serif, system-ui, sans-serif;
  }

  :host([font="devanagari"]) {
    --mvx-font-sans: "Noto Sans Devanagari", "Kohinoor Devanagari", "Mangal", Inter, ui-sans-serif, system-ui, sans-serif;
  }

  :host([dir="ltr"]) {
    direction: ltr;
  }

  :host([dir="rtl"]) {
    direction: rtl;
  }

  :host([theme="dark"]),
  :host([theme="graphite"]) {
    --mvx-color-scheme: dark;
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
    --mvx-color-scheme: light;
    color-scheme: var(--mvx-color-scheme);
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
    --mvx-color-scheme: dark;
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
    --mvx-color-scheme: dark;
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

  :host([component-style="minimal"]) {
    --mvx-radius-xs: 2px;
    --mvx-radius-sm: 3px;
    --mvx-radius-md: 4px;
    --mvx-radius-lg: 6px;
    --mvx-space-3: 10px;
    --mvx-space-4: 12px;
    --mvx-space-5: 14px;
    --mvx-space-6: 18px;
    --mvx-bg-panel: color-mix(in srgb, var(--mvx-bg) 92%, var(--mvx-fg) 4%);
    --mvx-bg-inset: color-mix(in srgb, var(--mvx-bg) 96%, var(--mvx-fg) 2%);
    --mvx-border: color-mix(in srgb, var(--mvx-fg) 10%, transparent);
    --mvx-border-strong: color-mix(in srgb, var(--mvx-fg) 18%, transparent);
    --mvx-shadow-raised: none;
    --mvx-shadow-soft: none;
    --mvx-surface-glaze: linear-gradient(180deg, transparent, transparent);
    --mvx-control-glaze: linear-gradient(180deg, transparent, transparent);
    --mvx-control-shadow: none;
    --mvx-duration-fast: 80ms;
    --mvx-duration: 120ms;
    --mvx-hover-lift: 0px;
  }

  :host([component-style="glass"]) {
    --mvx-radius-xs: 8px;
    --mvx-radius-sm: 12px;
    --mvx-radius-md: 16px;
    --mvx-radius-lg: 22px;
    --mvx-space-3: 14px;
    --mvx-space-4: 18px;
    --mvx-space-5: 24px;
    --mvx-space-6: 30px;
    --mvx-bg-panel: color-mix(in srgb, var(--mvx-bg) 68%, transparent);
    --mvx-bg-inset: color-mix(in srgb, var(--mvx-bg) 54%, transparent);
    --mvx-border: color-mix(in srgb, var(--mvx-accent-2) 28%, rgba(255, 255, 255, 0.16));
    --mvx-border-strong: color-mix(in srgb, var(--mvx-accent-2) 42%, rgba(255, 255, 255, 0.24));
    --mvx-shadow-raised: 0 22px 54px rgba(0, 0, 0, 0.38), inset 0 1px 0 rgba(255, 255, 255, 0.2);
    --mvx-shadow-soft: 0 16px 34px rgba(0, 0, 0, 0.24);
    --mvx-surface-glaze:
      radial-gradient(circle at var(--mx, 50%) var(--my, 50%), color-mix(in srgb, var(--mvx-accent-2) 16%, transparent), transparent 36%),
      linear-gradient(145deg, rgba(255, 255, 255, 0.18), rgba(255, 255, 255, 0.04));
    --mvx-surface-backdrop: blur(16px) saturate(1.24);
    --mvx-control-glaze:
      radial-gradient(circle at var(--mx, 50%) var(--my, 50%), color-mix(in srgb, var(--mvx-accent-2) 18%, transparent), transparent 42%),
      linear-gradient(180deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.04));
    --mvx-control-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.22), 0 12px 26px rgba(0, 0, 0, 0.24);
    --mvx-duration-fast: 160ms;
    --mvx-duration: 260ms;
    --mvx-hover-lift: -2px;
  }

  :host([component-style="dashboard"]) {
    --mvx-radius-xs: 3px;
    --mvx-radius-sm: 4px;
    --mvx-radius-md: 6px;
    --mvx-radius-lg: 8px;
    --mvx-space-3: 10px;
    --mvx-space-4: 14px;
    --mvx-space-5: 16px;
    --mvx-space-6: 20px;
    --mvx-bg-panel: color-mix(in srgb, var(--mvx-bg) 84%, var(--mvx-fg) 6%);
    --mvx-bg-inset: color-mix(in srgb, var(--mvx-bg) 92%, var(--mvx-fg) 4%);
    --mvx-border: color-mix(in srgb, var(--mvx-fg) 14%, transparent);
    --mvx-border-strong: color-mix(in srgb, var(--mvx-accent) 34%, var(--mvx-border));
    --mvx-shadow-raised: 0 8px 20px rgba(0, 0, 0, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.1);
    --mvx-shadow-soft: 0 6px 16px rgba(0, 0, 0, 0.2);
    --mvx-surface-glaze: linear-gradient(180deg, rgba(255, 255, 255, 0.055), rgba(255, 255, 255, 0.01));
    --mvx-control-glaze: linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.015));
    --mvx-control-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.12), 0 4px 10px rgba(0, 0, 0, 0.18);
    --mvx-duration-fast: 95ms;
    --mvx-duration: 150ms;
    --mvx-hover-lift: -1px;
  }

  :host-context([data-mvx-variant="material"]) {
    --mvx-radius-xs: 4px;
    --mvx-radius-sm: 8px;
    --mvx-radius-md: 12px;
    --mvx-radius-lg: 16px;
    --mvx-radius-xl: 28px;
    --mvx-radius-full: 9999px;
    --mvx-space-3: 12px;
    --mvx-space-4: 16px;
    --mvx-space-5: 24px;
    --mvx-space-6: 32px;
    --mvx-surface-glaze: linear-gradient(180deg, transparent, transparent);
    --mvx-surface-backdrop: none;
    --mvx-control-glaze: linear-gradient(180deg, transparent, transparent);
    --mvx-control-shadow: none;
    --mvx-button-radius: var(--mvx-radius-full);
    --mvx-button-shadow: none;
    --mvx-hover-lift: 0px;
    --mvx-duration-fast: 100ms;
    --mvx-duration: 200ms;
    --mvx-motion-duration-short: 100ms;
    --mvx-motion-duration-medium: 200ms;
    --mvx-motion-duration-long: 300ms;
    --mvx-motion-easing-standard: cubic-bezier(0.2, 0, 0, 1);
    --mvx-motion-easing-emphasized: cubic-bezier(0.2, 0, 0, 1);
    --mvx-shadow-raised: 0 12px 24px rgba(0, 0, 0, 0.24);
    --mvx-shadow-soft: 0 3px 8px rgba(0, 0, 0, 0.16);
    --mvx-state-layer-hover: color-mix(in srgb, var(--mvx-accent) 8%, transparent);
    --mvx-state-layer-pressed: color-mix(in srgb, var(--mvx-accent) 12%, transparent);
    --mvx-material-field-radius: 4px 4px 0 0;
    --mvx-material-field-bg: color-mix(in srgb, var(--mvx-fg) 7%, var(--mvx-bg-panel));
  }

  :host-context([data-mvx-variant="material"]) *,
  :host-context([data-mvx-variant="material"]) *::before,
  :host-context([data-mvx-variant="material"]) *::after {
    transition-timing-function: var(--mvx-motion-easing-standard) !important;
    animation-timing-function: var(--mvx-motion-easing-standard) !important;
  }

  :host-context([data-mvx-variant="material"]) .edge {
    background: var(--mvx-bg-panel);
    box-shadow: var(--mvx-shadow-soft);
  }

  :host-context([data-mvx-variant="material"]) button:not([role="checkbox"]),
  :host-context([data-mvx-variant="material"]) .option {
    border-radius: var(--mvx-button-radius) !important;
  }

  :host-context([data-mvx-variant="material"]) input,
  :host-context([data-mvx-variant="material"]) select,
  :host-context([data-mvx-variant="material"]) textarea {
    border-radius: var(--mvx-material-field-radius) !important;
    background: var(--mvx-material-field-bg);
    box-shadow: none;
  }

  :host-context([data-mvx-variant="material"]) button:hover:not(:disabled),
  :host-context([data-mvx-variant="material"]) [role="button"]:hover:not([aria-disabled="true"]),
  :host-context([data-mvx-variant="material"]) .option:hover,
  :host-context([data-mvx-variant="material"]) .task:hover {
    transform: none !important;
  }

  *, *::before, *::after {
    box-sizing: border-box;
  }

  button, input, select, textarea {
    font: inherit;
    letter-spacing: 0;
  }

  input, select, textarea {
    color-scheme: var(--mvx-color-scheme, dark);
    accent-color: var(--mvx-accent);
  }

  input::-webkit-search-cancel-button {
    cursor: pointer;
    opacity: 0.72;
  }

  input:hover::-webkit-search-cancel-button,
  input:focus::-webkit-search-cancel-button {
    opacity: 0.92;
  }

  button {
    color: inherit;
  }

  :host([disabled]) {
    cursor: not-allowed;
  }

  button:disabled,
  input:disabled,
  select:disabled,
  textarea:disabled,
  [aria-disabled="true"] {
    cursor: not-allowed;
    color: var(--mvx-disabled-fg);
    filter: saturate(0.88);
  }

  input:disabled,
  select:disabled,
  textarea:disabled {
    border-color: var(--mvx-disabled-border);
    background: var(--mvx-disabled-bg);
    box-shadow: var(--mvx-disabled-shadow);
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
      var(--mvx-surface-glaze),
      var(--mvx-bg-panel);
    box-shadow: var(--mvx-shadow-raised);
    backdrop-filter: var(--mvx-surface-backdrop);
    -webkit-backdrop-filter: var(--mvx-surface-backdrop);
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
export const variantStorageKey = 'mivix-ui:variant';
export const supportedVariants = ['mivix', 'material'];

export const fontStacks = {
  system: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  inter: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  mono: 'var(--mvx-font-mono)',
  monospace: 'var(--mvx-font-mono)',
  serif: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
  rounded: 'ui-rounded, "SF Pro Rounded", "Avenir Next Rounded", "Nunito Sans", Inter, ui-sans-serif, system-ui, sans-serif',
  humanist: '"Avenir Next", Avenir, "Segoe UI", Frutiger, Candara, Inter, ui-sans-serif, system-ui, sans-serif',
  geometric: 'Montserrat, Avenir, "Century Gothic", Inter, ui-sans-serif, system-ui, sans-serif',
  devanagari: '"Noto Sans Devanagari", "Kohinoor Devanagari", "Mangal", Inter, ui-sans-serif, system-ui, sans-serif'
};

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

export function readStoredVariant(storageKey = variantStorageKey) {
  try {
    return globalThis.localStorage?.getItem(storageKey) || '';
  } catch {
    return '';
  }
}

export function normalizeVariant(variant) {
  const normalized = String(variant || '').trim();
  if (!normalized || normalized === 'default' || normalized === 'mivix') return 'mivix';
  return supportedVariants.includes(normalized) ? normalized : 'mivix';
}

export function writeStoredVariant(variant, storageKey = variantStorageKey) {
  const normalized = normalizeVariant(variant);
  try {
    if (normalized !== 'mivix') {
      globalThis.localStorage?.setItem(storageKey, normalized);
    } else {
      globalThis.localStorage?.removeItem(storageKey);
    }
  } catch {
    // Storage may be disabled; variant still applies for the current page.
  }
}

export function applyDocumentVariant(variant, options = {}) {
  if (!variant || typeof document === 'undefined') return '';
  const normalized = normalizeVariant(variant);
  if (normalized === 'mivix') {
    document.documentElement.removeAttribute('data-mvx-variant');
  } else {
    document.documentElement.setAttribute('data-mvx-variant', normalized);
  }
  if (options.persist) writeStoredVariant(normalized, options.storageKey);
  document.dispatchEvent(new CustomEvent('mvx-variant-change', {
    detail: { variant: normalized },
    bubbles: true,
    composed: true
  }));
  return normalized;
}

export function restoreDocumentVariant(options = {}) {
  const variant = readStoredVariant(options.storageKey);
  if (!variant) return '';
  const normalized = normalizeVariant(variant);
  if (normalized !== variant || normalized === 'mivix') writeStoredVariant('', options.storageKey);
  return applyDocumentVariant(normalized, options);
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

export function isSafeUrl(value, options = {}) {
  const raw = String(value ?? '').trim().replace(/[\u0000-\u001F\u007F\s]+/g, '');
  if (!raw) return false;
  if (raw.startsWith('#') || raw.startsWith('/') || raw.startsWith('./') || raw.startsWith('../')) return true;
  try {
    const parsed = new URL(raw, globalThis.location?.href || 'https://mivix.local/');
    if (options.allowDataImages && parsed.protocol === 'data:') {
      return /^data:image\/(?:avif|gif|jpeg|jpg|png|svg\+xml|webp);/i.test(raw);
    }
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

export function safeUrl(value, fallback = '#', options = {}) {
  const raw = String(value ?? '').trim();
  return isSafeUrl(raw, options) ? raw : fallback;
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
  static globalAttributes = ['theme', 'component-style', 'variant', 'font', 'font-family', 'radius', 'dir', 'lang', 'locale', 'i18n', 'skeleton', 'skeleton-lines'];

  constructor() {
    super();
    this.attachShadow?.({ mode: 'open' });
  }

  connectedCallback() {
    this.setupGlobalObserver();
    this.applyGlobalAttributes();
    this.renderCurrentState();
  }

  disconnectedCallback() {
    this._globalObserver?.disconnect();
    this._globalObserver = null;
    this.disconnectSkeletonResizeObserver();
    this.clearSkeletonMeasureFallback();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'skeleton' && oldValue !== newValue && this.isConnected) {
      if (newValue !== null && !this._mvxLastMeasuredBox) {
        this._mvxLastMeasuredBox = this.captureSkeletonBox({ force: true, preferChildSize: true });
      }
      if (newValue !== null) {
        this._mvxSkeletonHostBox = this.captureHostBox();
      } else {
        this._mvxSkeletonHostBox = undefined;
      }
    }
    if (this.isConnected) this.renderCurrentState();
  }

  setupGlobalObserver() {
    if (this._globalObserver || typeof MutationObserver === 'undefined') return;
    this._globalObserver = new MutationObserver(mutations => {
      this.applyGlobalAttributes();
      if (mutations.some(mutation => ['i18n', 'locale', 'lang', 'dir', 'skeleton', 'skeleton-lines'].includes(mutation.attributeName))) {
        this.renderCurrentState();
      }
    });
    this._globalObserver.observe(this, {
      attributes: true,
      attributeFilter: MvxElement.globalAttributes
    });
  }

  applyGlobalAttributes() {
    const font = this.getAttribute('font') ?? this.getAttribute('font-family');
    if (font === null) {
      this.style.removeProperty('--mvx-font-sans');
    } else {
      this.style.setProperty('--mvx-font-sans', this.normalizeFont(font));
    }

    const variant = this.getAttribute('variant');
    if (variant === null || variant === '' || variant === 'mivix' || variant === 'default') {
      this.removeAttribute('data-mvx-variant');
    } else {
      this.setAttribute('data-mvx-variant', variant);
    }

    const radius = this.getAttribute('radius');
    if (radius === null) {
      ['--mvx-radius-xs', '--mvx-radius-sm', '--mvx-radius-md', '--mvx-radius-lg'].forEach(token => this.style.removeProperty(token));
      return;
    }
    const value = this.normalizeRadius(radius);
    ['--mvx-radius-xs', '--mvx-radius-sm', '--mvx-radius-md', '--mvx-radius-lg'].forEach(token => this.style.setProperty(token, value));
  }

  renderCurrentState() {
    if (this.hasAttribute('skeleton')) {
      this._mvxSkeletonBox = undefined;
      this._mvxSkeletonHostBox = this.captureHostBox();
      this._mvxSkeletonMeasureAttempts = 0;
      this.ensureSkeletonResizeObserver();
      this.measureSkeletonBoxFromComponent();
      this.renderSkeleton();
      this.scheduleSkeletonMeasureFallback();
      return;
    }
    if (this._mvxSkeletonBusy) {
      this.removeAttribute('aria-busy');
      this._mvxSkeletonBusy = false;
    }
    this.disconnectSkeletonResizeObserver();
    this.clearSkeletonMeasureFallback();
    this.render();
    const measured = this.captureSkeletonBox({ force: true });
    if (measured) {
      this._mvxLastMeasuredBox = measured;
    }
  }

  ensureSkeletonResizeObserver() {
    if (typeof ResizeObserver === 'undefined' || this._mvxSkeletonResizeObserver) return;
    this._mvxSkeletonResizeObserver = new ResizeObserver(() => {
      if (!this.hasAttribute('skeleton') || !this.isConnected) return;
      const measured = this.captureSkeletonBox({ force: true });
      if (measured?.width || measured?.height) {
        this.renderSkeleton();
      }
    });
    this._mvxSkeletonResizeObserver.observe(this);
  }

  disconnectSkeletonResizeObserver() {
    if (!this._mvxSkeletonResizeObserver) return;
    this._mvxSkeletonResizeObserver.disconnect();
    this._mvxSkeletonResizeObserver = null;
  }

  measureSkeletonBoxFromComponent() {
    this._mvxSkeletonHostBox = this.captureHostBox();
    if (typeof this.render !== 'function') {
      this.captureSkeletonBox();
      return;
    }
    const previousMeasured = this._mvxLastMeasuredBox;
    const profile = this.skeletonProfile();
    const explicitHostWidth = this.hasAttribute('width') || Boolean(this.style.width);
    const explicitHostHeight = this.hasAttribute('height') || this.hasAttribute('chart-height') || Boolean(this.style.height);
    const preferChildSize = profile.hostDisplay?.startsWith('inline') && !explicitHostWidth && !explicitHostHeight;
    const previousBusy = this._mvxSkeletonBusy;
    const previousVisibility = this.style.visibility;
    const previousPointerEvents = this.style.pointerEvents;
    this._mvxSkeletonBusy = false;
    this.style.visibility = 'hidden';
    this.style.pointerEvents = 'none';
    try {
      this.render();
      this.captureSkeletonBox({ force: true, preferChildSize });
    } catch {
      this.captureSkeletonBox({ force: true, preferChildSize });
    } finally {
      this.style.visibility = previousVisibility;
      this.style.pointerEvents = previousPointerEvents;
      this._mvxSkeletonBusy = previousBusy;
    }
    if (previousMeasured) {
      const fallbackBox = {
        width: this._mvxSkeletonBox?.width || previousMeasured.width,
        height: this._mvxSkeletonBox?.height || previousMeasured.height,
        display: previousMeasured.display || this._mvxSkeletonBox?.display
      };
      if (fallbackBox.width || fallbackBox.height) {
        this._mvxSkeletonBox = fallbackBox;
      }
    }
  }

  scheduleSkeletonMeasureFallback() {
    if (typeof requestAnimationFrame !== 'function') return;
    if (!this.hasAttribute('skeleton') || !this.isConnected) return;
    if (this._mvxSkeletonBox?.width && this._mvxSkeletonBox?.height) return;
    if (this._mvxSkeletonMeasureAttempts >= 10) return;
    if (this._mvxSkeletonMeasureFrame) return;
    this._mvxSkeletonMeasureAttempts += 1;
    this._mvxSkeletonMeasureFrame = requestAnimationFrame(() => {
      this._mvxSkeletonMeasureFrame = 0;
      if (!this.hasAttribute('skeleton') || !this.isConnected) return;
      this.measureSkeletonBoxFromComponent();
      this.renderSkeleton();
      this.scheduleSkeletonMeasureFallback();
    });
  }

  clearSkeletonMeasureFallback() {
    if (this._mvxSkeletonMeasureFrame) {
      cancelAnimationFrame(this._mvxSkeletonMeasureFrame);
      this._mvxSkeletonMeasureFrame = 0;
    }
    this._mvxSkeletonMeasureAttempts = 0;
  }

  applySkeletonHostLock() {
    if (!this._mvxSkeletonBox || !this._mvxSkeletonHostBox) return;
    if (!this._mvxSkeletonHostBox.width && !this._mvxSkeletonHostBox.height) {
      return;
    }
    if (this._mvxSkeletonHostBox.width) {
      this._mvxSkeletonBox.width = Math.min(this._mvxSkeletonBox.width, this._mvxSkeletonHostBox.width);
    }
    if (this._mvxSkeletonHostBox.height) {
      this._mvxSkeletonBox.height = Math.min(this._mvxSkeletonBox.height, this._mvxSkeletonHostBox.height);
    }
  }

  captureSkeletonBox({ force = false, preferChildSize = false } = {}) {
    if (!force && this._mvxSkeletonBusy) return;
    if (typeof this.getBoundingClientRect !== 'function') return;
    const rect = this.getBoundingClientRect();
    const computed = globalThis.getComputedStyle?.(this);
    const hostBox = this._mvxSkeletonHostBox || this.captureHostBox();
    const rectWidth = rect.width || 0;
    const rectHeight = rect.height || 0;
    const parsedComputedWidth = computed?.width && /^\d+(\.\d+)?px$/i.test(computed.width.trim())
      ? Number.parseFloat(computed.width)
      : 0;
    const parsedComputedHeight = computed?.height && /^\d+(\.\d+)?px$/i.test(computed.height.trim())
      ? Number.parseFloat(computed.height)
      : 0;
    const widthCandidates = [
      rectWidth,
      this.offsetWidth || 0,
      this.clientWidth || 0,
      this.scrollWidth || 0,
      parsedComputedWidth
    ];
    const heightCandidates = [
      rectHeight,
      this.offsetHeight || 0,
      this.clientHeight || 0,
      this.scrollHeight || 0,
      parsedComputedHeight
    ];
    if (hostBox?.width) widthCandidates.push(hostBox.width);
    if (hostBox?.height) heightCandidates.push(hostBox.height);
    if (preferChildSize) {
      const measuredNodes = [];
      const addNodeRect = node => {
        if (!node || !(node instanceof Element)) return;
        const rect = node.getBoundingClientRect();
        if (!rect) return;
        const width = Math.max(0, Math.round(rect.width || node.offsetWidth || node.scrollWidth || 0));
        const height = Math.max(0, Math.round(rect.height || node.offsetHeight || node.scrollHeight || 0));
        if (width) widthCandidates.unshift(width);
        if (height) heightCandidates.unshift(height);
        measuredNodes.push({ width, height, left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom });
      };
      const primaryChild = this.shadowRoot?.children
        ? Array.from(this.shadowRoot.children).find(node => node.tagName && node.tagName.toLowerCase() !== 'style')
        : null;
      if (primaryChild && !this.hasAttribute('width') && !this.hasAttribute('height') && !this.hasAttribute('chart-height')) {
        addNodeRect(primaryChild);
      }
      const slotNodes = this.shadowRoot
        ? Array.from(this.shadowRoot.querySelectorAll('slot')).flatMap(slot => {
          if (!slot.assignedElements) return [];
          return slot.assignedElements({ flatten: true });
        })
        : [];
      slotNodes.forEach(addNodeRect);
      if (!slotNodes.length) {
        Array.from(this.children || []).forEach(addNodeRect);
      }
      if (measuredNodes.length > 1) {
        const left = measuredNodes.reduce((value, node) => Math.min(value, node.left), Number.POSITIVE_INFINITY);
        const right = measuredNodes.reduce((value, node) => Math.max(value, node.right), Number.NEGATIVE_INFINITY);
        const top = measuredNodes.reduce((value, node) => Math.min(value, node.top), Number.POSITIVE_INFINITY);
        const bottom = measuredNodes.reduce((value, node) => Math.max(value, node.bottom), Number.NEGATIVE_INFINITY);
        const unionWidth = Math.round(Math.max(0, right - left));
        const unionHeight = Math.round(Math.max(0, bottom - top));
        if (unionWidth) widthCandidates.unshift(unionWidth);
        if (unionHeight) heightCandidates.unshift(unionHeight);
      }
    }
    const width = widthCandidates.find(value => value > 0);
    const height = heightCandidates.find(value => value > 0);
    const fallbackWidth = width || hostBox?.width || this._mvxLastMeasuredBox?.width || 0;
    const fallbackHeight = height || hostBox?.height || this._mvxLastMeasuredBox?.height || 0;
    const box = {};
    if (fallbackWidth > 0) box.width = Math.round(fallbackWidth);
    if (fallbackHeight > 0) box.height = Math.round(fallbackHeight);
    if (computed?.display && computed.display !== 'none' && computed.display !== 'contents') box.display = computed.display;
    if (box.width || box.height) {
      this._mvxSkeletonBox = box;
      this.applySkeletonHostLock();
      return box;
    }
  }

  renderSkeleton() {
    const explicitLines = this.getAttribute('skeleton-lines') || this.getAttribute('lines');
    const label = this.getAttribute('aria-label') || this.getAttribute('label') || this.t('loading', 'Loading');
    const profile = this.skeletonProfile();
    const lines = Math.max(1, Number(explicitLines || profile.lines || 3));
    const box = this._mvxSkeletonBox || this._mvxLastMeasuredBox || {};
    const hostBox = this._mvxSkeletonBox || this.captureHostBox() || this._mvxSkeletonHostBox || this._mvxLastMeasuredBox || {};
    const resolvedHostWidth = hostBox.width || box.width;
    const resolvedHostHeight = hostBox.height || box.height;
    const hostInlineSize = resolvedHostWidth ? `${resolvedHostWidth}px` : profile.hostInlineSize;
    const hostBlockSize = resolvedHostHeight ? `${resolvedHostHeight}px` : profile.hostBlockSize;
    const fallbackHostInline = resolvedHostWidth ? `${resolvedHostWidth}px` : '';
    const fallbackHostBlock = resolvedHostHeight ? `${resolvedHostHeight}px` : '';
    const skeletonInlineSize = box.width
      ? '100%'
      : profile.hostDisplay?.startsWith('inline')
        ? 'auto'
        : profile.inlineSize;
    const skeletonBlockSize = box.height ? '100%' : profile.blockSize;
    const skeletonMinBlockSize = box.height ? `${box.height}px` : profile.minBlockSize;
    this.setAttribute('aria-busy', 'true');
    this._mvxSkeletonBusy = true;
    this.shadowRoot.innerHTML = `
      <style>
        ${baseStyles}
        :host {
          display: ${box.display || profile.hostDisplay};
          ${fallbackHostInline ? `width: ${fallbackHostInline};` : ''}
          ${fallbackHostInline ? `inline-size: ${fallbackHostInline};` : ''}
          ${fallbackHostBlock ? `height: ${fallbackHostBlock};` : ''}
          ${fallbackHostBlock ? `block-size: ${fallbackHostBlock};` : ''}
          min-inline-size: 0;
          min-block-size: 0;
          ${hostInlineSize ? `inline-size: ${hostInlineSize};` : ''}
          ${hostBlockSize ? `block-size: ${hostBlockSize};` : ''}
          ${hostInlineSize ? `max-inline-size: ${hostInlineSize};` : ''}
          ${hostBlockSize ? `max-block-size: ${hostBlockSize};` : ''}
        }
        .skeleton {
          display: grid;
          align-content: ${profile.alignContent};
          gap: ${profile.gap};
          inline-size: ${skeletonInlineSize};
          block-size: ${skeletonBlockSize};
          min-block-size: ${skeletonMinBlockSize};
          padding: ${profile.padding};
          border-radius: ${profile.radius};
          background: ${profile.background};
          border: ${profile.border};
          overflow: hidden;
        }
        .line {
          display: block;
          block-size: ${profile.lineBlockSize};
          inline-size: 100%;
          border-radius: ${profile.lineRadius};
          background: linear-gradient(90deg, var(--mvx-bg-inset), color-mix(in srgb, var(--mvx-border) 56%, var(--mvx-bg-panel)), var(--mvx-bg-inset));
          background-size: 220% 100%;
          animation: mvx-skeleton-pulse 1.4s ease-in-out infinite;
        }
        .line:first-child {
          block-size: ${profile.firstLineBlockSize || profile.lineBlockSize};
        }
        .line:last-child {
          block-size: ${profile.lastLineBlockSize || profile.lineBlockSize};
        }
        .line:nth-child(2n) { inline-size: ${profile.evenInlineSize}; }
        .line:last-child { inline-size: ${profile.lastInlineSize}; }
        .line:first-child:nth-last-child(1) {
          inline-size: 100%;
        }
        .shape {
          block-size: ${profile.shapeBlockSize};
          border-radius: ${profile.shapeRadius};
        }
        @keyframes mvx-skeleton-pulse {
          0% { background-position: 100% 0; }
          100% { background-position: -100% 0; }
        }
        @media (prefers-reduced-motion: reduce) {
          .line { animation: none; }
        }
      </style>
      <div class="skeleton" part="skeleton" aria-hidden="true">
        ${Array.from({ length: profile.singleShape ? 1 : lines }, (_, index) => `<span class="line${index === 0 && profile.firstShape ? ' shape' : ''}"></span>`).join('')}
      </div>
      <span class="sr-only">${htmlEscape(label)}</span>
    `;
  }

  captureHostBox() {
    if (typeof this.getBoundingClientRect !== 'function') return;
    const rect = this.getBoundingClientRect();
    const hostBox = {};
    if (rect.width > 0) hostBox.width = Math.round(rect.width);
    if (rect.height > 0) hostBox.height = Math.round(rect.height);
    return hostBox;
  }

  skeletonLength(value) {
    const raw = String(value ?? '').trim();
    if (!raw) return '';
    if (['auto', 'inherit', 'initial', 'unset'].includes(raw)) return '';
    if (/^-?\d+(\.\d+)?$/.test(raw)) return `${Math.max(0, Number(raw))}px`;
    return raw;
  }

  skeletonProfile() {
    const explicit = String(this.getAttribute('skeleton') || '').trim();
    const inferred = !explicit || explicit === 'true' ? this.inferSkeletonVariant() : explicit;
    const size = this.getAttribute('size') || '';
    const explicitWidth = this.skeletonLength(this.getAttribute('width') || this.style?.width);
    const explicitHeight = this.skeletonLength(this.getAttribute('height') || this.getAttribute('chart-height') || this.style?.height);
    const textLength = Math.max(4, (this.textContent || this.getAttribute('label') || this.getAttribute('title') || '').trim().length);
    const textWidth = `${Math.min(240, Math.max(72, textLength * 8 + 28))}px`;
    const buttonHeight = size === 'sm' ? '30px' : size === 'lg' ? '44px' : '36px';
    const maskSize = this.skeletonLength(this.getAttribute('width')) || this.skeletonLength(this.getAttribute('height')) || '96px';
    const avatarSize = this.skeletonLength(size) || 'var(--mvx-skeleton-size, 40px)';
    const toggleGroupItems = parseData(this.getAttribute('items'), []);
    const toggleGroupLabelLength = Math.max(
      20,
      ...(Array.isArray(toggleGroupItems) ? toggleGroupItems.map(item => {
        const label = item?.label ?? item?.value ?? item?.name ?? '';
        return String(label).trim().length * 8;
      }) : [20])
    );
    const toggleGroupWidthHint = `${Math.min(360, Math.max(120, 16 + toggleGroupLabelLength + (toggleGroupItems.length * 14))) }px`;
    const profiles = {
      text: { hostDisplay: 'block', hostInlineSize: explicitWidth, hostBlockSize: explicitHeight, inlineSize: '100%', blockSize: explicitHeight ? '100%' : 'auto', minBlockSize: 'auto', padding: '2px 0', gap: '9px', radius: 'var(--mvx-radius-md)', background: 'transparent', border: '0', lineBlockSize: '12px', lineRadius: '999px', shapeBlockSize: '12px', shapeRadius: '999px', evenInlineSize: '86%', lastInlineSize: '68%', alignContent: 'start', lines: 3 },
      button: { hostDisplay: 'inline-flex', hostInlineSize: explicitWidth || textWidth, hostBlockSize: explicitHeight || buttonHeight, inlineSize: '100%', blockSize: '100%', minBlockSize: explicitHeight || buttonHeight, padding: '0', gap: '0', radius: 'var(--mvx-button-radius, var(--mvx-radius-sm))', background: 'transparent', border: '0', lineBlockSize: '100%', lineRadius: 'var(--mvx-button-radius, var(--mvx-radius-sm))', shapeBlockSize: '100%', shapeRadius: 'var(--mvx-button-radius, var(--mvx-radius-sm))', evenInlineSize: '100%', lastInlineSize: '100%', alignContent: 'stretch', lines: 1, singleShape: true },
      swap: { hostDisplay: 'inline-flex', hostInlineSize: explicitWidth || '72px', hostBlockSize: explicitHeight || '36px', inlineSize: '100%', blockSize: '100%', minBlockSize: explicitHeight || '36px', padding: '0', gap: '0', radius: 'var(--mvx-button-radius, var(--mvx-radius-sm))', background: 'transparent', border: '0', lineBlockSize: '100%', lineRadius: 'var(--mvx-button-radius, var(--mvx-radius-sm))', shapeBlockSize: '100%', shapeRadius: 'var(--mvx-button-radius, var(--mvx-radius-sm))', evenInlineSize: '100%', lastInlineSize: '100%', alignContent: 'stretch', lines: 1, singleShape: true },
      toast: { hostDisplay: 'block', hostInlineSize: explicitWidth || (this.hasAttribute('inline') ? '100%' : 'min(380px, calc(100vw - 40px))'), hostBlockSize: explicitHeight || 'auto', inlineSize: '100%', blockSize: explicitHeight ? '100%' : 'auto', minBlockSize: explicitHeight || '44px', padding: '0', gap: '0', radius: 'var(--mvx-radius-md)', background: 'transparent', border: '0', lineBlockSize: explicitHeight || '44px', lineRadius: 'var(--mvx-radius-md)', shapeBlockSize: explicitHeight || '44px', shapeRadius: 'var(--mvx-radius-md)', evenInlineSize: '100%', lastInlineSize: '100%', alignContent: 'start', lines: 1, singleShape: true },
      'toggle-group': { hostDisplay: 'inline-flex', hostInlineSize: explicitWidth || toggleGroupWidthHint, hostBlockSize: explicitHeight || '34px', inlineSize: '100%', blockSize: '100%', minBlockSize: explicitHeight || '34px', padding: '0', gap: '0', radius: 'var(--mvx-radius-sm)', background: 'transparent', border: '0', lineBlockSize: '100%', lineRadius: 'var(--mvx-radius-sm)', shapeBlockSize: '100%', shapeRadius: 'var(--mvx-radius-sm)', evenInlineSize: '100%', lastInlineSize: '100%', alignContent: 'stretch', lines: 1, singleShape: true },
      mask: { hostDisplay: 'inline-flex', hostInlineSize: explicitWidth || maskSize, hostBlockSize: explicitHeight || maskSize, inlineSize: '100%', blockSize: '100%', minBlockSize: explicitHeight || maskSize, padding: '0', gap: '0', radius: '999px', background: 'transparent', border: '0', lineBlockSize: '100%', lineRadius: '999px', shapeBlockSize: '100%', shapeRadius: '999px', evenInlineSize: '100%', lastInlineSize: '100%', alignContent: 'stretch', lines: 1, singleShape: true },
      icon: { hostDisplay: 'inline-flex', hostInlineSize: explicitWidth || '36px', hostBlockSize: explicitHeight || '36px', inlineSize: '100%', blockSize: '100%', minBlockSize: explicitHeight || '36px', padding: '0', gap: '0', radius: 'var(--mvx-radius-sm)', background: 'transparent', border: '0', lineBlockSize: '100%', lineRadius: 'var(--mvx-radius-sm)', shapeBlockSize: '100%', shapeRadius: 'var(--mvx-radius-sm)', evenInlineSize: '100%', lastInlineSize: '100%', alignContent: 'stretch', lines: 1, singleShape: true },
      avatar: { hostDisplay: 'inline-flex', hostInlineSize: explicitWidth || avatarSize, hostBlockSize: explicitHeight || avatarSize, inlineSize: '100%', blockSize: '100%', minBlockSize: explicitHeight || avatarSize, padding: '0', gap: '0', radius: '999px', background: 'transparent', border: '0', lineBlockSize: '100%', lineRadius: '999px', shapeBlockSize: '100%', shapeRadius: '999px', evenInlineSize: '100%', lastInlineSize: '100%', alignContent: 'stretch', lines: 1, singleShape: true },
      field: { hostDisplay: 'block', hostInlineSize: explicitWidth, hostBlockSize: explicitHeight, inlineSize: '100%', blockSize: explicitHeight ? '100%' : 'auto', minBlockSize: explicitHeight || 'var(--mvx-skeleton-field-size, 44px)', padding: this.hasAttribute('label') ? '0' : '2px 0', gap: '8px', radius: 'var(--mvx-radius-sm)', background: 'transparent', border: '0', lineBlockSize: explicitHeight && !this.hasAttribute('label') ? '100%' : 'var(--mvx-skeleton-field-size, 44px)', firstLineBlockSize: this.hasAttribute('label') ? '12px' : (explicitHeight || 'var(--mvx-skeleton-field-size, 44px)'), lastLineBlockSize: explicitHeight && this.hasAttribute('label') ? `calc(${explicitHeight} - 20px)` : (explicitHeight || 'var(--mvx-skeleton-field-size, 44px)'), lineRadius: 'var(--mvx-radius-sm)', shapeBlockSize: 'var(--mvx-skeleton-field-size, 44px)', shapeRadius: 'var(--mvx-radius-sm)', evenInlineSize: '100%', lastInlineSize: '100%', alignContent: 'stretch', lines: this.hasAttribute('label') ? 2 : 1 },
      card: { hostDisplay: 'block', hostInlineSize: explicitWidth, hostBlockSize: explicitHeight, inlineSize: '100%', blockSize: '100%', minBlockSize: explicitHeight || 'var(--mvx-skeleton-block-size, 132px)', padding: '14px', gap: '10px', radius: 'var(--mvx-radius-md)', background: 'var(--mvx-bg-panel)', border: '1px solid var(--mvx-border)', lineBlockSize: '12px', lineRadius: '999px', shapeBlockSize: '64px', shapeRadius: 'var(--mvx-radius-sm)', evenInlineSize: '86%', lastInlineSize: '68%', alignContent: 'start', lines: 4, firstShape: true },
      chart: { hostDisplay: 'block', hostInlineSize: explicitWidth, hostBlockSize: explicitHeight, inlineSize: '100%', blockSize: '100%', minBlockSize: explicitHeight || 'var(--mvx-skeleton-block-size, 220px)', padding: '14px', gap: '12px', radius: 'var(--mvx-radius-md)', background: 'var(--mvx-bg-panel)', border: '1px solid var(--mvx-border)', lineBlockSize: '12px', lineRadius: '999px', shapeBlockSize: 'min(160px, 70%)', shapeRadius: 'var(--mvx-radius-sm)', evenInlineSize: '78%', lastInlineSize: '52%', alignContent: 'end', lines: 4, firstShape: true },
      table: { hostDisplay: 'block', hostInlineSize: explicitWidth, hostBlockSize: explicitHeight, inlineSize: '100%', blockSize: explicitHeight ? '100%' : 'auto', minBlockSize: explicitHeight || 'var(--mvx-skeleton-block-size, 168px)', padding: '12px', gap: '8px', radius: 'var(--mvx-radius-md)', background: 'var(--mvx-bg-panel)', border: '1px solid var(--mvx-border)', lineBlockSize: '28px', lineRadius: 'var(--mvx-radius-xs)', shapeBlockSize: '28px', shapeRadius: 'var(--mvx-radius-xs)', evenInlineSize: '100%', lastInlineSize: '100%', alignContent: 'start', lines: 5 },
      progress: { hostDisplay: 'block', hostInlineSize: explicitWidth, hostBlockSize: explicitHeight, inlineSize: '100%', blockSize: explicitHeight ? '100%' : 'auto', minBlockSize: explicitHeight || '8px', padding: '2px 0', gap: '0', radius: '999px', background: 'transparent', border: '0', lineBlockSize: explicitHeight || '8px', lineRadius: '999px', shapeBlockSize: explicitHeight || '8px', shapeRadius: '999px', evenInlineSize: '100%', lastInlineSize: '100%', alignContent: 'stretch', lines: 1, singleShape: true }
    };
    const aliases = {
      circle: 'avatar',
      input: 'field',
      media: 'card',
      panel: 'card'
    };
    return profiles[aliases[inferred] || inferred] || profiles.text;
  }

  inferSkeletonVariant() {
    const name = this.localName || '';
    if (['mvx-avatar'].includes(name)) return 'avatar';
    if (['mvx-icon', 'mvx-icon-button', 'mvx-close-button', 'mvx-marker', 'mvx-spinner', 'mvx-theme-switcher', 'mvx-variant-switcher'].includes(name)) return 'icon';
    if (['mvx-badge', 'mvx-button', 'mvx-button-group', 'mvx-chip', 'mvx-join', 'mvx-fab', 'mvx-indicator', 'mvx-kbd', 'mvx-link', 'mvx-status', 'mvx-toggle'].includes(name)) return 'button';
    if (['mvx-swap'].includes(name)) return 'swap';
    if (['mvx-toggle-group'].includes(name)) return 'toggle-group';
    if (['mvx-mask'].includes(name)) return 'mask';
    if (['mvx-label', 'mvx-placeholder', 'mvx-skeleton', 'mvx-text-rotate', 'mvx-tooltip', 'mvx-typography'].includes(name)) return 'text';
    if (['mvx-autocomplete', 'mvx-checkbox', 'mvx-combobox', 'mvx-date-picker', 'mvx-field', 'mvx-file-input', 'mvx-filter', 'mvx-floating-label', 'mvx-input', 'mvx-input-group', 'mvx-native-select', 'mvx-number-field', 'mvx-otp-input', 'mvx-radio-group', 'mvx-rating', 'mvx-rich-text-editor', 'mvx-select', 'mvx-slider', 'mvx-switch', 'mvx-textarea', 'mvx-validator'].includes(name)) return 'field';
    if (['mvx-chart', 'mvx-chart-group'].includes(name)) return 'chart';
    if (['mvx-accordion', 'mvx-bottom-navigation', 'mvx-breadcrumbs', 'mvx-command-palette', 'mvx-context-menu', 'mvx-data-table', 'mvx-dock', 'mvx-dropdown-menu', 'mvx-kanban', 'mvx-list', 'mvx-mega-menu', 'mvx-menubar', 'mvx-menu', 'mvx-navigation-menu', 'mvx-pagination', 'mvx-scrollspy', 'mvx-shortcuts', 'mvx-sidebar-dropdown', 'mvx-stepper', 'mvx-table', 'mvx-tabs', 'mvx-timeline', 'mvx-transfer-list', 'mvx-tree-view'].includes(name)) return 'table';
    if (['mvx-countdown', 'mvx-divider', 'mvx-progress', 'mvx-radial-progress', 'mvx-separator'].includes(name)) return 'progress';
    if (['mvx-ai-panel', 'mvx-alert', 'mvx-alert-dialog', 'mvx-app-shell', 'mvx-aspect-ratio', 'mvx-attachment', 'mvx-aura', 'mvx-backdrop', 'mvx-bubble', 'mvx-box', 'mvx-browser-mockup', 'mvx-calendar', 'mvx-card', 'mvx-carousel', 'mvx-chat-bubble', 'mvx-chatbot', 'mvx-code-block', 'mvx-collapse', 'mvx-container', 'mvx-dialog', 'mvx-diff', 'mvx-drawer', 'mvx-empty-state', 'mvx-fieldset', 'mvx-figure', 'mvx-footer', 'mvx-grid', 'mvx-hero', 'mvx-hover-3d-card', 'mvx-hover-card', 'mvx-hover-gallery', 'mvx-image', 'mvx-image-list', 'mvx-icons', 'mvx-item', 'mvx-json-renderer', 'mvx-json-schema-form', 'mvx-masonry', 'mvx-message', 'mvx-message-scroller', 'mvx-modal', 'mvx-navbar', 'mvx-offcanvas', 'mvx-paper', 'mvx-phone-mockup', 'mvx-popover', 'mvx-resizable', 'mvx-schema-form', 'mvx-scroll-area', 'mvx-sheet', 'mvx-sonner', 'mvx-sidebar', 'mvx-speed-dial', 'mvx-stack', 'mvx-stat', 'mvx-theme-controller', 'mvx-window-mockup'].includes(name)) return 'card';
    if (['mvx-toast'].includes(name)) return 'toast';
    return 'text';
  }

  normalizeRadius(value) {
    const trimmed = String(value).trim();
    if (!trimmed || trimmed === 'rounded') return 'var(--mvx-radius-md)';
    if (trimmed === 'square') return '0px';
    if (/^-?\d+(\.\d+)?$/.test(trimmed)) return `${Math.max(0, Number(trimmed))}px`;
    return trimmed;
  }

  normalizeFont(value) {
    const trimmed = String(value ?? '').trim();
    if (!trimmed || trimmed === 'inherit') return 'inherit';
    return fontStacks[trimmed] || trimmed;
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
    const isMaterialVariant = () => this.getAttribute('data-mvx-variant') === 'material' || globalThis.document?.documentElement?.getAttribute('data-mvx-variant') === 'material';
    const isDisabled = () => options.disabled?.() || target.disabled || target.getAttribute('aria-disabled') === 'true';
    const update = event => {
      if (isDisabled()) return;
      const rect = target.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
      target.style.setProperty('--mx', `${x * 100}%`);
      target.style.setProperty('--my', `${y * 100}%`);
      if (isMaterialVariant()) {
        target.style.removeProperty('--tilt-x');
        target.style.removeProperty('--tilt-y');
        return;
      }
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
