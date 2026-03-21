import { useContext, useMemo } from 'react';
import type { TranslationKey, TranslationParams, ResolvedLocale } from './types';
import { resolveLocale } from './locale-resolver';
import { translate } from './translate';
import { PrimerCheckoutContext } from '../PrimerCheckoutContext';

export interface LocalizationResult {
  locale: ResolvedLocale;
  t: (key: TranslationKey, params?: TranslationParams) => string;
}

/**
 * React hook for checkout components to access localization.
 *
 * Resolves locale from PrimerCheckoutContext settings (localeData).
 * Provides t() for string lookup bound to the active locale.
 *
 * Must be used within a PrimerCheckoutProvider.
 */
export function useLocalization(): LocalizationResult {
  const context = useContext(PrimerCheckoutContext);

  if (context === null) {
    console.warn(
      '[Primer] useLocalization() called outside PrimerCheckoutProvider. ' +
        'Locale overrides will not work. Wrap your component tree in <PrimerCheckoutProvider>.'
    );
  }

  const localeData = context?.localeData;

  const resolved = useMemo(() => resolveLocale(localeData), [localeData]);

  return useMemo(
    () => ({
      locale: resolved,
      t: (key: TranslationKey, params?: TranslationParams) => translate(key, resolved.locale, params),
    }),
    [resolved]
  );
}
