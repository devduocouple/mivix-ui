import { MvxElement } from '../../core.js';
export class MvxDatePicker extends MvxElement {
  value: string;
  open: boolean;
  autoClose: boolean;
  markWeekends: boolean;
  disabledHints: boolean;
  disableBefore: string;
  disableAfter: string;
  disableBeforeReason: string;
  disableAfterReason: string;
  ignoredDates: Array<{ date: string; reason?: string }>;
  ignoredRanges: Array<{ start: string; end: string; reason?: string }>;
}
