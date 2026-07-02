import { baseStyles, MvxElement, parseData, htmlEscape } from '../../core.js';

export class MvxKanban extends MvxElement {
  static observedAttributes = ['columns'];

  set columns(value) {
    this._columns = value;
    if (this.isConnected) this.render();
  }

  get columns() {
    return parseData(this._columns ?? this.getAttribute('columns'), []);
  }

  render() {
    const columns = this.columns;
    this.shadowRoot.innerHTML = `
      <style>
        ${baseStyles}
        :host { display: block; }
        .board {
          display: grid;
          grid-template-columns: repeat(${Math.max(columns.length, 1)}, minmax(240px, 1fr));
          gap: 12px;
          overflow: auto;
          padding-block-end: 4px;
        }
        .column {
          min-inline-size: 240px;
          border: 1px solid var(--mvx-border);
          border-radius: var(--mvx-radius-md);
          background: color-mix(in srgb, var(--mvx-bg-panel) 78%, transparent);
          overflow: hidden;
        }
        header {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          border-block-end: 1px solid var(--mvx-border);
          padding: 10px 12px;
          color: var(--mvx-muted);
          font-size: 13px;
          font-weight: 750;
        }
        .cards {
          display: grid;
          gap: 10px;
          padding: 10px;
        }
        .task {
          border: 1px solid var(--mvx-border);
          border-radius: var(--mvx-radius-sm);
          background: var(--mvx-bg-inset);
          padding: 10px;
          cursor: pointer;
          transition: border-color var(--mvx-duration-fast), transform var(--mvx-duration-fast);
        }
        .task:hover {
          border-color: var(--mvx-border-strong);
          transform: translateY(-1px);
        }
        .task strong {
          display: block;
          margin-block-end: 6px;
          font-size: 14px;
        }
        .task span {
          color: var(--mvx-subtle);
          font-size: 12px;
        }
      </style>
      <div class="board" part="board">
        ${columns.map((column, columnIndex) => `
          <section class="column" part="column">
            <header>${htmlEscape(column.title)} <span>${(column.items || []).length}</span></header>
            <div class="cards">
              ${(column.items || []).map((item, itemIndex) => `
                <article class="task" data-column="${columnIndex}" data-item="${itemIndex}">
                  <strong>${htmlEscape(item.title || item)}</strong>
                  ${item.meta ? `<span>${htmlEscape(item.meta)}</span>` : ''}
                </article>
              `).join('')}
            </div>
          </section>
        `).join('')}
      </div>
    `;
    this.shadowRoot.querySelectorAll('.task').forEach(task => {
      task.addEventListener('click', () => {
        const column = Number(task.getAttribute('data-column'));
        const item = Number(task.getAttribute('data-item'));
        this.emit('mvx-select', { column, item: this.columns[column].items[item] });
      });
    });
  }
}
