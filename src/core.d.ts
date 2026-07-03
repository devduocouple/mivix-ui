export const baseStyles: string;
export const toneMap: Record<string, string>;
export function define(name: string, component: CustomElementConstructor): void;
export function htmlEscape(value: unknown): string;
export function isSafeUrl(value: unknown, options?: { allowDataImages?: boolean }): boolean;
export function safeUrl(value: unknown, fallback?: string, options?: { allowDataImages?: boolean }): string;
export function parseData<T = unknown>(value: unknown, fallback?: T): T;
export class MvxElement extends HTMLElement {
  static globalAttributes: string[];
  emit(name: string, detail?: Record<string, unknown>): void;
  t(key: string, fallback: string): string;
  readonly locale: string | undefined;
}
