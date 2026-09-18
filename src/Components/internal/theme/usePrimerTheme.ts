import { useContext } from 'react';
import { ThemeContext } from './ThemeContext';
import { useIsDarkAppearance } from './useAppearanceMode';
import { defaultDarkTokens, defaultLightTokens } from './tokens';
import type { PrimerTokens } from './types';

export function usePrimerTheme(): PrimerTokens {
  const theme = useContext(ThemeContext);
  const isDark = useIsDarkAppearance();

  const light = theme?.lightTokens ?? defaultLightTokens;
  const dark = theme?.darkTokens ?? defaultDarkTokens;

  return isDark ? dark : light;
}
