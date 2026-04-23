import { useContext } from 'react';
import { useColorScheme } from 'react-native';
import { ThemeContext } from './ThemeContext';
import { defaultDarkTokens, defaultLightTokens } from './tokens';
import type { PrimerTokens } from './types';

export function useTheme(): PrimerTokens {
  const theme = useContext(ThemeContext);
  const colorScheme = useColorScheme();

  const light = theme?.lightTokens ?? defaultLightTokens;
  const dark = theme?.darkTokens ?? defaultDarkTokens;

  return colorScheme === 'dark' ? dark : light;
}
