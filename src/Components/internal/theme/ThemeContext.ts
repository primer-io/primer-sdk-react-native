import { createContext } from 'react';
import type { PrimerTokens } from './types';

export type PrimerColorScheme = 'light' | 'dark';

export interface ThemeContextValue {
  scheme: PrimerColorScheme;
  tokens: PrimerTokens;
}

// null outside PrimerCheckoutProvider, where the theme hooks follow the phone instead.
export const ThemeContext = createContext<ThemeContextValue | null>(null);
