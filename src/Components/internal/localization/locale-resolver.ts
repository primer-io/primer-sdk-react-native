import type { ResolvedLocale } from './types';
import { hasLocale } from './strings';

function normalizeLocale(locale: string): string {
  return locale.replace(/_/g, '-');
}

function getDeviceLocale(): string | null {
  try {
    return normalizeLocale(Intl.DateTimeFormat().resolvedOptions().locale);
  } catch (error) {
    console.warn('[Primer] Failed to detect device locale, falling back to "en"', error);
    return null;
  }
}

function extractBaseLanguage(locale: string): string {
  return locale.split('-')[0]!;
}

function findSupportedLocale(candidate: string): string | null {
  if (hasLocale(candidate)) return candidate;
  const base = extractBaseLanguage(candidate);
  if (base !== candidate && hasLocale(base)) return base;
  return null;
}

// Resolution: device locale → base language fallback → "en"
export function resolveLocale(): ResolvedLocale {
  const deviceLocale = getDeviceLocale();
  if (deviceLocale) {
    const resolved = findSupportedLocale(deviceLocale);
    if (resolved) return { locale: resolved, source: 'device' };
  }

  return { locale: 'en', source: 'fallback' };
}
