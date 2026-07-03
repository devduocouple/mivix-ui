export const baseStyles = `
  :host {
    box-sizing: border-box;
    color-scheme: dark;
    color: var(--mvx-fg);
    direction: inherit;
    font-family: var(--mvx-font-sans);
    letter-spacing: 0;
    unicode-bidi: plaintext;
    --mvx-surface-glaze: linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02));
    --mvx-surface-backdrop: none;
    --mvx-control-glaze: linear-gradient(180deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.02));
    --mvx-control-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.16), 0 8px 18px rgba(0, 0, 0, 0.18);
    --mvx-hover-lift: -1px;
    --mvx-touch-target: 44px;
    --mvx-container-max: 1440px;
    --mvx-container-wide: 1920px;
    --mvx-container-padding: clamp(12px, 2vw, 32px);
    --mvx-grid-gap: clamp(10px, 1.1vw, 22px);
    --mvx-grid-min-column: 220px;
    --mvx-stack-gap: clamp(8px, 0.8vw, 18px);
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
  static globalAttributes = ['theme', 'component-style', 'radius', 'dir', 'lang', 'locale', 'i18n', 'skeleton', 'skeleton-lines'];

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
  }

  attributeChangedCallback() {
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
      this.renderSkeleton();
      return;
    }
    if (this._mvxSkeletonBusy) {
      this.removeAttribute('aria-busy');
      this._mvxSkeletonBusy = false;
    }
    this.render();
  }

  renderSkeleton() {
    const lines = Math.max(1, Number(this.getAttribute('skeleton-lines') || this.getAttribute('lines') || 3));
    const label = this.getAttribute('aria-label') || this.getAttribute('label') || this.t('loading', 'Loading');
    const variant = this.getAttribute('skeleton') || 'text';
    const isBlock = ['card', 'chart', 'table', 'media', 'panel'].includes(variant);
    const isAvatar = ['avatar', 'circle'].includes(variant);
    this.setAttribute('aria-busy', 'true');
    this._mvxSkeletonBusy = true;
    this.shadowRoot.innerHTML = `
      <style>
        ${baseStyles}
        :host {
          display: block;
          min-inline-size: 0;
        }
        .skeleton {
          display: ${isAvatar ? 'inline-grid' : 'grid'};
          gap: 9px;
          inline-size: ${isAvatar ? 'var(--mvx-skeleton-size, 40px)' : '100%'};
          min-block-size: ${isBlock ? 'var(--mvx-skeleton-block-size, 132px)' : 'auto'};
          padding: ${isBlock ? '14px' : '2px 0'};
          border-radius: ${isAvatar ? '999px' : 'var(--mvx-radius-md)'};
          background: ${isBlock ? 'var(--mvx-bg-panel)' : 'transparent'};
          border: ${isBlock ? '1px solid var(--mvx-border)' : '0'};
        }
        .line {
          display: block;
          block-size: ${isAvatar ? 'var(--mvx-skeleton-size, 40px)' : '12px'};
          inline-size: ${isAvatar ? 'var(--mvx-skeleton-size, 40px)' : '100%'};
          border-radius: ${isAvatar ? '999px' : '999px'};
          background: linear-gradient(90deg, var(--mvx-bg-inset), color-mix(in srgb, var(--mvx-border) 56%, var(--mvx-bg-panel)), var(--mvx-bg-inset));
          background-size: 220% 100%;
          animation: mvx-skeleton-pulse 1.4s ease-in-out infinite;
        }
        .line:nth-child(2n) { inline-size: 86%; }
        .line:last-child { inline-size: ${isAvatar ? 'var(--mvx-skeleton-size, 40px)' : '68%'}; }
        :host([skeleton="button"]) .line {
          inline-size: min(160px, 100%);
          block-size: var(--mvx-touch-target, 44px);
          border-radius: var(--mvx-radius-sm);
        }
        :host([skeleton="input"]) .line {
          block-size: var(--mvx-touch-target, 44px);
          border-radius: var(--mvx-radius-sm);
        }
        :host([skeleton="chart"]) .skeleton,
        :host([skeleton="media"]) .skeleton {
          min-block-size: var(--mvx-skeleton-block-size, 220px);
        }
        :host([skeleton="table"]) .line {
          block-size: 28px;
          border-radius: var(--mvx-radius-xs);
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
        ${Array.from({ length: isAvatar ? 1 : lines }, () => '<span class="line"></span>').join('')}
      </div>
      <span class="sr-only">${htmlEscape(label)}</span>
    `;
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
