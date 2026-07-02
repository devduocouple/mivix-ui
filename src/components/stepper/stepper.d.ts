import { MvxElement } from '../../core.js';

export interface MvxStepperStep {
  label?: string;
  description?: string;
  disabled?: boolean;
}

export class MvxStepper extends MvxElement {
  steps: Array<string | MvxStepperStep>;
  active: number;
  select(index: number): void;
}
