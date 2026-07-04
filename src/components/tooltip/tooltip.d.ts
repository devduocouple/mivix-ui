import { MvxElement } from '../../core.js';
export type MvxTooltipPlacement = 'top' | 'right' | 'bottom' | 'left' | 'auto';
export type MvxTooltipDefaultPlacement = 'top' | 'right' | 'bottom' | 'left';
export class MvxTooltip extends MvxElement {
  content?: string;
  text?: string;
  placement?: MvxTooltipPlacement;
  show(): void;
  hide(): void;
  updatePosition(): void;
  defaultPlacement(): MvxTooltipDefaultPlacement;
  requestedPlacement(): MvxTooltipPlacement;
}
