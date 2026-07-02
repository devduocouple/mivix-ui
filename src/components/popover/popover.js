import { baseStyles, MvxElement, htmlEscape } from '../../core.js';

export class MvxPopover extends MvxElement {
  static observedAttributes = ['open', 'label', 'placement', 'disabled'];

  toggle(force) {
    if (this.hasAttribute('disabled')) return;
    const open = force ?? !this.hasAttribute('open');
    this.toggleAttribute('open', open);
    this.emit(open ? 'mvx-open' : 'mvx-close', { open });
  }

  render() {
    const label = this.getAttribute('label') || this.t('popover', 'Popover');
    this.shadowRoot.innerHTML = `
      <style>
        ${baseStyles}
        :host { position: relative; display: inline-block; }
        .trigger {
          min-block-size: 36px;
          border: 1px solid var(--mvx-border);
          border-radius: var(--mvx-radius-sm);
          background: var(--mvx-bg-panel);
          color: var(--mvx-fg);
          cursor: pointer;
          padding: 0 12px;
        }
        .panel {
          position: absolute;
          z-index: 22;
          inset-block-start: calc(100% + 8px);
          inset-inline-start: 0;
          display: ${this.hasAttribute('open') ? 'grid' : 'none'};
          gap: 8px;
          inline-size: min(320px, 80vw);
          border: 1px solid var(--mvx-border);
          border-radius: var(--mvx-radius-md);
          background: var(--mvx-bg-panel);
          box-shadow: var(--mvx-shadow-raised);
          color: var(--mvx-muted);
          line-height: 1.45;
          padding: 12px;
        }
        :host([placement="end"]) .panel { inset-inline-start: auto; inset-inline-end: 0; }
        :host([placement="top"]) .panel { inset-block-start: auto; inset-block-end: calc(100% + 8px); }
        .trigger:focus-visible,
        .panel:focus-visible {
          outline: none;
          box-shadow: var(--mvx-focus);
        }
      </style>
      <button class="trigger" part="trigger" aria-haspopup="dialog" aria-expanded="${this.hasAttribute('open')}" ${this.hasAttribute('disabled') ? 'disabled' : ''}>
        <slot name="trigger">${htmlEscape(label)}</slot>
      </button>
      <section class="panel" part="panel" role="dialog" aria-label="${htmlEscape(label)}" tabindex="-1">
        <slot></slot>
      </section>
    `;
    this.shadowRoot.querySelector('.trigger').addEventListener('click', () => this.toggle());
    this.shadowRoot.addEventListener('keydown', event => {
      if (event.key === 'Escape') this.toggle(false);
    });
  }
}
