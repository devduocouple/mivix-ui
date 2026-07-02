import { MvxElement } from '../../core.js';

export interface MvxNavbarItem {
  label?: string;
  href?: string;
  active?: boolean;
}

export class MvxNavbar extends MvxElement {
  items: Array<string | MvxNavbarItem>;
}
