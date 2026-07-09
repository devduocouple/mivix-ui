import { MvxElement } from '../../core.js';

export interface MvxSidebarDropdownItem {
  label?: string;
  value?: string;
  url?: string;
  href?: string;
  target?: string;
  rel?: string;
  count?: string | number;
  badge?: string | number;
  active?: boolean;
  open?: boolean;
  disabled?: boolean;
  search?: string;
  tags?: string[];
  children?: MvxSidebarDropdownItem[];
}

export class MvxSidebarDropdown extends MvxElement {
  items: Array<string | MvxSidebarDropdownItem>;
  toggle(path: string | number, force?: boolean): void;
  select(path: string | number): void;
  search(value: string): void;
}
