/**
 * Contract: PrimerPaymentMethodList component public API
 *
 * This file defines the TypeScript interface contract for the
 * PrimerPaymentMethodList component and its internal PaymentMethodButton.
 */

import type { ViewStyle } from 'react-native';
import type { PaymentMethodItem } from '../../src/models/components/PaymentMethodTypes';

// --- Public API ---

export interface PrimerPaymentMethodListProps {
  /** Whitelist: only show these payment method types */
  include?: string[];
  /** Blacklist: hide these payment method types */
  exclude?: string[];
  /** Sort PAYMENT_CARD to top of list (default: true) */
  showCardFirst?: boolean;
  /** Number of methods visible when collapsed. Undefined = show all (no collapse). */
  collapsedCount?: number;
  /** Called when a payment method button is tapped */
  onSelect: (method: PaymentMethodItem) => void;
  /** Called when payment methods finish loading */
  onLoad?: (methods: PaymentMethodItem[]) => void;
  /** Container style override */
  style?: ViewStyle;
}

// --- Internal ---

export interface PaymentMethodButtonProps {
  /** The payment method data to render */
  item: PaymentMethodItem;
  /** Tap handler */
  onPress: () => void;
}
