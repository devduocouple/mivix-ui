export const baseStyles: string;
export const toneMap: Record<string, string>;
export const themeStorageKey: string;
export const variantStorageKey: string;
export function readStoredTheme(storageKey?: string): string;
export function writeStoredTheme(theme: string, storageKey?: string): void;
export function applyDocumentTheme(theme: string, options?: { persist?: boolean; storageKey?: string }): string;
export function restoreDocumentTheme(options?: { storageKey?: string }): string;
export function readStoredVariant(storageKey?: string): string;
export function writeStoredVariant(variant: string, storageKey?: string): void;
export function applyDocumentVariant(variant: string, options?: { persist?: boolean; storageKey?: string }): string;
export function restoreDocumentVariant(options?: { storageKey?: string }): string;
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
