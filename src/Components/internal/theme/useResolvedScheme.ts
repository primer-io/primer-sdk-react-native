import { useColorScheme } from 'react-native';
import type { PrimerColorScheme } from './ThemeContext';
import type { PrimerAppearanceMode } from '../../../models/PrimerSettings';

// The one place that decides: LIGHT and DARK force it, anything else follows the phone.
export function useResolvedScheme(appearanceMode?: PrimerAppearanceMode): PrimerColorScheme {
  const systemScheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  return appearanceMode === 'DARK' ? 'dark' : appearanceMode === 'LIGHT' ? 'light' : systemScheme;
}
