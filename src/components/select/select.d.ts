import { MvxElement } from '../../core.js';

export interface MvxSelectOption {
  label?: string;
  value?: string;
  group?: string;
  disabled?: boolean;
}

export class MvxSelect extends MvxElement {
  options: Array<string | MvxSelectOption>;
  value: string;
}
