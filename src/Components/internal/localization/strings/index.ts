import type { TranslationMap } from '../types';
import en from './en';
import fr from './fr';
import de from './de';
import es from './es';
import ja from './ja';

const stringRegistry: Record<string, TranslationMap> = {
  en,
  fr,
  de,
  es,
  ja,
};

export function getTranslationMap(locale: string): TranslationMap | undefined {
  return stringRegistry[locale];
}

export function hasLocale(locale: string): boolean {
  return locale in stringRegistry;
}

export function registerLocale(locale: string, translations: TranslationMap): void {
  stringRegistry[locale] = translations;
}
