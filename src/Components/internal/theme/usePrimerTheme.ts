import { useContext } from 'react';
import { ThemeContext, type PrimerColorScheme } from './ThemeContext';
import type { PrimerTokens } from './types';

export function usePrimerTheme(): PrimerTokens {
  return useContext(ThemeContext).tokens;
}

export function usePrimerColorScheme(): PrimerColorScheme {
  return useContext(ThemeContext).scheme;
}
