export type TranslationParams = Record<string, string | number>;

export interface ResolvedLocale {
  locale: string;
  source: 'device' | 'fallback';
}

export type TranslationMap = Record<string, string>;
