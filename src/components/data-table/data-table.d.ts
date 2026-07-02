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
}
