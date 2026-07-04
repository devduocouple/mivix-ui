import { MvxElement } from '../../core.js';

export interface MvxChartGroupItem {
  type?: string;
  title?: string;
  subtitle?: string;
  series?: unknown[];
  data?: unknown[];
  categories?: unknown[];
  height?: number | string;
  legend?: boolean;
  grid?: boolean;
  labels?: boolean;
  [key: string]: unknown;
}

export class MvxChartGroup extends MvxElement {
  charts: MvxChartGroupItem[];
}
