import { createContext } from 'react';
import type { PrimerTokens } from './types';

interface ThemeContextValue {
  lightTokens: PrimerTokens;
  darkTokens: PrimerTokens;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);
