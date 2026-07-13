import { baseStyles, MvxElement, parseData, htmlEscape } from '../../core.js';

function toArray(value, fallback = []) {
  if (Array.isArray(value)) return value;
  return parseData(value, fallback);
}

function isTableRow(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function cellValue(row, column) {
  const value = row?.[column.key];
  if (typeof column.render === 'function') return column.render(value, row, column);
  return value ?? '';
}

function parseSelection(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return [];
    const parsed = parseData(trimmed, null);
    if (Array.isArray(parsed)) return parsed;
    return trimmed.split(',').map(item => item.trim()).filter(Boolean);
  }
  return [];
}

function parseSortValue(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'number' || typeof value === 'boolean') return value;
  if (value instanceof Date) return value.getTime();
  if (typeof value === 'string') {
    const normalized = value.trim();
    if (!normalized) return '';
    const parsedNumber = Number(normalized.replace(/,/g, ''));
    if (Number.isFinite(parsedNumber) && String(parsedNumber) === normalized.replace(/,/g, '')) return parsedNumber;
    const parsedDate = Date.parse(normalized);
    if (Number.isFinite(parsedDate) && /\d{4}-\d{1,2}-\d{1,2}/.test(normalized)) return parsedDate;
    return normalized.toLowerCase();
  }
  return String(value).toLowerCase();
}

function compareSortValue(left, right, locale) {
  const a = parseSortValue(left);
  const b = parseSortValue(right);
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  if (typeof a === 'boolean' && typeof b === 'boolean') return Number(a) - Number(b);
  return String(a).localeCompare(String(b), locale, { numeric: true, sensitivity: 'base' });
}

function cellText(row, column) {
  const raw = cellValue(row, column);
  if (raw === null || raw === undefined) return '';
  if (typeof raw === 'boolean') return raw ? 'true' : 'false';
  if (typeof raw === 'number') return String(raw);
  return String(raw);
}

function parseColumnWidth(column) {
  const width = Number.parseInt(column.width || '160', 10);
  return Number.isFinite(width) ? width : 160;
}

function columnLeftOffset(index, columns) {
  return columns.slice(0, index).reduce((total, item) => total + parseColumnWidth(item), 0);
}

function highlightInText(text, terms = []) {
  const normalized = String(text ?? '');
  if (!normalized || !terms.length) return htmlEscape(normalized);
  const lowered = normalized.toLowerCase();
  const ranges = terms
    .map(term => String(term ?? '').trim().toLowerCase())
    .filter(Boolean)
    .filter((term, index, list) => list.indexOf(term) === index)
    .reduce((all, term) => {
      let from = 0;
      while (from <= lowered.length) {
        const start = lowered.indexOf(term, from);
        if (start === -1) break;
        all.push([start, start + term.length]);
        from = start + Math.max(1, term.length);
      }
      return all;
    }, []);
  if (!ranges.length) return htmlEscape(normalized);
  ranges.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const merged = ranges.reduce((all, [start, end]) => {
    const last = all[all.length - 1];
    if (!last || start > last[1]) {
      all.push([start, end]);
      return all;
    }
    last[1] = Math.max(last[1], end);
    return all;
  }, []);
  return merged.reduce((html, [start, end], index) => {
    const cursor = index === 0 ? 0 : merged[index - 1][1];
    return html + htmlEscape(normalized.slice(cursor, start)) + `<mark class="mvx-highlight">${htmlEscape(normalized.slice(start, end))}</mark>`;
  }, '') + htmlEscape(normalized.slice(merged[merged.length - 1][1]));
}

export class MvxDataTable extends MvxElement {
  static observedAttributes = [
    'columns',
    'data',
    'searchable',
    'filterable',
    'selectable',
    'selection-mode',
    'selected',
    'expandable',
    'tree',
    'column-toggle',
    'sticky-header',
    'pin-columns',
    'pin-rows',
    'density',
    'caption',
    'label',
    'highlight-color',
    'page',
    'page-size'
  ];

  constructor() {
    super();
    this._sortKey = null;
    this._sortDir = 0;
    this._filter = '';
    this._columnFilters = {};
    this._columnSearches = {};
    this._activeColumnSearch = null;
    this._activeColumnFilter = null;
    this._expanded = new Set();
    this._collapsed = new Set();
    this._hiddenColumns = new Set();
    this._selected = new Set();
  }

  connectedCallback() {
    this._selected = new Set(parseSelection(this.getAttribute('selected')).map((value) => String(value)));
    super.connectedCallback();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'selected' && oldValue !== newValue) {
      const next = new Set(parseSelection(newValue).map((value) => String(value)));
      const same = next.size === this._selected.size && [...next].every(value => this._selected.has(value));
      this._selected = next;
      if (!same && this.isConnected) {
        this.render();
      }
    }
    super.attributeChangedCallback(name, oldValue, newValue);
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

  get selectionMode() {
    return this.getAttribute('selection-mode') === 'multiple' ? 'multiple' : 'single';
  }

  get searchable() {
    return this.hasAttribute('searchable');
  }

  get hasColumnQueriesEnabled() {
    return this.hasAttribute('filterable');
  }

  get highlightColor() {
    return (
      this.getAttribute('highlight-color') ||
      'color-mix(in srgb, var(--mvx-accent) 24%, color-mix(in srgb, var(--mvx-bg-panel) 84%, transparent))'
    );
  }

  get page() {
    const raw = Number(this.getAttribute('page') || 1);
    if (!Number.isFinite(raw)) return 1;
    return Math.max(1, Math.floor(raw));
  }

  set page(value) {
    const next = Number.isFinite(Number(value)) ? Math.max(1, Math.floor(Number(value))) : 1;
    if (this.page !== next) {
      this.setAttribute('page', String(next));
    }
  }

  get pageSize() {
    const raw = Number(this.getAttribute('page-size') || 0);
    if (!Number.isFinite(raw) || raw <= 0) return 0;
    return Math.max(1, Math.floor(raw));
  }

  set selected(value) {
    this._selected = new Set(parseSelection(value).map(item => String(item).trim()).filter(Boolean));
    this.syncSelectedAttribute();
    if (this.isConnected) this.render();
  }

  get selected() {
    return [...this._selected];
  }

  get selectionEnabled() {
    return this.hasAttribute('selectable');
  }

  rowId(row, path) {
    return String(row?.id ?? row?.key ?? path);
  }

  rowMatches(row) {
    const safeRow = isTableRow(row) ? row : {};
    const search = this._filter.trim().toLowerCase();
    const searchable = this.searchable;
    const columnQueries = this.hasColumnQueriesEnabled;
    const visibleColumnsByKey = this.columns.reduce((acc, column) => {
      if (column?.key !== undefined && column.key !== null) {
        acc[String(column.key)] = column;
      }
      return acc;
    }, {});
    const globalMatch = !searchable || !search || Object.values(safeRow)
      .filter(value => typeof value !== 'object')
      .join(' ')
      .toLowerCase()
      .includes(search);
    const filtersMatch = !columnQueries || Object.entries(this._columnFilters).every(([key, value]) => {
      const filter = String(value || '').trim().toLowerCase();
      if (!filter) return true;
      const valueText = cellText(safeRow, visibleColumnsByKey[key] || { key });
      return valueText.toLowerCase().includes(filter);
    });
    const searchMatch = !columnQueries || Object.entries(this._columnSearches).every(([key, value]) => {
      const term = String(value || '').trim().toLowerCase();
      if (!term) return true;
      const valueText = cellText(safeRow, visibleColumnsByKey[key] || { key });
      return valueText.toLowerCase().includes(term);
    });
    return globalMatch && filtersMatch && searchMatch;
  }

  filterTree(rows, pathPrefix = '') {
    return rows
      .filter(isTableRow)
      .reduce((matches, row, index) => {
      const path = row._mvxPath ?? (pathPrefix ? `${pathPrefix}.${index}` : String(index));
      const children = toArray(row.children, []);
      const filteredChildren = this.filterTree(children, path);
      if (this.rowMatches(row) || filteredChildren.length) {
        matches.push({ ...row, children: filteredChildren, _mvxPath: path });
      }
      return matches;
    }, []);
  }

  sortRows(rows) {
    if (!this._sortKey || this._sortDir === 0) return rows;
    return [...rows].sort((a, b) => compareSortValue(a?.[this._sortKey], b?.[this._sortKey], this.locale) * this._sortDir).map(row => ({
      ...(isTableRow(row) ? row : {}),
      children: this.sortRows(toArray(isTableRow(row) ? row.children : null, []))
    }));
  }

  sortState(key) {
      if (this._sortKey !== key) return 'none';
    if (this._sortDir === 1) return 'ascending';
    if (this._sortDir === -1) return 'descending';
    return 'none';
  }

  sortIcon(key) {
    const state = this.sortState(key);
    if (state === 'ascending') return '↑';
    if (state === 'descending') return '↓';
    return '↕';
  }

  setColumnQueryMode(columnKey, mode) {
    if (mode === 'search') {
      this._activeColumnSearch = this._activeColumnSearch === columnKey ? null : columnKey;
      this._activeColumnFilter = null;
      return;
    }
    if (mode === 'filter') {
      this._activeColumnFilter = this._activeColumnFilter === columnKey ? null : columnKey;
      this._activeColumnSearch = null;
      return;
    }
    this._activeColumnSearch = null;
    this._activeColumnFilter = null;
  }

  getActiveQueryRowType() {
    if (this._activeColumnSearch) return 'search';
    if (this._activeColumnFilter) return 'filter';
    return '';
  }

  getActiveQueryColumn() {
    return this._activeColumnSearch || this._activeColumnFilter || null;
  }

  getCellQueries(columnKey) {
    const terms = [];
    if (this.searchable && this._filter.trim()) {
      terms.push(this._filter.trim());
    }
    if (this.hasColumnQueriesEnabled) {
      const filter = this._columnFilters[columnKey];
      if (filter && String(filter).trim()) {
        terms.push(String(filter).trim());
      }
    }
    const columnSearch = this._columnSearches[columnKey];
    if (columnSearch && columnSearch.trim()) terms.push(columnSearch.trim());
    return terms;
  }

  flattenRows(rows, depth = 0, pathPrefix = '', includeNested = true) {
    return rows
      .filter(isTableRow)
      .flatMap((row, index) => {
      const path = row._mvxPath ?? (pathPrefix ? `${pathPrefix}.${index}` : String(index));
      const id = this.rowId(row, path);
      const children = includeNested ? toArray(row.children, []) : [];
      const hasChildren = children.length > 0;
      const hasDetails = Boolean(row.details);
      const expanded = !this._collapsed.has(id) && (this._expanded.has(id) || row.expanded);
      const current = [{ row, depth, path, id, hasChildren, hasDetails, expanded }];
      return hasChildren && expanded ? [...current, ...this.flattenRows(children, depth + 1, path, includeNested)] : current;
    });
  }

  processedRows() {
    const filtered = this.filterTree(toArray(this.rows, []).filter(isTableRow));
    const sorted = this.sortRows(filtered);
    const includeNested = this.hasAttribute('tree') || this.hasAttribute('expandable');
    const rows = includeNested
      ? this.flattenRows(sorted, 0, '', true)
      : sorted.map((entry, index) => ({
          row: entry,
          depth: 0,
          path: entry._mvxPath ?? String(index),
          id: this.rowId(entry, entry._mvxPath ?? String(index)),
          hasChildren: toArray(entry.children, []).length > 0,
          hasDetails: Boolean(entry.details),
          expanded: Boolean(entry.expanded),
          _mvxPath: entry._mvxPath ?? String(index),
          _mvxIndex: entry._mvxIndex ?? index
        }));
    return rows.map((entry, index) => ({ ...entry, _mvxIndex: index }));
  }

  getPaginationState(totalRows) {
    const pageSize = this.pageSize;
    if (!pageSize) return { page: 1, pageCount: 1, pageSize: 0, start: 0 };
    const pageCount = Math.max(1, Math.ceil(Math.max(0, totalRows) / pageSize));
    const page = Math.max(1, Math.min(pageCount, this.page));
    return { page, pageCount, pageSize, start: (page - 1) * pageSize };
  }

  paginatedRows(rows) {
    const state = this.getPaginationState(rows.length);
    if (!state.pageSize) return { rows, pageState: state };
    const end = Math.min(state.start + state.pageSize, rows.length);
    return { rows: rows.slice(state.start, end), pageState: state };
  }

  get selectedEntries() {
    const all = this.processedRows();
    return all
      .filter(entry => this._selected.has(entry.id))
      .map(entry => ({ id: entry.id, row: entry.row, path: entry.path, index: entry._mvxIndex }));
  }

  syncSelectedAttribute() {
    const next = this._selected.size ? [...this._selected].join(',') : '';
    const current = this.getAttribute('selected') || '';
    if (next && current !== next) {
      this.setAttribute('selected', next);
      return;
    }
    if (!next && this.hasAttribute('selected')) {
      this.removeAttribute('selected');
    }
  }

  emitSelection(entry, visibleIndex, source, selected) {
    const selectedEntries = this.selectedEntries;
    this.emit('mvx-select', {
      row: entry?.row || null,
      index: entry?._mvxIndex ?? -1,
      visibleIndex,
      path: entry?.path || null,
      id: entry?.id || null,
      selected,
      source,
      selectedCount: selectedEntries.length,
      selectedIds: [...this._selected],
      selectedEntries
    });
  }

  setAllSelection(rows, checked) {
    if (this.selectionMode !== 'multiple') return;
    rows.forEach(entry => {
      if (checked) this._selected.add(entry.id);
      else this._selected.delete(entry.id);
    });
    this.syncSelectedAttribute();
    this.emit('mvx-select', {
      row: null,
      index: -1,
      visibleIndex: -1,
      path: null,
      id: null,
      selected: checked,
      source: 'select-all',
      selectedCount: this.selectedEntries.length,
      selectedIds: [...this._selected],
      selectedEntries: this.selectedEntries
    });
  }

  setRowSelection(entry, visibleIndex, checked) {
    if (!entry) return;
    const has = this._selected.has(entry.id);
    const shouldSelect = checked == null ? !has : checked;

    if (this.selectionMode === 'multiple') {
      if (shouldSelect) this._selected.add(entry.id);
      else this._selected.delete(entry.id);
    } else {
      if (shouldSelect) {
        this._selected = new Set([entry.id]);
      } else {
        this._selected = new Set(this._selected);
        this._selected.delete(entry.id);
      }
    }

    this.syncSelectedAttribute();
    this.emitSelection(entry, visibleIndex, this.selectionMode === 'multiple' ? 'toggle' : 'single', shouldSelect);
  }

  toggleExpanded(id, row) {
    const isExpanded = !this._collapsed.has(id) && (this._expanded.has(id) || Boolean(row?.expanded));
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
    const dataColumns = this.visibleColumns;
    const allRows = this.processedRows();
    const totalRows = allRows.length;
    const { rows, pageState } = this.paginatedRows(allRows);
    const hasPagination = this.pageSize > 0 && totalRows > 0;
    const hasTools = this.searchable || this.hasAttribute('filterable') || this.hasAttribute('column-toggle') || hasPagination || this.selectionEnabled;
    const selectionEnabled = this.selectionEnabled;
    const multipleSelection = this.selectionMode === 'multiple';
    const hasFilter = this.hasAttribute('filterable');
    const showPage = this.pageSize > 0;
    const density = this.getAttribute('density') || 'comfortable';
    const rowHeight = density === 'compact' ? 38 : density === 'spacious' ? 50 : 44;
    const hasRows = rows.length > 0;
    const filterRows = this.t('filterRows', 'Search rows');
    const searchRows = this.t('searchRows', 'Search rows');
    const rowsLabel = this.t('rows', 'rows');
    const noRows = this.t('noRows', 'No rows match the current view.');
    const sortAscending = this.t('sortAscending', 'ascending');
    const sortDescending = this.t('sortDescending', 'descending');
    const defaultLabel = this.t('dataTable', 'Data table');
    const caption = this.getAttribute('caption') || defaultLabel;
    const label = this.getAttribute('label') || caption;
    const selectedCount = this._selected.size;
    const selectedOnPage = rows.filter(entry => this._selected.has(entry.id));
    const allPageSelected = hasRows && selectedOnPage.length === rows.length;
    const somePageSelected = selectedOnPage.length > 0;
    const pageLabel = this.t('page', 'Page');
    const pagesLabel = this.t('pages', 'pages');
    const nextPage = this.t('nextPage', 'Next page');
    const previousPage = this.t('previousPage', 'Previous page');

    const renderedColumns = [
      ...(selectionEnabled ? [{ key: '__mvx_select__', width: '42px', _mvxSelection: true }] : []),
      ...dataColumns
    ];
    const pinnedCount = Math.min(this.pinnedColumnCount, dataColumns.length);
    const pinnedRowCount = Math.min(this.pinnedRowCount, rows.length);
    const canExpand = this.hasAttribute('expandable') || this.hasAttribute('tree');
    const firstDataColumnIndex = selectionEnabled ? 1 : 0;
    const queryMode = this.getActiveQueryRowType();
    const queryColumn = this.getActiveQueryColumn();
    const hasQueryRow = queryMode && queryColumn;
    const queryOffset = hasQueryRow ? `${rowHeight}px` : '0px';

    this.shadowRoot.innerHTML = `
      <style>
        ${baseStyles}
        :host {
          display: block;
          --mvx-highlight-color: ${this.highlightColor};
          --mvx-query-row-offset: ${queryOffset};
        }
        .table-label {
          padding: 12px 12px 0;
          color: var(--mvx-fg);
          font-size: 13px;
          font-weight: 600;
        }
        .wrap {
          overflow: hidden;
          border-radius: var(--mvx-radius-md);
        }
        .tools {
          display: ${hasTools ? 'grid' : 'none'};
          grid-template-columns: minmax(180px, 1fr) auto;
          gap: 10px;
          align-items: center;
          border-block-end: 1px solid var(--mvx-border);
          padding: 12px;
        }
        .search-wrap {
          position: relative;
          display: ${this.searchable ? 'inline-block' : 'none'};
          inline-size: min(420px, 100%);
          color: var(--mvx-fg);
        }
        .search-wrap .search-icon {
          position: absolute;
          inset-block-start: 50%;
          inset-inline-start: 10px;
          transform: translateY(-50%);
          color: var(--mvx-muted);
          pointer-events: none;
          opacity: 0.95;
          line-height: 0;
        }
        .search-wrap .search-icon::part(icon),
        .search-wrap .search-icon svg {
          inline-size: 14px;
          block-size: 14px;
        }
        .search {
          display: block;
          inline-size: 100%;
          border: 1px solid var(--mvx-border);
          border-radius: var(--mvx-radius-sm);
          background: var(--mvx-bg-inset);
          color: var(--mvx-fg);
          padding: 9px 11px 9px 32px;
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
        .column-menu label.disabled {
          color: var(--mvx-disabled-fg);
          cursor: not-allowed;
          filter: saturate(0.88);
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
        :host([sticky-header]) thead .query-row th {
          inset-block-start: var(--mvx-query-row-offset);
        }
        .table-head {
          display: inline-flex;
          gap: 8px;
          align-items: center;
          justify-content: space-between;
        }
        .column-title {
          min-width: 0;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .header-tools {
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .header-tool {
          appearance: none;
          border: 0;
          background: transparent;
          color: inherit;
          cursor: pointer;
          padding: 0;
          line-height: 1;
          font-size: 12px;
          min-inline-size: 16px;
          min-block-size: 16px;
        }
        .header-tool.sort-tool {
          min-inline-size: 20px;
          text-align: center;
        }
        .header-tool[aria-pressed="true"] {
          color: var(--mvx-accent);
        }
        button[aria-sort="ascending"]::after {
          content: "↑";
        }
        button[aria-sort="descending"]::after {
          content: "↓";
        }
        button[aria-sort="none"]::after {
          content: "↕";
        }
        th button[data-sort] {
          border: 0;
          background: transparent;
          color: inherit;
          cursor: pointer;
          padding: 0;
          margin: 0;
          text-transform: inherit;
        }
        .query-row input {
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
        tbody tr:hover td {
          background: color-mix(in srgb, var(--mvx-accent) 9%, var(--mvx-bg-panel));
        }
        tbody tr.selected td {
          background: color-mix(in srgb, var(--mvx-accent) 14%, var(--mvx-bg-panel));
        }
        .pager {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .pager button {
          min-inline-size: 28px;
          min-block-size: 28px;
          border: 1px solid var(--mvx-border);
          border-radius: var(--mvx-radius-sm);
          background: var(--mvx-bg-inset);
          color: var(--mvx-fg);
          cursor: pointer;
          padding: 0 8px;
        }
        .pager button:disabled {
          cursor: not-allowed;
          opacity: 0.6;
        }
        :host([selectable]) tbody tr {
          cursor: pointer;
        }
        input[type="checkbox"] {
          margin: 0;
          inline-size: 16px;
          block-size: 16px;
          border: 1px solid var(--mvx-border);
          background: var(--mvx-bg-panel);
          color: var(--mvx-accent-2);
          accent-color: var(--mvx-accent);
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
        .mvx-highlight {
          background: var(--mvx-highlight-color);
          color: var(--mvx-fg);
          border-radius: 2px;
          padding: 0 1px;
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
          ${label ? `<div class="table-label">${htmlEscape(label)}</div>` : ''}
          <div class="tools">
          <div class="search-wrap">
            <mvx-icon class="search-icon" name="search" label="${htmlEscape(this.t('search', 'Search'))}" size="14px" tone="muted"></mvx-icon>
            <input class="search" part="filter" placeholder="${htmlEscape(searchRows)}" aria-label="${htmlEscape(searchRows)}" value="${htmlEscape(this._filter)}" />
          </div>
          <div class="meta">
            <span>${totalRows ? `${totalRows} ${htmlEscape(rowsLabel)}${showPage ? ` · ${pageState.page}/${pageState.pageCount} ${htmlEscape(pagesLabel)}` : ''}` : `0 ${htmlEscape(rowsLabel)}`}</span>
            ${selectionEnabled ? `<span>${selectedCount} / ${totalRows} ${htmlEscape(this.t('selected', 'selected'))}</span>` : ''}
            ${showPage ? `
              <div class="pager" aria-label="${htmlEscape(this.t('pagination', 'Pagination'))}">
                <button type="button" data-page="prev" ${pageState.page <= 1 ? 'disabled' : ''} aria-label="${htmlEscape(previousPage)}">${htmlEscape(this.t('prev', 'Prev'))}</button>
                <span>${pageLabel} ${pageState.page}</span>
                <button type="button" data-page="next" ${pageState.page >= pageState.pageCount ? 'disabled' : ''} aria-label="${htmlEscape(nextPage)}">${htmlEscape(this.t('next', 'Next'))}</button>
              </div>
            ` : ''}
            ${this.hasAttribute('column-toggle') ? `
              <details class="columns">
                <summary>${htmlEscape(this.t('columns', 'Columns'))}</summary>
                <div class="column-menu">
                  ${this.columns.map(column => `
                    <label class="${column.locked ? 'disabled' : ''}">
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
          ${dataColumns.length ? `
              <table role="grid">
              <caption>${htmlEscape(caption)}</caption>
              <thead>
                <tr>
                  ${renderedColumns.map((column, index) => {
                    const isSelection = Boolean(column._mvxSelection);
                    const dataIndex = index - (selectionEnabled ? 1 : 0);
                    const pinned = !isSelection && dataIndex >= 0 && dataIndex < pinnedCount;
                    const style = this.columnStyle(index, pinnedCount, renderedColumns, selectionEnabled);
                    const isFilterActive = queryMode === 'filter' && queryColumn === column.key;
                    const isSearchActive = queryMode === 'search' && queryColumn === column.key;
                    return `<th class="${pinned ? 'pinned-col' : ''}" style="${style}">
                      ${isSelection
                        ? (multipleSelection
                            ? `<input type="checkbox" data-select-all aria-label="${htmlEscape(this.t('selectAll', 'Select all rows on this page'))}" ${allPageSelected ? 'checked' : ''} ${!rows.length ? 'disabled' : ''} />`
                            : '')
                        : `<div class="table-head">
                            <span class="column-title">${htmlEscape(column.label || column.key)}</span>
                            <span class="header-tools">
                              ${hasFilter ? `<button class="header-tool" data-column-search="${htmlEscape(column.key)}" type="button" aria-label="${htmlEscape(this.t('search', 'Search'))}" aria-pressed="${isSearchActive ? 'true' : 'false'}">🔍</button>` : ''}
                              ${hasFilter ? `<button class="header-tool" data-column-filter="${htmlEscape(column.key)}" type="button" aria-label="${htmlEscape(this.t('filter', 'Filter'))}" aria-pressed="${isFilterActive ? 'true' : 'false'}">⚹</button>` : ''}
                              <button class="header-tool sort-tool" data-sort="${htmlEscape(column.key)}" aria-sort="${this.sortState(column.key)}" type="button" aria-label="${htmlEscape(this.t('sort', 'Sort'))}">${this.sortIcon(column.key)}</button>
                            </span>
                          </div>`
                      }
                    </th>`;
                  }).join('')}
                </tr>
                ${hasQueryRow ? `
                  <tr class="query-row">
                    ${renderedColumns.map((column, index) => {
                      const isSelection = Boolean(column._mvxSelection);
                      const dataIndex = index - (selectionEnabled ? 1 : 0);
                      const pinned = !isSelection && dataIndex >= 0 && dataIndex < pinnedCount;
                      const style = this.columnStyle(index, pinnedCount, renderedColumns, selectionEnabled);
                      const showSearchInput = queryMode === 'search' && queryColumn === column.key;
                      const showFilterInput = queryMode === 'filter' && queryColumn === column.key;
                      const filterableLabel = column.label || column.key;
                      return `<th class="${pinned ? 'pinned-col' : ''}" style="${style}">
                        ${showSearchInput ? `<input data-column-search-input="${htmlEscape(column.key)}" value="${htmlEscape(this._columnSearches[column.key] || '')}" aria-label="${htmlEscape('Search ' + filterableLabel)}" />` : ''}
                        ${showFilterInput ? `<input data-column-filter-input="${htmlEscape(column.key)}" value="${htmlEscape(this._columnFilters[column.key] || '')}" aria-label="${htmlEscape('Filter ' + filterableLabel)}" />` : ''}
                      </th>`;
                    }).join('')}
                  </tr>
                ` : ''}
              </thead>
              <tbody>
                ${rows.map((entry, index) => this.renderRow(entry, index, renderedColumns, pinnedCount, pinnedRowCount, canExpand, firstDataColumnIndex, hasQueryRow ? rowHeight : 0)).join('')}
              </tbody>
            </table>
          ` : `<div class="empty">${htmlEscape(noRows)}</div>`}
        </div>
      </section>
    `;

    this.shadowRoot.querySelector('.search')?.addEventListener('input', event => {
      const searchInput = event.target;
      const selectionStart = searchInput.selectionStart ?? 0;
      const selectionEnd = searchInput.selectionEnd ?? selectionStart;
      this._filter = searchInput.value;
      this.emit('mvx-filter', {
        value: this._filter,
        columnFilters: this._columnFilters,
        columnSearches: this._columnSearches
      });
      this.render();
      requestAnimationFrame(() => {
        const restored = this.shadowRoot?.querySelector('.search');
        if (restored) {
          restored.focus();
          const safeStart = Math.min(selectionStart, restored.value.length);
          const safeEnd = Math.min(selectionEnd, restored.value.length);
          restored.setSelectionRange(safeStart, safeEnd);
        }
      });
    });

    this.shadowRoot.querySelectorAll('[data-column-filter]').forEach(input => {
      input.addEventListener('click', () => {
        this.setColumnQueryMode(input.dataset.columnFilter, 'filter');
        this.render();
      });
    });

    this.shadowRoot.querySelectorAll('[data-column-search]').forEach(input => {
      input.addEventListener('click', () => {
        this.setColumnQueryMode(input.dataset.columnSearch, 'search');
        this.render();
      });
    });

    this.shadowRoot.querySelectorAll('[data-column-search-input]').forEach(input => {
      input.addEventListener('input', event => {
        this._columnSearches[input.dataset.columnSearchInput] = event.target.value;
        this.emit('mvx-filter', {
          value: this._filter,
          columnFilters: this._columnFilters,
          columnSearches: this._columnSearches
        });
        this.render();
      });
    });

    this.shadowRoot.querySelectorAll('[data-column-filter-input]').forEach(input => {
      input.addEventListener('input', event => {
        this._columnFilters[input.dataset.columnFilterInput] = event.target.value;
        this.emit('mvx-filter', {
          value: this._filter,
          columnFilters: this._columnFilters,
          columnSearches: this._columnSearches
        });
        this.render();
      });
    });

    this.shadowRoot.querySelectorAll('[data-column-toggle]').forEach(input => {
      input.addEventListener('change', event => {
        this.toggleColumn(event.target.dataset.columnToggle);
      });
    });

    this.shadowRoot.querySelectorAll('[data-sort]').forEach(button => {
      button.addEventListener('click', () => {
        const key = button.getAttribute('data-sort');
        if (this._sortKey !== key) {
          this._sortKey = key;
          this._sortDir = 1;
        } else if (this._sortDir === 1) {
          this._sortDir = -1;
        } else if (this._sortDir === -1) {
          this._sortDir = 0;
          this._sortKey = null;
        } else {
          this._sortDir = 1;
        }
        const direction = this._sortDir > 0 ? sortAscending : this._sortDir < 0 ? sortDescending : this.t('default', 'default');
        this.emit('mvx-sort', {
          key,
          direction
        });
        this.render();
      });
    });

    this.shadowRoot.querySelectorAll('[data-page="prev"]').forEach(button => {
      button.addEventListener('click', () => {
        if (pageState.page <= 1) return;
        const next = pageState.page - 1;
        this.page = next;
        this.emit('mvx-page', { page: next, pageCount: pageState.pageCount });
        this.render();
      });
    });

    this.shadowRoot.querySelectorAll('[data-page="next"]').forEach(button => {
      button.addEventListener('click', () => {
        if (pageState.page >= pageState.pageCount) return;
        const next = pageState.page + 1;
        this.page = next;
        this.emit('mvx-page', { page: next, pageCount: pageState.pageCount });
        this.render();
      });
    });

    this.shadowRoot.querySelectorAll('[data-expand]').forEach(button => {
      button.addEventListener('click', event => {
        event.stopPropagation();
        const targetId = button.dataset.expand;
        const entry = rows.find(item => item.id === targetId);
        if (entry) this.toggleExpanded(entry.id, entry.row);
      });
    });

    this.shadowRoot.querySelectorAll('[data-select-row]').forEach(input => {
      input.addEventListener('change', event => {
        event.stopPropagation();
        const targetId = event.target.dataset.selectRow;
        const entry = rows.find(item => item.id === targetId);
        this.setRowSelection(entry, Number(input.dataset.visibleIndex), input.checked);
        this.render();
      });
    });

    this.shadowRoot.querySelectorAll('[data-select-all]').forEach(input => {
      input.addEventListener('change', event => {
        this.setAllSelection(rows, event.target.checked);
        this.render();
      });
    });

    if (multipleSelection) {
      const selectAll = this.shadowRoot.querySelector('[data-select-all]');
      if (selectAll) {
        selectAll.indeterminate = somePageSelected && !allPageSelected;
      }
    }

    this.shadowRoot.querySelectorAll('tbody tr[data-index]').forEach(row => {
      row.addEventListener('click', () => {
        if (!this.selectionEnabled) return;
        const entry = rows[Number(row.dataset.index)];
        if (!entry) return;
        this.setRowSelection(entry, Number(row.dataset.index), !this._selected.has(entry.id));
        this.render();
      });
    });

    this.syncSelectedAttribute();
    this.shadowRoot.querySelectorAll('button, summary').forEach(control => this.wirePointerMotion(control));
  }

  columnStyle(index, pinnedCount, columns, hasSelection) {
    const column = columns[index];
    const width = column.width ? `inline-size:${htmlEscape(column.width)};min-inline-size:${htmlEscape(column.width)};` : '';
    const isSelection = Boolean(column._mvxSelection);
    if (isSelection) {
      return width || 'inline-size:42px;min-inline-size:42px;';
    }
    const dataIndex = index - (hasSelection ? 1 : 0);
    if (dataIndex >= pinnedCount) return width;
    return `${width}inset-inline-start:${columnLeftOffset(index, columns)}px;`;
  }

  renderRow(entry, index, columns, pinnedColumnCount, pinnedRowCount, canExpand, firstDataColumnIndex, hasQueryRow = false) {
    if (!entry?.row) return '';
    const rowPinned = index < pinnedRowCount;
    const isSelected = this._selected.has(entry.id);
    const rowHeight = this.getAttribute('density') === 'compact' ? 38 : this.getAttribute('density') === 'spacious' ? 50 : 44;
    const offset = (hasQueryRow ? 2 : 1) * rowHeight + index * rowHeight;
    const top = rowPinned ? `style="inset-block-start:${offset}px;"` : '';
    return `
      <tr data-index="${index}" class="${rowPinned ? 'pinned-row' : ''}${isSelected ? ' selected' : ''}">
        ${columns.map((column, columnIndex) => {
          const isSelection = Boolean(column._mvxSelection);
          const dataIndex = columnIndex - (this.selectionEnabled ? 1 : 0);
          const pinned = !isSelection && dataIndex >= 0 && dataIndex < pinnedColumnCount;
          const style = this.columnStyle(columnIndex, pinnedColumnCount, columns, this.selectionEnabled);
          const terms = this.getCellQueries(column.key);
          const content = isSelection
            ? `<input type="checkbox" data-select-row="${htmlEscape(entry.id)}" data-visible-index="${String(index)}" ${isSelected ? 'checked' : ''} aria-label="${htmlEscape(this.t('selectRow', 'Select row'))}" />`
            : (
              columnIndex === firstDataColumnIndex && canExpand
                ? `<span class="tree-cell" style="padding-inline-start:${entry.depth * 18}px">
                    ${entry.hasChildren || entry.hasDetails
                      ? `<button class="expander" data-expand="${htmlEscape(entry.id)}" aria-label="${htmlEscape(entry.expanded ? this.t('collapseRow', 'Collapse row') : this.t('expandRow', 'Expand row'))}" aria-expanded="${entry.expanded}">${entry.expanded ? '−' : '+'}</button>`
                      : '<span class="indent" style="inline-size:24px"></span>'}
                    <span>${highlightInText(cellText(entry.row, column), terms)}</span>
                  </span>`
                : highlightInText(cellText(entry.row, column), terms)
            );
          return `<td part="cell" class="${pinned ? 'pinned-col' : ''}" ${rowPinned ? top : ''} style="${style}">${content}</td>`;
        }).join('')}
      </tr>
      ${entry.expanded && entry.row?.details ? `
        <tr class="detail-row">
          <td colspan="${columns.length}">${htmlEscape(String(entry.row.details))}</td>
        </tr>
      ` : ''}
    `;
  }
}
