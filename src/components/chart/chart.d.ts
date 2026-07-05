import { MvxElement } from '../../core.js';

export interface MvxChartPoint {
  label?: string;
  x?: number | string;
  y?: number;
  value?: number;
  size?: number;
  high?: number;
  low?: number;
  open?: number;
  close?: number;
  q1?: number;
  q3?: number;
  median?: number;
  target?: number;
  from?: string;
  to?: string;
  id?: string;
  parent?: string;
  links?: string[];
  start?: number;
  end?: number;
  children?: MvxChartPoint[];
  [key: string]: unknown;
}

export interface MvxChartSeries {
  name?: string;
  color?: string;
  data?: Array<number | MvxChartPoint>;
}

export class MvxChart extends MvxElement {
  data: MvxChartPoint[];
  series: MvxChartSeries[];
  categories: string[];
  width?: number;
  height?: number;
  viewHeight?: number;
  componentStyle?: 'console' | 'minimal' | 'glass' | 'dashboard' | 'group' | string;
  cursorFocus?: 'subtle' | 'soft' | 'strong' | 'none' | string;
  cursorFocusSize?: string;
  chartCard?: 'card' | 'flat' | 'off' | 'none' | 'false' | string;
}
