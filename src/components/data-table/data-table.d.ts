import { MvxElement } from '../../core.js';

export interface MvxDataTableColumn {
  key: string;
  label?: string;
  width?: string;
  pinned?: boolean;
  fixed?: boolean;
  hidden?: boolean;
  locked?: boolean;
  render?: (value: unknown, row: MvxDataTableRow, column: MvxDataTableColumn) => string;
}

export interface MvxDataTableRow {
  id?: string | number;
  key?: string | number;
  children?: MvxDataTableRow[];
  expanded?: boolean;
  details?: string;
  [key: string]: unknown;
}

export class MvxDataTable extends MvxElement {
  columns: MvxDataTableColumn[];
  data: MvxDataTableRow[];
  searchable?: boolean;
  label?: string;
  highlightColor?: string;
  filterable?: boolean;
  selectable: boolean;
  selectionMode: 'single' | 'multiple';
  selected: string[];
  expandable?: boolean;
  tree?: boolean;
  columnToggle?: boolean;
  pinColumns?: number;
  pinRows?: number;
  density?: 'compact' | 'comfortable' | 'spacious' | string;
  caption: string;
  stickyHeader: boolean;
  page?: number;
  pageSize?: number;
}
