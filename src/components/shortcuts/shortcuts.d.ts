import { MvxElement } from '../../core.js';

export interface MvxShortcutItem {
  label?: string;
  shortcut?: string | string[];
  keys?: string | string[];
  key?: string | string[];
  hotkey?: string | string[];
  command?: string;
  action?: 'click' | 'focus' | 'scroll' | 'navigate' | 'dispatch' | string;
  selector?: string;
  target?: string;
  href?: string;
  to?: string;
  url?: string;
  allowInput?: boolean;
  'allow-input'?: boolean;
  preventDefault?: boolean;
  'prevent-default'?: boolean;
  disabled?: boolean;
  [key: string]: unknown;
}

export class MvxShortcuts extends MvxElement {
  items: MvxShortcutItem[];
}
