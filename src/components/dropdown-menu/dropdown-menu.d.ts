import { MvxElement } from '../../core.js';

export interface MvxDropdownMenuItem {
  label?: string;
  value?: string;
  href?: string;
  shortcut?: string;
  disabled?: boolean;
  separator?: boolean;
}

export class MvxDropdownMenu extends MvxElement {
  items: Array<string | MvxDropdownMenuItem>;
  toggle(force?: boolean): void;
  select(item: MvxDropdownMenuItem): void;
}
