import type { TranslationKey, TranslationParams } from './types';
import { getTranslationMap } from './strings';
import { interpolate } from './interpolation';

// Fallback chain: requested locale → English → key itself
export function translate(key: TranslationKey, locale: string, params?: TranslationParams): string {
  const localeMap = getTranslationMap(locale);
  if (localeMap) {
    const value = localeMap[key];
    if (value !== undefined) {
      return interpolate(value, params);
    }
  }

  if (locale !== 'en') {
    const enMap = getTranslationMap('en');
    if (enMap) {
      const value = enMap[key];
      if (value !== undefined) {
        console.warn(`[Primer] Missing translation for key "${key}" in locale "${locale}", falling back to English`);
        return interpolate(value, params);
      }
    }
  }

  console.warn(`[Primer] Missing translation for key "${key}" in all locales`);
  return key;
}
