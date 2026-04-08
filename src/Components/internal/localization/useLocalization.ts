import { useMemo } from 'react';
import type { TranslationParams } from './types';
import { resolveLocale } from './locale-resolver';
import { translate } from './translate';

export interface LocalizationResult {
  t: (key: string, params?: TranslationParams) => string;
}

// Resolves locale once from device settings (matching native SDK behavior)
export function useLocalization(): LocalizationResult {
  return useMemo(() => {
    const { locale } = resolveLocale();
    return {
      t: (key: string, params?: TranslationParams) => translate(key, locale, params),
    };
  }, []);
}
