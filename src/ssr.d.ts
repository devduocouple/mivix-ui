export type JsonConfigNode =
  | string
  | number
  | null
  | false
  | JsonConfigNode[]
  | {
      tag?: string;
      component?: string;
      attrs?: Record<string, unknown>;
      props?: Record<string, unknown>;
      text?: string | number;
      children?: JsonConfigNode | JsonConfigNode[];
    };

export function escapeHtml(value?: unknown): string;
export function escapeAttribute(value?: unknown): string;
export function renderAttributes(attrs?: Record<string, unknown>): string;
export function renderComponentTag(tag: string, attrs?: Record<string, unknown>, children?: string): string;
export function renderJsonConfig(config: JsonConfigNode): string;
export function renderJsonSchemaForm(
  schema: Record<string, unknown>,
  uiSchema?: Record<string, unknown>,
  formData?: Record<string, unknown>,
  attrs?: Record<string, unknown>
): string;
