import { MvxElement } from '../../core.js';
export class MvxSlider extends MvxElement {
  value: string;
  readonly min: number;
  readonly max: number;
  readonly step: string;
  values(): number[];
}
