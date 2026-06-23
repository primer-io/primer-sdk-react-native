import { requireNativeComponent } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

export const PrimerKlarnaPaymentView = requireNativeComponent<{ style?: StyleProp<ViewStyle> }>(
  'PrimerKlarnaPaymentView'
);
