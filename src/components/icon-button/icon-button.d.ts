import { MvxElement } from '../../core.js';
export type MvxIconButtonSize = 'sm' | 'md' | 'lg';
export type MvxIconButtonDensity = 'compact' | 'comfortable' | 'spacious';
export type MvxIconButtonIconOnly = 'true' | 'false';
export type MvxIconButtonBorder = 'default' | 'none';
export type MvxIconButtonBackground = 'default' | 'none';
export type MvxIconButtonShape = 'rounded' | 'sharp' | 'circle';
export class MvxIconButton extends MvxElement {
  getAttribute(name: 'icon' | 'icon-only' | 'border' | 'background' | 'shape' | 'label' | 'motion' | 'size' | 'density'): string | null;
  setAttribute(name: 'icon' | 'icon-only' | 'border' | 'background' | 'shape' | 'label' | 'motion' | 'size' | 'density', value: string): void;
}
