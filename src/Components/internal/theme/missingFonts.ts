import NativePrimerViewUtils from '../../../specs/NativePrimerViewUtils';
import { defaultDarkTokens, defaultLightTokens } from './tokens';
import type { PrimerTokens } from './types';
import { TYPOGRAPHY_STYLES } from './typography';

function fontFamilies(tokens: PrimerTokens): string[] {
  return [tokens.typography.fontFamily, ...TYPOGRAPHY_STYLES.map((style) => tokens.typography[style].fontFamily)];
}

// Primer's own font is not the merchant's to fix, so only fonts a merchant set are checked.
const defaultFamilies = new Set([...fontFamilies(defaultLightTokens), ...fontFamilies(defaultDarkTokens)]);

// Each family is checked once for the life of the app, however often the theme changes.
const checkedFamilies = new Set<string>();

export function warnAboutMissingFonts(tokenSets: PrimerTokens[]): void {
  for (const family of tokenSets.flatMap(fontFamilies)) {
    if (defaultFamilies.has(family) || checkedFamilies.has(family)) continue;
    checkedFamilies.add(family);
    NativePrimerViewUtils?.isFontAvailable?.(family)
      .then((available) => {
        if (!available) {
          console.warn(`[Primer] The font "${family}" is not available in this app, so the system font is used.`);
        }
      })
      .catch((e) => {
        if (__DEV__) console.warn('isFontAvailable failed', e);
      });
  }
}
