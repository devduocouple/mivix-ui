import { MvxElement } from '../../core.js';

export interface MvxSidebarItem {
  label?: string;
  value?: string;
  href?: string;
  icon?: string;
  badge?: string;
  active?: boolean;
  open?: boolean;
  children?: MvxSidebarItem[];
}

export class MvxSidebar extends MvxElement {
  items: Array<string | MvxSidebarItem>;
  select(item: MvxSidebarItem, index: string | number): void;
}
