import { baseStyles, MvxElement, htmlEscape } from '../../core.js';

export class MvxDivider extends MvxElement {
  static observedAttributes = ['label', 'orientation', 'inset'];

  render() {
    const label = this.getAttribute('label') || '';
    const vertical = this.getAttribute('orientation') === 'vertical';
    this.shadowRoot.innerHTML = `
      <style>
        ${baseStyles}
        :host {
          display: ${vertical ? 'inline-block' : 'block'};
          ${vertical ? 'block-size: 100%; min-block-size: 40px;' : 'inline-size: 100%;'}
        }
        .divider {
          display: grid;
          grid-template-columns: ${vertical ? '1fr' : label ? '1fr auto 1fr' : '1fr'};
          grid-template-rows: ${vertical ? label ? '1fr auto 1fr' : '1fr' : 'auto'};
          gap: 8px;
          align-items: center;
          justify-items: center;
          block-size: 100%;
          color: var(--mvx-subtle);
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
        }
        .line {
          background: var(--mvx-border);
          ${vertical ? 'inline-size: 1px; block-size: 100%;' : 'inline-size: 100%; block-size: 1px;'}
        }
        :host([inset]) .divider {
          margin-inline: ${vertical ? '0' : '16px'};
          margin-block: ${vertical ? '16px' : '0'};
        }
      </style>
      <div class="divider" part="divider" role="separator" aria-orientation="${vertical ? 'vertical' : 'horizontal'}">
        <span class="line"></span>
        ${label ? `<span>${htmlEscape(label)}</span><span class="line"></span>` : ''}
      </div>
    `;
  }
}
