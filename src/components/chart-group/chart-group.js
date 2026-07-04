import { baseStyles, htmlEscape, MvxElement, parseData } from '../../core.js';

function cssLength(value, fallback) {
  const raw = String(value ?? '').trim();
  if (!raw) return fallback;
  if (/^-?\d+(\.\d+)?$/.test(raw)) return `${Math.max(0, Number(raw))}px`;
  return raw;
}

function chartAttributeString(chart) {
  return Object.entries(chart || {})
    .filter(([name, value]) => value !== undefined && value !== null && value !== false && !['children', 'content'].includes(name))
    .map(([name, value]) => {
      const attr = name.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`);
      if (value === true) return attr;
      return `${attr}="${htmlEscape(typeof value === 'string' ? value : JSON.stringify(value))}"`;
    })
    .join(' ');
}

export class MvxChartGroup extends MvxElement {
  static observedAttributes = ['title', 'subtitle', 'eyebrow', 'charts', 'columns', 'min-column-width', 'gap', 'density', 'variant', 'chart-height', 'responsive'];

  set charts(value) {
    this._charts = value;
    if (this.isConnected) this.render();
  }

  get charts() {
    return parseData(this._charts ?? this.getAttribute('charts'), []);
  }

  render() {
    const title = this.getAttribute('title') || '';
    const subtitle = this.getAttribute('subtitle') || '';
    const eyebrow = this.getAttribute('eyebrow') || '';
    const columns = Math.max(1, Number(this.getAttribute('columns') || 2) || 2);
    const minColumn = cssLength(this.getAttribute('min-column-width'), '260px');
    const gap = cssLength(this.getAttribute('gap'), this.getAttribute('density') === 'compact' ? '10px' : '14px');
    const chartHeight = this.getAttribute('chart-height') || '';
    const charts = this.charts;
    const hasMeta = title || subtitle || eyebrow || this.querySelector('[slot="actions"]');
    const renderedCharts = charts.length
      ? charts.map((chart, index) => `<mvx-chart ${chartAttributeString({ height: chartHeight || undefined, ...chart })} data-group-index="${index}"></mvx-chart>`).join('')
      : '<slot></slot>';

    this.shadowRoot.innerHTML = `
      <style>
        ${baseStyles}
        :host {
          display: block;
          inline-size: 100%;
        }
        .group {
          display: grid;
          gap: ${gap};
          inline-size: 100%;
          border-radius: var(--mvx-radius-md);
          padding: ${this.getAttribute('density') === 'compact' ? '12px' : '16px'};
        }
        :host([variant="plain"]) .group {
          border: 0;
          background: transparent;
          box-shadow: none;
          padding: 0;
        }
        header {
          display: ${hasMeta ? 'flex' : 'none'};
          flex-wrap: wrap;
          gap: 10px 16px;
          align-items: end;
          justify-content: space-between;
          min-inline-size: 0;
        }
        .copy {
          display: grid;
          gap: 4px;
          min-inline-size: min(100%, 260px);
        }
        .eyebrow {
          color: var(--mvx-accent-2);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0;
          text-transform: uppercase;
        }
        h3,
        p {
          margin: 0;
        }
        h3 {
          color: var(--mvx-fg);
          font-size: ${this.getAttribute('density') === 'compact' ? '15px' : '17px'};
          line-height: 1.25;
        }
        p {
          color: var(--mvx-muted);
          font-size: 12px;
          line-height: 1.45;
        }
        .actions {
          display: inline-flex;
          flex-wrap: wrap;
          gap: 8px;
          align-items: center;
          justify-content: end;
        }
        .charts {
          display: grid;
          grid-template-columns: repeat(${columns}, minmax(0, 1fr));
          gap: ${gap};
          align-items: stretch;
          min-inline-size: 0;
        }
        :host([responsive="auto-fit"]) .charts,
        :host([min-column-width]) .charts {
          grid-template-columns: repeat(auto-fit, minmax(min(100%, ${minColumn}), 1fr));
        }
        ::slotted(mvx-chart),
        .charts > mvx-chart {
          min-inline-size: 0;
        }
        @media (max-width: 960px) {
          .charts {
            grid-template-columns: repeat(${Math.min(columns, 2)}, minmax(0, 1fr));
          }
        }
        @media (max-width: 640px) {
          .group {
            padding: ${this.getAttribute('variant') === 'plain' ? '0' : '12px'};
          }
          .charts {
            grid-template-columns: 1fr;
          }
          header,
          .actions {
            justify-content: start;
          }
        }
      </style>
      <section class="group edge" part="group" aria-label="${htmlEscape(title || eyebrow || 'Chart group')}">
        <header part="header">
          <div class="copy">
            ${eyebrow ? `<span class="eyebrow">${htmlEscape(eyebrow)}</span>` : ''}
            ${title ? `<h3>${htmlEscape(title)}</h3>` : ''}
            ${subtitle ? `<p>${htmlEscape(subtitle)}</p>` : ''}
          </div>
          <div class="actions" part="actions"><slot name="actions"></slot></div>
        </header>
        <div class="charts" part="charts">${renderedCharts}</div>
      </section>
    `;
    this.applyChartDefaults();
  }

  applyChartDefaults() {
    const height = this.getAttribute('chart-height');
    if (!height) return;
    this.shadowRoot.querySelector('slot')?.addEventListener('slotchange', event => {
      event.target.assignedElements().forEach(element => {
        if (element.localName === 'mvx-chart' && !element.hasAttribute('height')) element.setAttribute('height', height);
      });
    });
  }
}
