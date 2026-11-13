import type { TranslationParams } from './types';

const PLACEHOLDER_REGEX = /\{\{(\w+)\}\}/g;

export function interpolate(template: string, params?: TranslationParams): string {
  if (!params) return template;
  return template.replace(PLACEHOLDER_REGEX, (match, key: string) => {
    const value = params[key];
    if (value !== undefined) return String(value);
    console.warn(`[Primer] Missing interpolation param "${key}" in template "${template}"`);
    return match;
  });
}
