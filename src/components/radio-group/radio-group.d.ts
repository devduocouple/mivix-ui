import { MvxElement } from '../../core.js';

export interface MvxRadioOption {
  label?: string;
  value?: string;
  description?: string;
  helper?: string;
  disabled?: boolean;
}

export class MvxRadioGroup extends MvxElement {
  options: Array<string | MvxRadioOption>;
  value: string;
  select(value: string): void;
}
