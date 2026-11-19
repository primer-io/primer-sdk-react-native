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
