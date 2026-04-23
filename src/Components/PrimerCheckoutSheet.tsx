import { CheckoutSheet } from './internal/checkout-sheet/CheckoutSheet';
import { CheckoutFlow } from './internal/checkout-flow/CheckoutFlow';

export interface PrimerCheckoutSheetProps {
  /** Whether the sheet is visible. Drives show/hide animation. */
  visible: boolean;
  /** Called when the sheet finishes its dismiss animation (fully hidden). */
  onDismiss?: () => void;
  /** Called when the user requests dismissal (backdrop tap, Android back). */
  onRequestDismiss?: () => void;
  /** Whether tapping the backdrop dismisses the sheet. Default: true. */
  dismissOnBackdropPress?: boolean;
}

/**
 * Pre-built checkout sheet that renders the full checkout flow:
 * loading screen → method selection → payment forms.
 *
 * Must be rendered inside a PrimerCheckoutProvider.
 */
export function PrimerCheckoutSheet({
  visible,
  onDismiss,
  onRequestDismiss,
  dismissOnBackdropPress,
}: PrimerCheckoutSheetProps) {
  return (
    <CheckoutSheet
      visible={visible}
      onDismiss={onDismiss}
      onRequestDismiss={onRequestDismiss}
      dismissOnBackdropPress={dismissOnBackdropPress}
    >
      <CheckoutFlow onCancel={onRequestDismiss} />
    </CheckoutSheet>
  );
}
