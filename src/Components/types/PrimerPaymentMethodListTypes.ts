import type { ViewStyle } from 'react-native';
import type { PaymentMethodItem } from './PaymentMethodTypes';

export interface PrimerPaymentMethodListProps {
  /** Pre-fetched payment methods. When provided, the list skips its internal usePaymentMethods() call. */
  data?: PaymentMethodItem[];
  /** Whitelist: only show these payment method types */
  include?: string[];
  /** Blacklist: hide these payment method types */
  exclude?: string[];
  /** Called when a payment method button is tapped */
  onSelect: (method: PaymentMethodItem) => void;
  /** Called when payment methods finish loading */
  onLoad?: (methods: PaymentMethodItem[]) => void;
  /** Container style override */
  style?: ViewStyle;
}

export interface PaymentMethodButtonProps {
  /** The payment method data to render */
  item: PaymentMethodItem;
  /** Tap handler */
  onPress: () => void;
}
