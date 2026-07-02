import { MvxElement } from '../../core.js';

export interface MvxListItem {
  label?: string;
  title?: string;
  value?: string;
  description?: string;
  icon?: string;
  avatar?: string;
  meta?: string;
  badge?: string;
  disabled?: boolean;
}

export class MvxList extends MvxElement {
  items: Array<string | MvxListItem>;
  value: string;
  select(item: MvxListItem, index: number): void;
}
