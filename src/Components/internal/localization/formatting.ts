import { getMinorUnitDigits } from './currency-metadata';

/**
 * Formats a currency amount for display.
 *
 * @param amountInMinorUnits - Amount in minor units (e.g., 123456 cents = $1,234.56)
 * @param currencyCode - ISO 4217 currency code (e.g., "USD", "EUR", "JPY")
 * @param locale - BCP 47 locale tag (e.g., "en-US", "de-DE")
 * @returns Formatted currency string (e.g., "$1,234.56", "1.234,56 €")
 */
export function formatCurrency(amountInMinorUnits: number, currencyCode: string, locale: string): string {
  const digits = getMinorUnitDigits(currencyCode);
  const majorUnits = digits === 0 ? amountInMinorUnits : amountInMinorUnits / Math.pow(10, digits);

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode.toUpperCase(),
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(majorUnits);
  } catch (error) {
    console.warn(`[Primer] Failed to format currency "${currencyCode}" for locale "${locale}"`, error);
    return `${majorUnits.toFixed(digits)} ${currencyCode.toUpperCase()}`;
  }
}

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
