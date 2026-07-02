import { baseStyles, htmlEscape } from '../../core.js';
import { MvxModal } from '../modal/modal.js';

export class MvxDrawer extends MvxModal {
  render() {
    const label = this.getAttribute('label') || this.getAttribute('title') || this.t('drawer', 'Drawer');
    const side = this.getAttribute('side') || 'right';
    const closeLabel = this.t('close', 'Close');
    this.shadowRoot.innerHTML = `
      <style>
        ${baseStyles}
        :host { display: contents; }
        .wrap {
          position: fixed;
          inset: 0;
          z-index: 1000;
          display: ${this.hasAttribute('open') ? 'grid' : 'none'};
          justify-items: ${side === 'left' ? 'start' : 'end'};
          background: rgba(0, 0, 0, 0.48);
          backdrop-filter: blur(8px);
        }
        :host([inline]) { display: block; }
        :host([inline]) .wrap {
          position: relative;
          inset: auto;
          z-index: auto;
          display: ${this.hasAttribute('open') ? 'grid' : 'none'};
          background: transparent;
          backdrop-filter: none;
        }
        .panel {
          inline-size: min(420px, 100vw);
          block-size: 100vh;
          overflow: auto;
          border-radius: 0;
          padding: 20px;
        }
        :host([inline]) .panel {
          inline-size: 100%;
          block-size: auto;
          min-block-size: 150px;
          border-radius: var(--mvx-radius-md);
        }
        header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-block-end: 18px;
        }
        h2 { margin: 0; font-size: 18px; }
        button {
          border: 1px solid var(--mvx-border);
          border-radius: var(--mvx-radius-sm);
          background: var(--mvx-bg-inset);
          color: var(--mvx-muted);
          cursor: pointer;
          inline-size: 32px;
          block-size: 32px;
        }
      </style>
      <div class="wrap" part="backdrop">
        <aside class="panel edge" part="panel" role="dialog" aria-modal="true" aria-label="${htmlEscape(label)}">
          <header>
            <h2>${htmlEscape(label)}</h2>
            <button part="close" aria-label="${htmlEscape(closeLabel)}">&times;</button>
          </header>
          <slot></slot>
        </aside>
      </div>
    `;
    this.shadowRoot.querySelector('.wrap')?.addEventListener('click', event => {
      if (event.target.classList.contains('wrap')) this.close();
    });
    this.shadowRoot.querySelector('button')?.addEventListener('click', () => this.close());
  }
}
