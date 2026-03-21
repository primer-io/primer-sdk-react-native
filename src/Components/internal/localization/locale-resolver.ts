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
 * Resolves the active locale from device detection.
 *
 * Resolution order:
 * 1. Device locale (via Intl.DateTimeFormat)
 * 2. Fallback to "en"
 */
export function resolveLocale(): ResolvedLocale {
  const deviceLocale = getDeviceLocale();
  if (deviceLocale) {
    const resolved = findSupportedLocale(deviceLocale);
    if (resolved) return { locale: resolved, source: 'device' };
  }

  return { locale: 'en', source: 'fallback' };
}
