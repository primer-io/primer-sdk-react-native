import { useMemo } from 'react';
import type { TranslationKey, TranslationParams } from './types';
import { resolveLocale } from './locale-resolver';
import { translate } from './translate';

export interface LocalizationResult {
  t: (key: TranslationKey, params?: TranslationParams) => string;
}

/**
 * React hook for checkout components to access localization.
 *
 * Resolves locale from device settings (matching native SDK behavior).
 * Provides t() for string lookup bound to the active locale.
 */
export function useLocalization(): LocalizationResult {
  return useMemo(() => {
    const { locale } = resolveLocale();
    return {
      t: (key: TranslationKey, params?: TranslationParams) => translate(key, locale, params),
    };
  }, []);
}
