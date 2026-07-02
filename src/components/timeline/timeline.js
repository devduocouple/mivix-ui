import { baseStyles, MvxElement, parseData, htmlEscape } from '../../core.js';

export class MvxTimeline extends MvxElement {
  static observedAttributes = ['items', 'variant'];

  set items(value) {
    this._items = value;
    if (this.isConnected) this.render();
  }

  get items() {
    return parseData(this._items ?? this.getAttribute('items'), []);
  }

  render() {
    const variant = this.getAttribute('variant') || 'default';
    const compact = variant === 'compact';
    const label = this.getAttribute('label') || this.t('timeline', 'Timeline');
    this.shadowRoot.innerHTML = `
      <style>
        ${baseStyles}
        :host { display: block; }
        ol {
          display: grid;
          gap: ${compact ? '10px' : '14px'};
          margin: 0;
          padding: 0;
          list-style: none;
        }
        li {
          position: relative;
          display: grid;
          grid-template-columns: ${compact ? '18px 1fr' : '28px 1fr'};
          gap: 10px;
          min-block-size: ${compact ? '42px' : '58px'};
        }
        li:not(:last-child)::before {
          content: "";
          position: absolute;
          inset-block-start: ${compact ? '18px' : '24px'};
          inset-block-end: -14px;
          inset-inline-start: ${compact ? '8px' : '13px'};
          border-inline-start: 1px solid var(--mvx-border);
        }
        .dot {
          position: relative;
          z-index: 1;
          display: grid;
          place-items: center;
          inline-size: ${compact ? '18px' : '28px'};
          block-size: ${compact ? '18px' : '28px'};
          border: 1px solid color-mix(in srgb, var(--mvx-accent) 44%, var(--mvx-border));
          border-radius: 999px;
          background: var(--mvx-bg-inset);
          color: var(--mvx-accent-2);
          font-size: 10px;
        }
        .content {
          display: grid;
          gap: 4px;
          padding-block-start: ${compact ? '0' : '3px'};
        }
        time {
          color: var(--mvx-accent-2);
          font-size: 11px;
          font-weight: 750;
          text-transform: uppercase;
        }
        strong { font-size: 14px; }
        p {
          margin: 0;
          color: var(--mvx-muted);
          font-size: 13px;
          line-height: 1.45;
        }
      </style>
      <ol part="timeline" aria-label="${htmlEscape(label)}">
        ${this.items.map((item, index) => `
          <li>
            <span class="dot" aria-hidden="true">${htmlEscape(item.icon || index + 1)}</span>
            <div class="content">
              ${item.time ? `<time>${htmlEscape(item.time)}</time>` : ''}
              <strong>${htmlEscape(item.title)}</strong>
              ${item.description ? `<p>${htmlEscape(item.description)}</p>` : ''}
            </div>
          </li>
        `).join('')}
      </ol>
    `;
  }
}
