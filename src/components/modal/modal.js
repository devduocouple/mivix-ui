import { baseStyles, MvxElement, htmlEscape, parseData } from '../../core.js';

function modalCssLength(value, fallback) {
  const sizes = { xs: '28px', sm: '36px', md: '48px', xl: '56px', xxl: '64px' };
  const raw = String(value ?? '').trim();
  if (!raw) return fallback;
  if (sizes[raw]) return sizes[raw];
  if (/^\d+(\.\d+)?$/.test(raw)) return `${raw}px`;
  if (/^\d+(\.\d+)?(px|rem|em)$/.test(raw)) return raw;
  return fallback;
}

function modalToneColor(value) {
  const tone = String(value || 'neutral').trim().toLowerCase();
  if (tone === 'primary') return 'var(--mvx-accent)';
  if (tone === 'secondary') return 'var(--mvx-accent-2)';
  if (tone === 'tertiary') return 'var(--mvx-accent-3, var(--mvx-accent-2))';
  if (tone === 'success') return 'var(--mvx-success)';
  if (tone === 'warning') return 'var(--mvx-warning)';
  if (tone === 'danger') return 'var(--mvx-danger)';
  if (tone === 'info') return 'var(--mvx-info)';
  return 'var(--mvx-muted)';
}

function modalDensityConfig(value) {
  const density = String(value || 'compact').trim().toLowerCase();
  if (density === 'very-compact' || density === 'dense') {
    return {
      name: 'very-compact',
      headerPadding: '10px calc(var(--modal-close-size) + 14px) 9px 14px',
      dividerInset: '14px',
      bodyPadding: '6px 14px 14px',
      footerSize: '40px',
      actionPadding: '0 12px'
    };
  }
  if (density === 'spacious') {
    return {
      name: 'spacious',
      headerPadding: '24px calc(var(--modal-close-size) + 32px) 20px 28px',
      dividerInset: '28px',
      bodyPadding: '16px 28px 28px',
      footerSize: '56px',
      actionPadding: '0 20px'
    };
  }
  return {
    name: 'compact',
    headerPadding: '16px calc(var(--modal-close-size) + 24px) 14px 20px',
    dividerInset: '20px',
    bodyPadding: '10px 20px 20px',
    footerSize: '48px',
    actionPadding: '0 16px'
  };
}

export class MvxModal extends MvxElement {
  static observedAttributes = ['open', 'label', 'actions', 'close-size', 'close-tone', 'density'];

  set actions(value) {
    this._actions = Array.isArray(value) ? value : parseData(value, []);
    if (this.isConnected) this.render();
  }

  get actions() {
    return this._actions ?? parseData(this.getAttribute('actions'), []);
  }

  set closeSize(value) {
    this.setAttribute('close-size', String(value ?? ''));
  }

  get closeSize() {
    return this.getAttribute('close-size') || 'md';
  }

  set closeTone(value) {
    this.setAttribute('close-tone', String(value ?? ''));
  }

  get closeTone() {
    return this.getAttribute('close-tone') || 'neutral';
  }

  set density(value) {
    this.setAttribute('density', String(value ?? ''));
  }

  get density() {
    return this.getAttribute('density') || 'compact';
  }

  connectedCallback() {
    super.connectedCallback();
    this._onKey = event => {
      if (event.key === 'Escape' && this.hasAttribute('open')) this.close();
    };
    document.addEventListener('keydown', this._onKey);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('keydown', this._onKey);
  }

  close() {
    this.removeAttribute('open');
    this.emit('mvx-close');
  }

  render() {
    const label = this.getAttribute('label') || this.getAttribute('title') || this.t('dialog', 'Dialog');
    const closeLabel = this.t('close', 'Close');
    const closeSize = modalCssLength(this.getAttribute('close-size') || this.getAttribute('close-button-size'), '48px');
    const closeTone = modalToneColor(this.getAttribute('close-tone') || this.getAttribute('close-color'));
    const density = modalDensityConfig(this.getAttribute('density'));
    const actions = this.actions;
    const hasFooterSlot = Boolean(this.querySelector('[slot="footer"]'));
    const footer = hasFooterSlot || actions.length
      ? `<footer class="footer" part="footer">
          <slot name="footer"></slot>
          ${actions.length ? `<div class="actions" part="actions">${actions.map((action, index) => this.actionMarkup(action, index)).join('')}</div>` : ''}
        </footer>`
      : '';
    this.shadowRoot.innerHTML = `
      <style>
        ${baseStyles}
        :host { display: contents; }
        .wrap {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: ${this.hasAttribute('open') ? 'grid' : 'none'};
          place-items: center;
          padding: 24px;
        }
        :host([inline]) { display: block; }
        :host([inline]) .wrap {
          position: relative;
          inset: auto;
          z-index: auto;
          display: ${this.hasAttribute('open') ? 'grid' : 'none'};
          padding: 0;
        }
        .backdrop {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.58);
          backdrop-filter: blur(10px);
        }
        :host([inline]) .backdrop { display: none; }
        .panel {
          --modal-close-size: ${closeSize};
          --modal-close-tone: ${closeTone};
          --modal-header-padding: ${density.headerPadding};
          --modal-divider-inset: ${density.dividerInset};
          --modal-body-padding: ${density.bodyPadding};
          --modal-footer-size: ${density.footerSize};
          --modal-action-padding: ${density.actionPadding};
          position: relative;
          z-index: 1;
          inline-size: min(620px, 100%);
          max-block-size: min(720px, calc(100vh - 48px));
          overflow: hidden;
          border-radius: var(--mvx-radius-lg);
          display: grid;
          grid-template-rows: auto minmax(0, 1fr) auto;
        }
        :host([inline]) .panel {
          inline-size: 100%;
          max-block-size: none;
        }
        header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          position: relative;
          min-block-size: var(--modal-close-size);
          padding: var(--modal-header-padding);
        }
        header::after {
          content: "";
          position: absolute;
          inset-inline: var(--modal-divider-inset);
          inset-block-end: 0;
          block-size: 1px;
          background: linear-gradient(90deg, var(--mvx-border), transparent);
        }
        h2 {
          margin: 0;
          font-size: 18px;
          letter-spacing: 0;
        }
        .body {
          overflow: auto;
          padding: var(--modal-body-padding);
        }
        .close {
          position: absolute;
          inset-block-start: 0;
          inset-inline-end: 0;
          border: 1px solid transparent;
          border-block-start: 0;
          border-inline-end: 0;
          border-start-start-radius: 0;
          border-start-end-radius: var(--mvx-radius-lg);
          border-end-start-radius: var(--mvx-radius-sm);
          border-end-end-radius: 0;
          background: transparent;
          color: var(--modal-close-tone);
          cursor: pointer;
          inline-size: var(--modal-close-size);
          block-size: var(--modal-close-size);
          font-size: max(14px, calc(var(--modal-close-size) * 0.48));
          transition:
            background var(--mvx-duration-fast),
            border-color var(--mvx-duration-fast),
            color var(--mvx-duration-fast),
            box-shadow var(--mvx-duration-fast),
            transform var(--mvx-duration-fast);
        }
        .close:hover:not(:disabled) {
          border-color: var(--mvx-border-strong);
          background: color-mix(in srgb, var(--modal-close-tone) 12%, var(--mvx-bg-inset));
          color: var(--modal-close-tone);
          transform: translateY(-1px);
        }
        .close:active:not(:disabled) {
          transform: translateY(0);
          filter: brightness(0.96);
        }
        .close:focus-visible {
          outline: none;
          box-shadow: var(--mvx-focus);
          z-index: 1;
        }
        .footer {
          display: flex;
          flex-wrap: wrap;
          align-items: stretch;
          justify-content: flex-end;
          min-block-size: var(--modal-footer-size);
          border-block-start: 1px solid var(--mvx-border);
          background: color-mix(in srgb, var(--mvx-bg-inset) 72%, transparent);
          padding: 0;
        }
        .footer slot[name="footer"] {
          display: contents;
        }
        .actions {
          display: flex;
          flex-wrap: wrap;
          gap: 0;
          justify-content: flex-end;
          align-items: stretch;
          margin-inline-start: auto;
        }
        .action {
          --modal-action-tone: var(--mvx-muted);
          min-block-size: var(--modal-footer-size);
          border: 1px solid var(--mvx-border);
          border-block-start: 0;
          border-block-end: 0;
          border-inline-end: 0;
          border-radius: 0;
          background: var(--mvx-bg-inset);
          color: var(--mvx-fg);
          cursor: pointer;
          font: inherit;
          font-weight: 750;
          padding: var(--modal-action-padding);
          transition:
            background var(--mvx-duration-fast),
            border-color var(--mvx-duration-fast),
            color var(--mvx-duration-fast),
            box-shadow var(--mvx-duration-fast),
            transform var(--mvx-duration-fast);
        }
        .action[data-tone="primary"] { --modal-action-tone: var(--mvx-accent); }
        .action[data-tone="secondary"] { --modal-action-tone: var(--mvx-accent-2); }
        .action[data-tone="tertiary"] { --modal-action-tone: var(--mvx-accent-3, var(--mvx-accent-2)); }
        .action[data-tone="success"] { --modal-action-tone: var(--mvx-success); }
        .action[data-tone="warning"] { --modal-action-tone: var(--mvx-warning); }
        .action[data-tone="danger"] { --modal-action-tone: var(--mvx-danger); }
        .action[data-tone="info"] { --modal-action-tone: var(--mvx-info); }
        .action:first-child {
          border-inline-start: 1px solid var(--mvx-border);
        }
        .action:last-child {
          border-end-end-radius: var(--mvx-radius-lg);
        }
        .action:hover:not(:disabled) {
          background: color-mix(in srgb, var(--modal-action-tone) 12%, var(--mvx-bg-inset));
          border-color: var(--mvx-border-strong);
          color: var(--modal-action-tone);
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
        .action:disabled {
          cursor: not-allowed;
          opacity: 0.58;
        }
        .action[data-type="ghost"] {
          border-color: transparent;
          background: transparent;
          color: var(--mvx-muted);
        }
        .action[data-type="ghost"]:hover:not(:disabled) {
          background: color-mix(in srgb, var(--modal-action-tone) 12%, var(--mvx-bg-inset));
          color: var(--modal-action-tone);
        }
        .action[data-type="solid"] {
          border-color: var(--modal-action-tone);
          background: var(--modal-action-tone);
          color: #fff;
        }
        .action[data-type="solid"]:hover:not(:disabled) {
          background: color-mix(in srgb, var(--modal-action-tone) 12%, var(--mvx-bg-inset));
          border-color: var(--mvx-border-strong);
          color: var(--modal-action-tone);
        }
      </style>
      <div class="wrap" role="presentation">
        <div class="backdrop" part="backdrop"></div>
        <section class="panel edge" part="panel" role="dialog" aria-modal="true" aria-label="${htmlEscape(label)}">
          <header>
            <h2>${htmlEscape(label)}</h2>
            <button class="close" part="close" aria-label="${htmlEscape(closeLabel)}">&times;</button>
          </header>
          <div class="body" part="body"><slot></slot></div>
          ${footer}
        </section>
      </div>
    `;
    this.shadowRoot.querySelector('.backdrop')?.addEventListener('click', () => this.close());
    this.shadowRoot.querySelector('.close')?.addEventListener('click', () => this.close());
    this.shadowRoot.querySelectorAll('[data-action-index]').forEach(button => {
      button.addEventListener('click', () => {
        const action = actions[Number(button.dataset.actionIndex)] || {};
        this.emit('mvx-action', { action: action.action || action.value || action.label, item: action });
        if (action.close || action.dismiss) this.close();
      });
    });
  }

  actionMarkup(action = {}, index) {
    const label = action.label || action.text || this.t('action', 'Action');
    const tone = ['neutral', 'primary', 'secondary', 'tertiary', 'success', 'warning', 'danger', 'info'].includes(action.tone) ? action.tone : 'neutral';
    const type = ['solid', 'outline', 'ghost'].includes(action.type) ? action.type : 'outline';
    return `<button class="action" type="button" data-action-index="${index}" data-type="${htmlEscape(type)}" data-tone="${htmlEscape(tone)}"><span>${htmlEscape(label)}</span></button>`;
  }
}
