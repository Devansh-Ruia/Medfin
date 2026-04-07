/**
 * Safe formatting utilities for numeric values from API responses.
 * Guards against undefined/null values that cause TypeError when
 * .toLocaleString() is called on them.
 */

export function formatCurrency(value: number | string | null | undefined, fallback: string = 'N/A'): string {
  if (value === null || value === undefined || value === '') return fallback;
  const num = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) : value;
  if (isNaN(num)) return fallback;
  return num.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
}

export function formatNumber(value: number | null | undefined, fallback: string = 'N/A'): string {
  if (value === null || value === undefined || isNaN(value)) return fallback;
  return value.toLocaleString();
}

export function formatPercent(value: number | null | undefined, fallback: string = 'N/A'): string {
  if (value === null || value === undefined) return fallback;
  return `${value}%`;
}

export function formatBoolean(value: boolean | null | undefined, trueLabel: string = 'Yes', falseLabel: string = 'No', fallback: string = 'Unknown'): string {
  if (value === null || value === undefined) return fallback;
  return value ? trueLabel : falseLabel;
}
