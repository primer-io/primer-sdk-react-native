import { createContext } from 'react';
import type { PrimerTokens } from './types';
import type { PrimerAppearanceMode } from '../../../models/PrimerSettings';

interface ThemeContextValue {
  lightTokens: PrimerTokens;
  darkTokens: PrimerTokens;
  appearanceMode?: PrimerAppearanceMode;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);
