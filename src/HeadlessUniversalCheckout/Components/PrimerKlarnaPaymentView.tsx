import { requireNativeComponent } from 'react-native';
import type { NativeSyntheticEvent, StyleProp, ViewStyle } from 'react-native';

export const PrimerKlarnaPaymentView = requireNativeComponent<{
  style?: StyleProp<ViewStyle>;
  /**
   * Klarna's content height in points (dp on Android), on load and each time it changes.
   * It may not fire, so fall back to a fixed height.
   */
  onContentHeightChange?: (event: NativeSyntheticEvent<{ height: number }>) => void;
}>('PrimerKlarnaPaymentView');
