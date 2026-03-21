/**
 * All valid translation keys in the localization system.
 * Dot-separated namespace path — every key MUST have an English translation.
 */
export type TranslationKey =
  | 'checkout.pay_button'
  | 'checkout.cancel'
  | 'checkout.processing'
  | 'checkout.success'
  | 'checkout.pay_amount'
  | 'error.generic'
  | 'error.card_declined'
  | 'error.network'
  | 'error.invalid_card'
  | 'card.number_label'
  | 'card.expiry_label'
  | 'card.cvv_label'
  | 'card.cardholder_label'
  | 'a11y.card_number_field'
  | 'a11y.expiry_field'
  | 'a11y.cvv_field'
  | 'a11y.cardholder_field'
  | 'a11y.pay_button'
  | 'a11y.close_button';

/** Parameters for string interpolation — keys map to {{placeholder}} tokens */
export type TranslationParams = Record<string, string | number>;

/** Result of locale resolution */
export interface ResolvedLocale {
  /** The locale code actually used (after fallback resolution) */
  locale: string;
  /** How the locale was determined */
  source: 'override' | 'device' | 'fallback';
}

/** A complete or partial set of translations for a single locale */
export type TranslationMap = Partial<Record<TranslationKey, string>>;
