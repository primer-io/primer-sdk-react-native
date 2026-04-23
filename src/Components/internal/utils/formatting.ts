/**
 * Formats a date for display using locale conventions.
 *
 * @param date - The Date object to format
 * @param locale - BCP 47 locale tag (e.g., "en-US", "de-DE")
 * @param options - Optional Intl.DateTimeFormat options for customization
 * @returns Formatted date string
 */
export function formatDate(date: Date, locale: string, options?: Intl.DateTimeFormatOptions): string {
  try {
    return new Intl.DateTimeFormat(locale, options).format(date);
  } catch (error) {
    console.warn(`[Primer] Failed to format date for locale "${locale}"`, error);
    return date.toISOString();
  }
}

/**
 * Converts a SCREAMING_SNAKE_CASE payment method type to a human-readable label.
 *
 * Used as a fallback when a resource-provided `paymentMethodName` is unavailable.
 *
 * @example titleCaseFromType('PAYMENT_CARD') // 'Payment Card'
 */
export function titleCaseFromType(type: string): string {
  return type
    .toLowerCase()
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
