import { requireNativeComponent } from 'react-native';
import type { ViewProps } from 'react-native';
import type { PrimerColorScheme } from '../theme/ThemeContext';

interface ApplePayNativeButtonProps extends ViewProps {
  /** PassKit's automatic style follows it: black on light, white on dark. */
  colorScheme: PrimerColorScheme;
  cornerRadius: number;
}

/**
 * PassKit's own Apple Pay button, drawn by the iOS bridge. Display-only: the list row owns the tap.
 * iOS only, since Android registers no such view. Requiring it is lazy, so importing it is safe.
 */
export const ApplePayNativeButton = requireNativeComponent<ApplePayNativeButtonProps>('PrimerApplePayButton');
