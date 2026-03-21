import type { IPrimerLocaleData } from '../../../models/PrimerSettings';
import type { ResolvedLocale } from './types';
import { hasLocale } from './strings';

function getDeviceLocale(): string | null {
  try {
    return Intl.DateTimeFormat().resolvedOptions().locale;
  } catch (error) {
    console.warn('[Primer] Failed to detect device locale, falling back to "en"', error);
    return null;
  }
}

function extractBaseLanguage(locale: string): string {
  return locale.split('-')[0]!;
}

/**
 * Tries to find a supported locale from the given candidate.
 * Fallback chain: exact match → base language → null.
 */
function findSupportedLocale(candidate: string): string | null {
  if (hasLocale(candidate)) return candidate;
  const base = extractBaseLanguage(candidate);
  if (base !== candidate && hasLocale(base)) return base;
  return null;
}

/**
 * Resolves the active locale from settings override or device detection.
 *
 * Resolution order:
 * 1. localeData.localeCode (if provided and supported)
 * 2. localeData.languageCode (if provided and supported)
 * 3. Device locale (via Intl.DateTimeFormat)
 * 4. Fallback to "en"
 */
export function resolveLocale(localeData?: IPrimerLocaleData): ResolvedLocale {
  // Try override: localeCode first, then languageCode
  if (localeData?.localeCode) {
    const resolved = findSupportedLocale(localeData.localeCode);
    if (resolved) return { locale: resolved, source: 'override' };
  }
  if (localeData?.languageCode) {
    const resolved = findSupportedLocale(localeData.languageCode);
    if (resolved) return { locale: resolved, source: 'override' };
  }

  // Try device locale
  const deviceLocale = getDeviceLocale();
  if (deviceLocale) {
    const resolved = findSupportedLocale(deviceLocale);
    if (resolved) return { locale: resolved, source: 'device' };
  }

  // Ultimate fallback
  return { locale: 'en', source: 'fallback' };
}
