import type { TranslationKey, TranslationParams } from './types';
import { getTranslationMap } from './strings';
import { interpolate } from './interpolation';

/**
 * Looks up a translation key for the given locale.
 *
 * - Returns the localized string with placeholders replaced
 * - Falls back to English if key is missing in the requested locale
 * - Falls back to the key itself if missing even in English
 * - Logs a warning on any fallback
 */
export function translate(key: TranslationKey, locale: string, params?: TranslationParams): string {
  // Try requested locale
  const localeMap = getTranslationMap(locale);
  if (localeMap) {
    const value = localeMap[key];
    if (value !== undefined) {
      return interpolate(value, params);
    }
  }

  // Fall back to English
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

  // Key missing everywhere — return key itself
  console.warn(`[Primer] Missing translation for key "${key}" in all locales`);
  return key;
}
