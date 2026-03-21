/**
 * ISO 4217 currency code → number of minor unit digits.
 * Used to convert minor units (e.g., cents) to major units (e.g., dollars).
 *
 * Default is 2 for unlisted currencies. Zero-decimal currencies (JPY, KRW, etc.)
 * have 0 digits. Three-decimal currencies (BHD, KWD, etc.) have 3 digits.
 */
const ZERO_DECIMAL_CURRENCIES = new Set([
  'BIF',
  'CLP',
  'DJF',
  'GNF',
  'ISK',
  'JPY',
  'KMF',
  'KRW',
  'PYG',
  'RWF',
  'UGX',
  'VND',
  'VUV',
  'XAF',
  'XOF',
  'XPF',
]);

const THREE_DECIMAL_CURRENCIES = new Set(['BHD', 'IQD', 'JOD', 'KWD', 'LYD', 'OMR', 'TND']);

/**
 * Returns the number of minor unit digits for a given currency code.
 * - 0 for zero-decimal currencies (JPY, KRW, etc.)
 * - 3 for three-decimal currencies (BHD, KWD, etc.)
 * - 2 for all others (default)
 */
export function getMinorUnitDigits(currencyCode: string): number {
  const upper = currencyCode.toUpperCase();
  if (ZERO_DECIMAL_CURRENCIES.has(upper)) return 0;
  if (THREE_DECIMAL_CURRENCIES.has(upper)) return 3;
  return 2;
}
