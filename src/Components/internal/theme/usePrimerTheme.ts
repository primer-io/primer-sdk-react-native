import { useContext } from 'react';
import { ThemeContext, type PrimerColorScheme, type ThemeContextValue } from './ThemeContext';
import { defaultDarkTokens, defaultLightTokens } from './tokens';
import type { PrimerTokens } from './types';
import { useResolvedScheme } from './useResolvedScheme';

export function usePrimerTheme(): PrimerTokens {
  return useThemeValue().tokens;
}

export function usePrimerColorScheme(): PrimerColorScheme {
  return useThemeValue().scheme;
}

function useThemeValue(): ThemeContextValue {
  const theme = useContext(ThemeContext);
  const deviceScheme = useResolvedScheme();
  return theme ?? { scheme: deviceScheme, tokens: deviceScheme === 'dark' ? defaultDarkTokens : defaultLightTokens };
}
