import { useMemo } from 'react';
import type { TranslationKey, TranslationParams } from './types';
import { resolveLocale } from './locale-resolver';
import { translate } from './translate';

export interface LocalizationResult {
  t: (key: TranslationKey, params?: TranslationParams) => string;
}

// Resolves locale once from device settings (matching native SDK behavior)
export function useLocalization(): LocalizationResult {
  return useMemo(() => {
    const { locale } = resolveLocale();
    return {
      t: (key: TranslationKey, params?: TranslationParams) => translate(key, locale, params),
    };
  }, []);
}
