import { baseStyles, MvxElement, parseData, htmlEscape } from '../../core.js';

function toArray(value, fallback = []) {
  if (Array.isArray(value)) return value;
  return parseData(value, fallback);
}

function cellValue(row, column) {
  const value = row?.[column.key];
  if (typeof column.render === 'function') return column.render(value, row, column);
  return value ?? '';
}

export class MvxDataTable extends MvxElement {
  static observedAttributes = [
    'columns',
    'data',
    'filterable',
    'selectable',
    'expandable',
    'tree',
    'column-toggle',
    'sticky-header',
    'pin-columns',
    'pin-rows',
    'density',
    'caption'
  ];

  constructor() {
    super();
    this._sortKey = null;
    this._sortDir = 1;
    this._filter = '';
    this._columnFilters = {};
    this._expanded = new Set();
    this._collapsed = new Set();
    this._hiddenColumns = new Set();
  }

  set data(value) {
    this._data = value;
    if (this.isConnected) this.render();
  }

  set columns(value) {
    this._columns = value;
    if (this.isConnected) this.render();
  }

  get columns() {
    return toArray(this._columns ?? this.getAttribute('columns'), []);
  }

  get rows() {
    return toArray(this._data ?? this.getAttribute('data'), []);
  }

  get visibleColumns() {
    return this.columns.filter(column => !column.hidden && !this._hiddenColumns.has(column.key));
  }

  get pinnedColumnCount() {
    const explicit = Number(this.getAttribute('pin-columns') || 0);
    if (Number.isFinite(explicit) && explicit > 0) return explicit;
    return this.visibleColumns.filter(column => column.pinned || column.fixed).length;
  }

  get pinnedRowCount() {
    const explicit = Number(this.getAttribute('pin-rows') || 0);
    return Number.isFinite(explicit) ? Math.max(0, explicit) : 0;
  }

  rowId(row, path) {
    return String(row.id ?? row.key ?? path);
  }

  rowMatches(row) {
    const search = this._filter.trim().toLowerCase();
    const globalMatch = !search || Object.values(row)
      .filter(value => typeof value !== 'object')
      .join(' ')
      .toLowerCase()
      .includes(search);
    const filtersMatch = Object.entries(this._columnFilters).every(([key, value]) => {
      const filter = String(value || '').trim().toLowerCase();
      if (!filter) return true;
      return String(row[key] ?? '').toLowerCase().includes(filter);
    });
    return globalMatch && filtersMatch;
  }

  filterTree(rows, pathPrefix = '') {
    return rows.reduce((matches, row, index) => {
      const path = pathPrefix ? `${pathPrefix}.${index}` : String(index);
      const children = toArray(row.children, []);
      const filteredChildren = this.filterTree(children, path);
      if (this.rowMatches(row) || filteredChildren.length) {
        matches.push({ ...row, children: filteredChildren, _mvxPath: path });
      }
      return matches;
    }, []);
  }

  sortRows(rows) {
    if (!this._sortKey) return rows;
    return [...rows].sort((a, b) => String(a[this._sortKey] ?? '').localeCompare(String(b[this._sortKey] ?? ''), this.locale, {
      numeric: true,
      sensitivity: 'base'
    }) * this._sortDir).map(row => ({
      ...row,
      children: this.sortRows(toArray(row.children, []))
    }));
  }

  flattenRows(rows, depth = 0, pathPrefix = '') {
    return rows.flatMap((row, index) => {
      const path = row._mvxPath ?? (pathPrefix ? `${pathPrefix}.${index}` : String(index));
      const id = this.rowId(row, path);
      const children = toArray(row.children, []);
      const hasChildren = children.length > 0;
      const hasDetails = Boolean(row.details);
      const expanded = !this._collapsed.has(id) && (this._expanded.has(id) || row.expanded);
      const current = [{ row, depth, path, id, hasChildren, hasDetails, expanded }];
      return hasChildren && expanded ? [...current, ...this.flattenRows(children, depth + 1, path)] : current;
    });
  }

  processedRows() {
    return this.flattenRows(this.sortRows(this.filterTree(this.rows)));
  }

  toggleExpanded(id, row) {
    const isExpanded = !this._collapsed.has(id) && (this._expanded.has(id) || row.expanded);
    if (isExpanded) {
      this._expanded.delete(id);
      this._collapsed.add(id);
    } else {
      this._expanded.add(id);
      this._collapsed.delete(id);
    }
    this.emit('mvx-expand', { row, expanded: !isExpanded });
    this.render();
  }

  toggleColumn(key) {
    if (this._hiddenColumns.has(key)) {
      this._hiddenColumns.delete(key);
    } else {
      this._hiddenColumns.add(key);
    }
    this.emit('mvx-column-toggle', { key, hidden: this._hiddenColumns.has(key) });
    this.render();
  }

  render() {
    const columns = this.visibleColumns;
    const rows = this.processedRows();
    const filterRows = this.t('filterRows', 'Search rows');
    const rowsLabel = this.t('rows', 'rows');
    const noRows = this.t('noRows', 'No rows match the current view.');
    const sortAscending = this.t('sortAscending', 'ascending');
    const sortDescending = this.t('sortDescending', 'descending');
    const caption = this.getAttribute('caption') || this.t('dataTable', 'Data table');
    const pinnedColumnCount = Math.min(this.pinnedColumnCount, columns.length);
    const pinnedRowCount = Math.min(this.pinnedRowCount, rows.length);
    const density = this.getAttribute('density') || 'comfortable';
    const canExpand = this.hasAttribute('expandable') || this.hasAttribute('tree');

    this.shadowRoot.innerHTML = `
      <style>
        ${baseStyles}
        :host { display: block; }
        .wrap {
          overflow: hidden;
          border-radius: var(--mvx-radius-md);
        }
        .tools {
          display: ${(this.hasAttribute('filterable') || this.hasAttribute('column-toggle')) ? 'grid' : 'none'};
          grid-template-columns: minmax(180px, 1fr) auto;
          gap: 10px;
          align-items: center;
          border-block-end: 1px solid var(--mvx-border);
          padding: 12px;
        }
        .search {
          display: ${this.hasAttribute('filterable') ? 'block' : 'none'};
          inline-size: min(420px, 100%);
          border: 1px solid var(--mvx-border);
          border-radius: var(--mvx-radius-sm);
          background: var(--mvx-bg-inset);
          color: var(--mvx-fg);
          padding: 9px 11px;
          outline: none;
        }
        input:focus {
          border-color: var(--mvx-accent);
          box-shadow: var(--mvx-focus);
        }
        .meta {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          align-items: center;
          justify-content: end;
          color: var(--mvx-muted);
          font-size: 12px;
        }
        details.columns {
          position: relative;
        }
        details.columns summary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          min-block-size: 32px;
          border: 1px solid var(--mvx-border);
          border-radius: var(--mvx-radius-sm);
          background: var(--mvx-bg-inset);
          color: var(--mvx-fg);
          cursor: pointer;
          padding: 0 10px;
          list-style: none;
        }
        details.columns summary::-webkit-details-marker { display: none; }
        .column-menu {
          position: absolute;
          inset-block-start: calc(100% + 6px);
          inset-inline-end: 0;
          z-index: 8;
          display: grid;
          gap: 6px;
          min-inline-size: 220px;
          border: 1px solid var(--mvx-border);
          border-radius: var(--mvx-radius-sm);
          background: var(--mvx-bg-panel);
          box-shadow: var(--mvx-shadow-raised);
          padding: 8px;
        }
        .column-menu label {
          display: flex;
          gap: 8px;
          align-items: center;
          color: var(--mvx-muted);
          font-size: 13px;
        }
        .scroll {
          max-block-size: min(68vh, 720px);
          overflow: auto;
        }
        table {
          inline-size: 100%;
          border-collapse: separate;
          border-spacing: 0;
          min-inline-size: 760px;
        }
        caption {
          position: absolute;
          inline-size: 1px;
          block-size: 1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
        }
        th, td {
          border-block-end: 1px solid var(--mvx-border);
          padding: ${density === 'compact' ? '8px 10px' : density === 'spacious' ? '15px 14px' : '12px'};
          text-align: start;
          vertical-align: middle;
          font-size: 14px;
          background: var(--mvx-bg-panel);
        }
        th {
          color: var(--mvx-muted);
          background: color-mix(in srgb, var(--mvx-bg-inset) 72%, var(--mvx-bg-panel));
          font-size: 12px;
          text-transform: uppercase;
        }
        :host([sticky-header]) thead th {
          position: sticky;
          inset-block-start: 0;
          z-index: 4;
        }
        :host([sticky-header]) thead .filter-row th {
          inset-block-start: 43px;
        }
        th button {
          display: inline-flex;
          gap: 6px;
          align-items: center;
          border: 0;
          background: transparent;
          color: inherit;
          cursor: pointer;
          padding: 0;
          text-transform: inherit;
        }
        th button[aria-sort="ascending"]::after { content: "↑"; }
        th button[aria-sort="descending"]::after { content: "↓"; }
        .filter-row input {
          inline-size: 100%;
          min-inline-size: 90px;
          border: 1px solid var(--mvx-border);
          border-radius: var(--mvx-radius-xs);
          background: var(--mvx-bg-inset);
          color: var(--mvx-fg);
          padding: 6px 7px;
          outline: none;
          text-transform: none;
        }
        tbody tr {
          transition: background var(--mvx-duration-fast);
        }
        :host([selectable]) tbody tr {
          cursor: pointer;
        }
        tbody tr:hover td {
          background: color-mix(in srgb, var(--mvx-accent) 9%, var(--mvx-bg-panel));
        }
        .pinned-col {
          position: sticky;
          z-index: 3;
          box-shadow: 1px 0 0 var(--mvx-border);
        }
        thead .pinned-col {
          z-index: 5;
        }
        .pinned-row td {
          position: sticky;
          z-index: 2;
          background: color-mix(in srgb, var(--mvx-accent) 9%, var(--mvx-bg-panel));
        }
        .pinned-row .pinned-col {
          z-index: 6;
        }
        .tree-cell {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .expander {
          display: inline-grid;
          place-items: center;
          inline-size: 24px;
          block-size: 24px;
          border: 1px solid var(--mvx-border);
          border-radius: var(--mvx-radius-xs);
          background: var(--mvx-bg-inset);
          color: var(--mvx-fg);
          cursor: pointer;
        }
        .expander[aria-expanded="true"] {
          border-color: var(--mvx-accent);
          color: var(--mvx-accent-2);
        }
        .indent {
          display: inline-block;
          flex: 0 0 auto;
        }
        .empty {
          padding: 28px;
          color: var(--mvx-muted);
          text-align: center;
        }
        @media (max-width: 720px) {
          .tools { grid-template-columns: 1fr; }
          .meta { justify-content: start; }
        }
      </style>
      <section class="wrap edge" part="table">
        <div class="tools">
          <input class="search" part="filter" placeholder="${htmlEscape(filterRows)}" aria-label="${htmlEscape(filterRows)}" value="${htmlEscape(this._filter)}" />
          <div class="meta">
            <span>${rows.length} ${htmlEscape(rowsLabel)}</span>
            ${this.hasAttribute('column-toggle') ? `
              <details class="columns">
                <summary>${htmlEscape(this.t('columns', 'Columns'))}</summary>
                <div class="column-menu">
                  ${this.columns.map(column => `
                    <label>
                      <input type="checkbox" data-column-toggle="${htmlEscape(column.key)}" ${this._hiddenColumns.has(column.key) || column.hidden ? '' : 'checked'} ${column.locked ? 'disabled' : ''} />
                      <span>${htmlEscape(column.label || column.key)}</span>
                    </label>
                  `).join('')}
                </div>
              </details>
            ` : ''}
          </div>
        </div>
        <div class="scroll">
          ${rows.length && columns.length ? `
            <table role="grid">
              <caption>${htmlEscape(caption)}</caption>
              <thead>
                <tr>
                  ${columns.map((column, index) => `
                    <th class="${index < pinnedColumnCount ? 'pinned-col' : ''}" style="${this.columnStyle(index, pinnedColumnCount, columns)}">
                      <button data-sort="${htmlEscape(column.key)}" aria-sort="${this.sortState(column.key)}">
                        ${htmlEscape(column.label || column.key)}
                      </button>
                    </th>
                  `).join('')}
                </tr>
                ${this.hasAttribute('filterable') ? `
                  <tr class="filter-row">
                    ${columns.map((column, index) => `
                      <th class="${index < pinnedColumnCount ? 'pinned-col' : ''}" style="${this.columnStyle(index, pinnedColumnCount, columns)}">
                        <input data-column-filter="${htmlEscape(column.key)}" value="${htmlEscape(this._columnFilters[column.key] || '')}" aria-label="${htmlEscape((column.label || column.key) + ' filter')}" />
                      </th>
                    `).join('')}
                  </tr>
                ` : ''}
              </thead>
              <tbody>
                ${rows.map((entry, index) => this.renderRow(entry, index, columns, pinnedColumnCount, pinnedRowCount, canExpand)).join('')}
              </tbody>
            </table>
          ` : `<div class="empty">${htmlEscape(noRows)}</div>`}
        </div>
      </section>
    `;

    this.shadowRoot.querySelector('.search')?.addEventListener('input', event => {
      this._filter = event.target.value;
      this.emit('mvx-filter', { value: this._filter, columnFilters: this._columnFilters });
      this.render();
    });
    this.shadowRoot.querySelectorAll('[data-column-filter]').forEach(input => {
      input.addEventListener('input', event => {
        this._columnFilters[event.target.dataset.columnFilter] = event.target.value;
        this.emit('mvx-filter', { value: this._filter, columnFilters: this._columnFilters });
        this.render();
      });
    });
    this.shadowRoot.querySelectorAll('[data-column-toggle]').forEach(input => {
      input.addEventListener('change', event => this.toggleColumn(event.target.dataset.columnToggle));
    });
    this.shadowRoot.querySelectorAll('[data-sort]').forEach(button => {
      button.addEventListener('click', () => {
        const key = button.getAttribute('data-sort');
        this._sortDir = this._sortKey === key ? this._sortDir * -1 : 1;
        this._sortKey = key;
        this.emit('mvx-sort', { key, direction: this._sortDir > 0 ? 'ascending' : 'descending' });
        this.render();
      });
    });
    this.shadowRoot.querySelectorAll('[data-expand]').forEach(button => {
      button.addEventListener('click', event => {
        event.stopPropagation();
        const entry = rows.find(item => item.id === button.dataset.expand);
        if (entry) this.toggleExpanded(entry.id, entry.row);
      });
    });
    this.shadowRoot.querySelectorAll('tbody tr[data-index]').forEach(row => {
      row.addEventListener('click', () => {
        const entry = rows[Number(row.dataset.index)];
        if (this.hasAttribute('selectable')) this.emit('mvx-select', { row: entry.row, index: Number(row.dataset.index), path: entry.path });
      });
    });
    this.shadowRoot.querySelectorAll('button, summary').forEach(control => this.wirePointerMotion(control));
  }

  sortState(key) {
    if (this._sortKey !== key) return 'none';
    return this._sortDir > 0 ? 'ascending' : 'descending';
  }

  columnStyle(index, pinnedCount, columns) {
    const column = columns[index];
    const width = column.width ? `inline-size:${htmlEscape(column.width)};min-inline-size:${htmlEscape(column.width)};` : '';
    if (index >= pinnedCount) return width;
    const left = columns.slice(0, index).reduce((total, item) => total + Number.parseInt(item.width || '160', 10), 0);
    return `${width}inset-inline-start:${left}px;`;
  }

  renderRow(entry, index, columns, pinnedColumnCount, pinnedRowCount, canExpand) {
    const rowPinned = index < pinnedRowCount;
    const top = rowPinned ? `style="inset-block-start:${(this.hasAttribute('filterable') ? 86 : 43) + index * 43}px;"` : '';
    return `
      <tr data-index="${index}" class="${rowPinned ? 'pinned-row' : ''}">
        ${columns.map((column, columnIndex) => {
          const isFirst = columnIndex === 0;
          const pinned = columnIndex < pinnedColumnCount;
          const content = isFirst && canExpand ? `
            <span class="tree-cell" style="padding-inline-start:${entry.depth * 18}px">
              ${entry.hasChildren || entry.hasDetails ? `<button class="expander" data-expand="${htmlEscape(entry.id)}" aria-label="${htmlEscape(entry.expanded ? this.t('collapseRow', 'Collapse row') : this.t('expandRow', 'Expand row'))}" aria-expanded="${entry.expanded}">${entry.expanded ? '-' : '+'}</button>` : '<span class="indent" style="inline-size:24px"></span>'}
              <span>${htmlEscape(cellValue(entry.row, column))}</span>
            </span>
          ` : htmlEscape(cellValue(entry.row, column));
          return `<td part="cell" class="${pinned ? 'pinned-col' : ''}" ${rowPinned ? top : ''} style="${this.columnStyle(columnIndex, pinnedColumnCount, columns)}">${content}</td>`;
        }).join('')}
      </tr>
      ${entry.expanded && entry.row.details ? `
        <tr class="detail-row">
          <td colspan="${columns.length}">${htmlEscape(entry.row.details)}</td>
        </tr>
      ` : ''}
    `;
  }
}
