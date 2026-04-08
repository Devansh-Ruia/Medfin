/**
 * Safe formatting utilities for numeric values from API responses.
 * Guards against undefined/null values that cause TypeError when
 * .toLocaleString() is called on them.
 */

export function formatCurrency(
  value: number | string | null | undefined,
  fallback = "N/A"
): string {
  if (value === null || value === undefined || value === "") return fallback

  // If already a formatted string containing a currency symbol, return as-is
  // The AI often returns "$500" or "$2,500" directly -- do not reformat these
  if (typeof value === "string") {
    const trimmed = value.trim()
    if (trimmed.startsWith("$") || trimmed.startsWith("€") || trimmed.startsWith("£")) {
      return trimmed
    }
    // Try to parse as a number
    const num = parseFloat(trimmed.replace(/[^0-9.-]/g, ""))
    if (isNaN(num)) return trimmed // return the string as-is if not parseable as number
    return num.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    })
  }

  // Already a number
  if (isNaN(value)) return fallback
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  })
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
