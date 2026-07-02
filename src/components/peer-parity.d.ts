import { MvxElement } from '../core.js';

export interface MvxPeerItem {
  label?: string;
  title?: string;
  name?: string;
  value?: string;
  href?: string;
  icon?: string;
  image?: string;
  src?: string;
  alt?: string;
  description?: string;
  shortcut?: string;
  side?: 'left' | 'right' | string;
  disabled?: boolean;
  separator?: boolean;
  open?: boolean;
  active?: boolean;
  children?: MvxPeerItem[];
  [key: string]: unknown;
}

export class MvxPeerElement extends MvxElement {
  items: MvxPeerItem[];
  value: string;
  active: number;
}

export class MvxAutocomplete extends MvxPeerElement {
  options: MvxPeerItem[];
  select(item: MvxPeerItem): void;
}
export class MvxCombobox extends MvxAutocomplete {}
export class MvxButtonGroup extends MvxPeerElement {}
export class MvxToggle extends MvxPeerElement { toggle(): void; }
export class MvxToggleGroup extends MvxPeerElement { select(item: MvxPeerItem): void; }
export class MvxRating extends MvxPeerElement { rate(value: number): void; }
export class MvxFileInput extends MvxPeerElement {}
export class MvxInputGroup extends MvxPeerElement {}
export class MvxOtpInput extends MvxPeerElement {}
export class MvxNumberField extends MvxPeerElement { stepValue(direction: number): void; }
export class MvxCalendar extends MvxPeerElement { move(delta: number): void; select(date: string): void; }
export class MvxCarousel extends MvxPeerElement { move(delta: number): void; }
export class MvxChip extends MvxPeerElement {}
export class MvxEmptyState extends MvxPeerElement {}
export class MvxTreeView extends MvxPeerElement { select(item: MvxPeerItem): void; }
export class MvxMenu extends MvxPeerElement { select(item: MvxPeerItem): void; }
export class MvxContextMenu extends MvxMenu {}
export class MvxMenubar extends MvxPeerElement {}
export class MvxNavigationMenu extends MvxMenubar {}
export class MvxMegaMenu extends MvxMenubar {}
export class MvxBottomNavigation extends MvxPeerElement { select(item: MvxPeerItem): void; }
export class MvxDock extends MvxBottomNavigation {}
export class MvxHoverCard extends MvxPeerElement {}
export class MvxFab extends MvxPeerElement {}
export class MvxSpeedDial extends MvxPeerElement {}
export class MvxCollapse extends MvxPeerElement {}
export class MvxScrollArea extends MvxPeerElement {}
export class MvxResizable extends MvxPeerElement {}
export class MvxAspectRatio extends MvxPeerElement {}
export class MvxBox extends MvxPeerElement {}
export class MvxContainer extends MvxPeerElement {}
export class MvxGrid extends MvxPeerElement {}
export class MvxStack extends MvxPeerElement {}
export class MvxPaper extends MvxPeerElement {}
export class MvxTypography extends MvxPeerElement {}
export class MvxLink extends MvxPeerElement {}
export class MvxKbd extends MvxPeerElement {}
export class MvxLabel extends MvxPeerElement {}
export class MvxStat extends MvxPeerElement {}
export class MvxStatus extends MvxPeerElement {}
export class MvxRadialProgress extends MvxPeerElement {}
export class MvxCountdown extends MvxPeerElement {}
export class MvxFooter extends MvxPeerElement {}
export class MvxHero extends MvxPeerElement {}
export class MvxDiff extends MvxPeerElement {}
export class MvxCodeBlock extends MvxPeerElement {}
export class MvxBrowserMockup extends MvxPeerElement {}
export class MvxWindowMockup extends MvxBrowserMockup {}
export class MvxPhoneMockup extends MvxPeerElement {}
export class MvxIndicator extends MvxPeerElement {}
export class MvxMask extends MvxPeerElement {}
export class MvxJoin extends MvxPeerElement {}
export class MvxAura extends MvxPeerElement {}
export class MvxHoverGallery extends MvxPeerElement {}
export class MvxImageList extends MvxPeerElement {}
export class MvxIcon extends MvxPeerElement {}
export class MvxIcons extends MvxPeerElement {}
export class MvxMasonry extends MvxPeerElement {}
export class MvxSwap extends MvxPeerElement { toggle(): void; }
export class MvxTextRotate extends MvxPeerElement {}
export class MvxHover3dCard extends MvxPeerElement {}
export class MvxThemeController extends MvxPeerElement { select(theme: string): void; }
export class MvxFigure extends MvxPeerElement {}
export class MvxImage extends MvxPeerElement {}
export class MvxJsonSchemaForm extends MvxPeerElement {
  schema: Record<string, unknown>;
  uiSchema: Record<string, unknown>;
  formData: Record<string, unknown>;
  updateValue(name: string, value: unknown): void;
}
export class MvxSchemaForm extends MvxJsonSchemaForm {}
export class MvxJsonRenderer extends MvxPeerElement {
  config: unknown;
}
export class MvxRichTextEditor extends MvxPeerElement {
  value: string;
  messages: Array<Record<string, unknown>>;
  headers: Record<string, string>;
  exec(command: string, value?: string | null): void;
  capture(): void;
  runAi(mode?: string): Promise<void>;
}
export class MvxTransferList extends MvxPeerElement { move(value: string, direction: string): void; }
export class MvxBackdrop extends MvxPeerElement {}
export class MvxFieldset extends MvxPeerElement {}
export class MvxField extends MvxPeerElement {}
export class MvxValidator extends MvxPeerElement {}
export class MvxFloatingLabel extends MvxPeerElement {}
export class MvxFilter extends MvxToggleGroup {}
export class MvxAttachment extends MvxPeerElement {}
export class MvxMessage extends MvxPeerElement {}
export class MvxMessageScroller extends MvxPeerElement {}
export class MvxMarker extends MvxPeerElement {}
export class MvxCloseButton extends MvxPeerElement {}
export class MvxScrollspy extends MvxPeerElement {}
export class MvxBubble extends MvxMessage {}
export class MvxChatBubble extends MvxMessage {}
export class MvxItem extends MvxPeerElement {}
export class MvxSeparator extends MvxPeerElement {}
export class MvxNativeSelect extends MvxPeerElement {}
export class MvxTable extends MvxPeerElement {
  columns: MvxPeerItem[];
  data: Record<string, unknown>[];
}
export class MvxDialog extends MvxPeerElement {}
export class MvxAlertDialog extends MvxDialog {}
export class MvxSheet extends MvxPeerElement {}
export class MvxOffcanvas extends MvxPeerElement {}
export class MvxPlaceholder extends MvxPeerElement {}
export class MvxSonner extends MvxPeerElement {}
