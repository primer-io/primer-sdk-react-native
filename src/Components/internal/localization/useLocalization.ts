import { useMemo } from 'react';
import type { TranslationParams } from './types';
import { resolveLocale } from './locale-resolver';
import { translate } from './translate';
import { formatCurrency as formatCurrencyUtil } from '../currency';
import { formatDate as formatDateUtil } from '../utils/formatting';

export interface LocalizationResult {
  t: (key: string, params?: TranslationParams) => string;
  formatCurrency: (amountInMinorUnits: number, currencyCode: string) => string;
  formatDate: (date: Date, options?: Intl.DateTimeFormatOptions) => string;
}

// Resolves locale once from device settings (matching native SDK behavior)
export function useLocalization(): LocalizationResult {
  return useMemo(() => {
    const { locale } = resolveLocale();
    return {
      t: (key: string, params?: TranslationParams) => translate(key, locale, params),
      formatCurrency: (amountInMinorUnits: number, currencyCode: string) =>
        formatCurrencyUtil(amountInMinorUnits, currencyCode, locale),
      formatDate: (date: Date, options?: Intl.DateTimeFormatOptions) => formatDateUtil(date, locale, options),
    };
  }, []);
}
