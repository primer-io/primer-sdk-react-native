import { createContext } from 'react';
import { defaultLightTokens } from './tokens';
import type { PrimerTokens } from './types';

export type PrimerColorScheme = 'light' | 'dark';

interface ThemeContextValue {
  scheme: PrimerColorScheme;
  tokens: PrimerTokens;
}

export const ThemeContext = createContext<ThemeContextValue>({ scheme: 'light', tokens: defaultLightTokens });
