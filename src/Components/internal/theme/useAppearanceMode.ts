import { useContext } from 'react';
import { useColorScheme } from 'react-native';
import { ThemeContext } from './ThemeContext';

/**
 * Whether the checkout is dark right now.
 *
 * `appearanceMode` on the settings decides: `SYSTEM` follows the phone, `LIGHT` and `DARK` force it.
 * Everything that needs to know reads this one hook, so the sheet and the payment method logos
 * cannot end up disagreeing.
 */
export function useIsDarkAppearance(): boolean {
  const theme = useContext(ThemeContext);
  const colorScheme = useColorScheme();

  switch (theme?.appearanceMode) {
    case 'DARK':
      return true;
    case 'LIGHT':
      return false;
    default:
      return colorScheme === 'dark';
  }
}
