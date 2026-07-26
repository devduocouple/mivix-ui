import { baseStyles, MvxElement, toneMap, htmlEscape, parseData } from '../../core.js';

const alertTones = {
  neutral: 'var(--mvx-muted)',
  primary: 'var(--mvx-accent)',
  secondary: 'var(--mvx-accent-2)',
  info: 'var(--mvx-info)',
  success: 'var(--mvx-success)',
  warning: 'var(--mvx-warning)',
  danger: 'var(--mvx-danger)',
  accent: 'var(--mvx-accent)'
};

const defaultIcons = {
  neutral: 'i',
  primary: 'i',
  secondary: 'i',
  info: 'i',
  success: '✓',
  warning: '!',
  danger: '!',
  accent: '✦'
};

function alertTone(value) {
  const tone = String(value || 'info').trim().toLowerCase();
  return alertTones[tone] ? tone : 'info';
}

function alertVariant(value) {
  const variant = String(value || 'soft').trim().toLowerCase();
  return ['soft', 'solid', 'outline', 'subtle', 'plain'].includes(variant) ? variant : 'soft';
}

function alertDensity(value) {
  const density = String(value || 'comfortable').trim().toLowerCase();
  if (density === 'compact' || density === 'dense') {
    return {
      name: 'compact',
      gap: '9px',
      padding: '10px 12px',
      iconSize: '18px',
      titleSize: '13px',
      bodySize: '13px',
      actionSize: '32px',
      actionPadding: '0 10px'
    };
  }
  if (density === 'spacious') {
    return {
      name: 'spacious',
      gap: '14px',
      padding: '18px 20px',
      iconSize: '24px',
      titleSize: '16px',
      bodySize: '14px',
      actionSize: '38px',
      actionPadding: '0 14px'
    };
  }
  return {
    name: 'comfortable',
    gap: '11px',
    padding: '13px 14px',
    iconSize: '20px',
    titleSize: '14px',
    bodySize: '14px',
    actionSize: '34px',
    actionPadding: '0 12px'
  };
}

function alertAccent(value) {
  const accent = String(value || 'stripe').trim().toLowerCase();
  return ['stripe', 'top', 'border', 'none'].includes(accent) ? accent : 'stripe';
}

function alertLayout(value) {
  const layout = String(value || 'default').trim().toLowerCase();
  return ['default', 'inline', 'stacked'].includes(layout) ? layout : 'default';
}

function alertCloseSize(value) {
  const sizes = { xs: '24px', sm: '28px', md: '32px', xl: '40px', xxl: '48px' };
  const raw = String(value ?? '').trim();
  if (!raw) return sizes.md;
  if (sizes[raw]) return sizes[raw];
  if (/^\d+(\.\d+)?$/.test(raw)) return `${raw}px`;
  if (/^\d+(\.\d+)?(px|rem|em)$/.test(raw)) return raw;
  return sizes.md;
}

function alertRole(value, tone) {
  const role = String(value || '').trim().toLowerCase();
  if (['alert', 'status', 'note', 'log'].includes(role)) return role;
  return tone === 'danger' ? 'alert' : 'status';
}

function actionTone(value) {
  const tone = String(value || 'neutral').trim().toLowerCase();
  return alertTones[tone] ? tone : 'neutral';
}

function actionType(value) {
  const type = String(value || 'outline').trim().toLowerCase();
  return ['solid', 'outline', 'ghost'].includes(type) ? type : 'outline';
}

function actionsAlign(value) {
  const align = String(value || 'right').trim().toLowerCase();
  return ['left', 'center', 'right', 'stretch'].includes(align) ? align : 'right';
}

export class MvxAlert extends MvxElement {
  static observedAttributes = [
    'tone',
    'title',
    'message',
    'closable',
    'icon',
    'hide-icon',
    'variant',
    'density',
    'layout',
    'accent',
    'alert-role',
    'actions',
    'dismiss',
    'close-size',
    'close-tone',
    'actions-align',
    'actions-icon-only'
  ];

  set actions(value) {
    this._actions = Array.isArray(value) ? value : parseData(value, []);
    if (this.isConnected) this.render();
  }

  get actions() {
    return this._actions ?? parseData(this.getAttribute('actions'), []);
  }

  dismissAlert() {
    const detail = { dismiss: this.getAttribute('dismiss') || 'remove' };
    this.emit('mvx-close', detail);
    if (detail.dismiss === 'manual' || detail.dismiss === 'none') return;
    if (detail.dismiss === 'hide') {
      this.hidden = true;
      return;
    }
    this.remove();
  }

  render() {
    const toneName = alertTone(this.getAttribute('tone'));
    const tone = toneMap[toneName] || alertTones[toneName] || toneMap.info;
    const title = this.getAttribute('title') || '';
    const message = this.getAttribute('message') || '';
    const closable = this.hasAttribute('closable');
    const closeLabel = this.t('close', 'Close');
    const variant = alertVariant(this.getAttribute('variant'));
    const density = alertDensity(this.getAttribute('density'));
    const accent = alertAccent(this.getAttribute('accent'));
    const layout = alertLayout(this.getAttribute('layout'));
    const role = alertRole(this.getAttribute('alert-role') || this.getAttribute('role'), toneName);
    const closeToneName = actionTone(this.getAttribute('close-tone') || 'neutral');
    const closeTone = alertTones[closeToneName];
    const closeSize = alertCloseSize(this.getAttribute('close-size'));
    const hasIconSlot = Boolean(this.querySelector('[slot="icon"]'));
    const hideIcon = this.hasAttribute('hide-icon') || this.getAttribute('icon') === 'none';
    const icon = this.getAttribute('icon') || defaultIcons[toneName] || defaultIcons.info;
    const actions = this.actions;
    const actionAlignment = actionsAlign(this.getAttribute('actions-align'));
    const hasActionsSlot = Boolean(this.querySelector('[slot="actions"]'));
    const actionsMarkup = hasActionsSlot || actions.length
      ? `<div class="actions" part="actions"><slot name="actions"></slot>${actions.map((action, index) => this.actionMarkup(action, index)).join('')}</div>`
      : '';
    const closeMarkup = closable ? `<button class="close" aria-label="${htmlEscape(closeLabel)}" part="close">&times;</button>` : '';
    const bodyMarkup = `
      ${title ? `<strong class="title" part="title">${htmlEscape(title)}</strong>` : ''}
      ${message ? `<span class="message" part="message">${htmlEscape(message)}</span>` : ''}
      <span class="slot-wrap"><slot></slot></span>
    `;

    this.shadowRoot.innerHTML = `
      <style>
        ${baseStyles}
        :host { display: block; }
        :host([hidden]) { display: none; }
        :host([layout="inline"]) { display: inline-block; }
        .alert {
          --alert-tone: ${tone};
          --alert-close-tone: ${closeTone};
          --alert-close-size: ${closeSize};
          --alert-gap: ${density.gap};
          --alert-padding: ${density.padding};
          --alert-icon-size: ${density.iconSize};
          --alert-title-size: ${density.titleSize};
          --alert-body-size: ${density.bodySize};
          --alert-action-size: ${density.actionSize};
          --alert-action-padding: ${density.actionPadding};
          position: relative;
          overflow: hidden;
          display: grid;
          grid-template-columns: auto minmax(0, 1fr);
          gap: var(--alert-gap);
          align-items: start;
          border: 1px solid color-mix(in srgb, var(--alert-tone) 24%, var(--mvx-border));
          border-radius: var(--mvx-radius-md);
          background: color-mix(in srgb, var(--alert-tone) 5%, var(--mvx-bg-panel));
          color: var(--mvx-fg);
          padding: var(--alert-padding);
          box-shadow: inset 0 1px 0 color-mix(in srgb, white 5%, transparent);
        }
        .alert.no-icon {
          grid-template-columns: minmax(0, 1fr);
        }
        .alert.closable .content {
          padding-inline-end: calc(var(--alert-close-size) + 4px);
        }
        .alert.stacked {
          grid-template-columns: auto minmax(0, 1fr);
        }
        .alert.stacked .actions {
          grid-column: 2 / -1;
          margin-block-start: 2px;
        }
        .alert.no-icon.stacked .actions {
          grid-column: 1 / -1;
        }
        .alert.inline {
          display: inline-grid;
          inline-size: auto;
          max-inline-size: 100%;
          align-items: center;
        }
        .alert.inline .content {
          display: flex;
          flex-wrap: wrap;
          align-items: baseline;
          gap: 6px;
        }
        .alert.inline .slot-wrap {
          display: inline;
        }
        .alert[data-variant="solid"] {
          border-color: color-mix(in srgb, var(--alert-tone) 70%, var(--mvx-border));
          background: var(--alert-tone);
          color: #fff;
        }
        .alert[data-variant="solid"] .content,
        .alert[data-variant="solid"] .title,
        .alert[data-variant="solid"] .message,
        .alert[data-variant="solid"] .slot-wrap {
          color: color-mix(in srgb, white 88%, var(--mvx-bg));
        }
        .alert[data-variant="solid"] .icon,
        .alert[data-variant="solid"] .close,
        .alert[data-variant="solid"] .action {
          color: #fff;
        }
        .alert[data-variant="outline"] {
          border-color: color-mix(in srgb, var(--alert-tone) 70%, var(--mvx-border));
          background: transparent;
        }
        .alert[data-variant="subtle"] {
          border-color: transparent;
          background: color-mix(in srgb, var(--alert-tone) 5%, transparent);
          box-shadow: none;
        }
        .alert[data-variant="plain"] {
          border-color: transparent;
          background: transparent;
          box-shadow: none;
          padding-inline: 0;
        }
        .alert[data-accent="stripe"]::before,
        .alert[data-accent="top"]::before {
          content: "";
          position: absolute;
          background: var(--alert-tone);
        }
        .alert[data-accent="stripe"]::before {
          inset-block: 0;
          inset-inline-start: 0;
          inline-size: 3px;
        }
        .alert[data-accent="top"]::before {
          inset-block-start: 0;
          inset-inline: 0;
          block-size: 3px;
        }
        .alert[data-accent="border"] {
          border-color: color-mix(in srgb, var(--alert-tone) 70%, var(--mvx-border));
        }
        .icon {
          display: grid;
          place-items: center;
          inline-size: var(--alert-icon-size);
          block-size: var(--alert-icon-size);
          color: var(--alert-tone);
          font-weight: 900;
          font-size: calc(var(--alert-icon-size) * 0.82);
          line-height: 1;
        }
        .content {
          display: grid;
          gap: 4px;
          min-inline-size: 0;
          color: var(--mvx-muted);
          font-size: var(--alert-body-size);
          line-height: 1.42;
        }
        .title {
          display: block;
          color: var(--mvx-fg);
          font-size: var(--alert-title-size);
          font-weight: 750;
          letter-spacing: 0;
          line-height: 1.28;
        }
        .alert.has-title:not(.inline) .title {
          display: flex;
          align-items: center;
          min-block-size: var(--alert-icon-size);
        }
        .message {
          display: block;
          color: var(--mvx-muted);
        }
        .slot-wrap {
          display: block;
        }
        .slot-wrap:empty {
          display: none;
        }
        .actions {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          align-items: center;
          justify-content: flex-end;
          grid-column: 1 / -1;
          inline-size: 100%;
          justify-self: stretch;
          margin-block-start: 2px;
          padding-inline-start: calc(var(--alert-icon-size) + var(--alert-gap));
        }
        .alert.no-icon .actions {
          grid-column: 1 / -1;
          padding-inline-start: 0;
        }
        .alert[data-actions-align="left"] .actions {
          justify-content: flex-start;
        }
        .alert[data-actions-align="center"] .actions {
          justify-content: center;
        }
        .alert[data-actions-align="right"] .actions {
          justify-content: flex-end;
        }
        .alert[data-actions-align="stretch"] .actions {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(96px, 1fr));
          inline-size: 100%;
        }
        .actions slot[name="actions"] {
          display: contents;
        }
        .action {
          --action-tone: var(--mvx-muted);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-block-size: var(--alert-action-size);
          border: 1px solid color-mix(in srgb, var(--action-tone) 34%, var(--mvx-border));
          border-radius: var(--mvx-radius-sm);
          background: transparent;
          color: var(--action-tone);
          cursor: pointer;
          font: inherit;
          font-size: 13px;
          font-weight: 750;
          padding: var(--alert-action-padding);
          gap: 6px;
          transition:
            background var(--mvx-duration-fast),
            border-color var(--mvx-duration-fast),
            color var(--mvx-duration-fast),
            box-shadow var(--mvx-duration-fast),
            transform var(--mvx-duration-fast);
        }
        .action[data-tone="primary"] { --action-tone: var(--mvx-accent); }
        .action[data-tone="secondary"] { --action-tone: var(--mvx-accent-2); }
        .action[data-tone="info"] { --action-tone: var(--mvx-info); }
        .action[data-tone="success"] { --action-tone: var(--mvx-success); }
        .action[data-tone="warning"] { --action-tone: var(--mvx-warning); }
        .action[data-tone="danger"] { --action-tone: var(--mvx-danger); }
        .action[data-icon-only="true"] {
          display: inline-grid;
          place-items: center;
          inline-size: var(--alert-action-size);
          min-inline-size: var(--alert-action-size);
          padding: 0;
        }
        .action-icon {
          display: inline-grid;
          place-items: center;
          font-size: 15px;
          line-height: 1;
        }
        .action-label {
          min-inline-size: 0;
        }
        .action[data-icon-only="true"] .action-label {
          position: absolute;
          inline-size: 1px;
          block-size: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }
        .action:hover:not(:disabled) {
          border-color: color-mix(in srgb, var(--action-tone) 56%, var(--mvx-border-strong));
          background: color-mix(in srgb, var(--action-tone) 9%, var(--mvx-bg-inset));
          color: var(--action-tone);
        }
        .action:active:not(:disabled) {
          filter: brightness(0.96);
          transform: scale(0.98);
        }
        .action:focus-visible,
        .close:focus-visible {
          outline: none;
          box-shadow: var(--mvx-focus);
        }
        .action:disabled {
          cursor: not-allowed;
          opacity: 0.58;
        }
        .action[data-type="ghost"] {
          border-color: transparent;
          background: transparent;
          color: var(--action-tone);
        }
        .action[data-type="solid"] {
          border-color: var(--action-tone);
          background: var(--action-tone);
          color: #fff;
        }
        .action[data-type="solid"]:hover:not(:disabled) {
          background: color-mix(in srgb, var(--action-tone) 12%, var(--mvx-bg-inset));
          color: var(--action-tone);
        }
        .close {
          position: absolute;
          inset-block-start: 0;
          inset-inline-end: 0;
          border: 1px solid transparent;
          border-block-start: 0;
          border-inline-end: 0;
          border-start-start-radius: 0;
          border-start-end-radius: var(--mvx-radius-md);
          border-end-start-radius: var(--mvx-radius-sm);
          border-end-end-radius: 0;
          background: transparent;
          color: var(--alert-close-tone);
          cursor: pointer;
          inline-size: var(--alert-close-size);
          block-size: var(--alert-close-size);
          min-inline-size: var(--alert-close-size);
          font-size: max(14px, calc(var(--alert-close-size) * 0.48));
          transition:
            background var(--mvx-duration-fast),
            border-color var(--mvx-duration-fast),
            color var(--mvx-duration-fast),
            box-shadow var(--mvx-duration-fast),
            transform var(--mvx-duration-fast);
        }
        .close:hover:not(:disabled) {
          border-color: var(--mvx-border-strong);
          background: color-mix(in srgb, var(--alert-close-tone) 12%, var(--mvx-bg-inset));
          color: var(--alert-close-tone);
          transform: translateY(-1px);
        }
        .close:active:not(:disabled) {
          transform: translateY(0);
          filter: brightness(0.96);
        }
        @media (max-width: 520px) {
          .alert {
            grid-template-columns: auto minmax(0, 1fr);
          }
          .alert.no-icon {
            grid-template-columns: minmax(0, 1fr);
          }
          .actions {
            grid-column: 1 / -1;
          }
          .alert.no-icon .actions {
            grid-column: 1 / -1;
          }
        }
      </style>
      <div part="alert" class="alert ${hideIcon ? 'no-icon' : ''} ${title ? 'has-title' : ''} ${closable ? 'closable' : ''} ${layout}" role="${htmlEscape(role)}" data-variant="${htmlEscape(variant)}" data-accent="${htmlEscape(accent)}" data-density="${htmlEscape(density.name)}" data-actions-align="${htmlEscape(actionAlignment)}">
        ${hideIcon ? '' : `<span class="icon" part="icon" aria-hidden="true"><slot name="icon">${htmlEscape(icon)}</slot></span>`}
        <div class="content" part="content">${bodyMarkup}</div>
        ${actionsMarkup}
        ${closeMarkup}
      </div>
    `;
    this.shadowRoot.querySelector('.close')?.addEventListener('click', () => this.dismissAlert());
    this.shadowRoot.querySelectorAll('[data-action-index]').forEach(button => {
      button.addEventListener('click', () => {
        const action = actions[Number(button.dataset.actionIndex)] || {};
        this.emit('mvx-action', { action: action.action || action.value || action.label, item: action });
        if (action.close || action.dismiss) this.dismissAlert();
      });
    });
  }

  actionMarkup(action = {}, index) {
    const label = action.label || action.text || this.t('action', 'Action');
    const tone = actionTone(action.tone);
    const type = actionType(action.type);
    const icon = action.icon || action.glyph || '';
    const iconOnly = Boolean(icon && (this.hasAttribute('actions-icon-only') || action.iconOnly || action['icon-only']));
    const disabled = action.disabled ? 'disabled' : '';
    const iconMarkup = icon ? `<span class="action-icon" aria-hidden="true">${htmlEscape(icon)}</span>` : '';
    return `<button class="action" type="button" data-action-index="${index}" data-type="${htmlEscape(type)}" data-tone="${htmlEscape(tone)}" data-icon-only="${iconOnly ? 'true' : 'false'}" aria-label="${htmlEscape(label)}" title="${htmlEscape(label)}" ${disabled}>${iconMarkup}<span class="action-label">${htmlEscape(label)}</span></button>`;
  }
}
