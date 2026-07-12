import { baseStyles, MvxElement, htmlEscape } from '../../core.js';

export class MvxCard extends MvxElement {
  static observedAttributes = ['title', 'eyebrow', 'interactive'];

  render() {
    const title = this.getAttribute('title');
    const eyebrow = this.getAttribute('eyebrow');
    this.shadowRoot.innerHTML = `
      <style>
        ${baseStyles}
        :host { display: block; }
        article {
          position: relative;
          overflow: visible;
          border-radius: var(--mvx-radius-md);
          padding: var(--mvx-space-5);
        }
        article::before {
          content: "";
          position: absolute;
          inset: 0;
          pointer-events: none;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.12), transparent 34%);
          opacity: 0.8;
        }
        :host-context([data-mvx-variant="material"]) article {
          overflow: hidden;
          border-radius: var(--mvx-radius-md);
          background: var(--mvx-bg-panel);
          box-shadow: var(--mvx-shadow-soft);
        }
        :host-context([data-mvx-variant="material"]) article::before {
          display: none;
        }
        :host([interactive]) article {
          cursor: pointer;
          transition: transform var(--mvx-duration-fast), border-color var(--mvx-duration);
        }
        :host([interactive]) article:hover {
          border-color: var(--mvx-border-strong);
          transform: translateY(-2px);
        }
        :host-context([data-mvx-variant="material"]):host([interactive]) article:hover {
          transform: none;
          box-shadow: var(--mvx-shadow-raised);
        }
        header {
          position: relative;
          display: grid;
          gap: 5px;
          margin-block-end: 14px;
        }
        .eyebrow {
          color: var(--mvx-accent-2);
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
        }
        h3 {
          margin: 0;
          font-size: 17px;
          line-height: 1.2;
        }
        .body {
          position: relative;
          color: var(--mvx-muted);
          line-height: 1.55;
        }
      </style>
      <article part="panel" class="edge">
        ${title || eyebrow ? `<header>${eyebrow ? `<div class="eyebrow">${htmlEscape(eyebrow)}</div>` : ''}${title ? `<h3>${htmlEscape(title)}</h3>` : ''}</header>` : ''}
        <div class="body"><slot></slot></div>
      </article>
    `;
  }
}
