/**
 * Safe formatting utilities for numeric values from API responses.
 * Guards against undefined/null values that cause TypeError when
 * .toLocaleString() is called on them.
 */

export function formatCurrency(value: number | null | undefined, fallback: string = '0'): string {
  if (value == null || isNaN(value)) return fallback;
  return value.toLocaleString();
}

export function formatNumber(value: number | null | undefined, fallback: string = '0'): string {
  if (value == null || isNaN(value)) return fallback;
  return value.toLocaleString();
}
