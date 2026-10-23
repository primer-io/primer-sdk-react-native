import { useCallback, useEffect } from 'react';

import { CheckoutSheet } from './internal/checkout-sheet/CheckoutSheet';
import { CheckoutFlow } from './internal/checkout-flow/CheckoutFlow';
import { usePrimerCheckout } from './hooks/usePrimerCheckout';

export interface PrimerCheckoutSheetProps {
  /** Whether the sheet is visible. Drives show/hide animation. */
  visible: boolean;
  /** Called when the sheet finishes its dismiss animation (fully hidden). */
  onDismiss?: () => void;
  /** Called when the user requests dismissal (backdrop tap, or Android back on a screen without a Back button). */
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
  const { setActiveMethod } = usePrimerCheckout();

  const handleDismiss = useCallback(() => {
    setActiveMethod(null);
    onDismiss?.();
  }, [setActiveMethod, onDismiss]);

  useEffect(() => () => setActiveMethod(null), [setActiveMethod]);

  return (
    <CheckoutSheet
      visible={visible}
      onDismiss={handleDismiss}
      onRequestDismiss={onRequestDismiss}
      dismissOnBackdropPress={dismissOnBackdropPress}
    >
      <CheckoutFlow onCancel={onRequestDismiss} />
    </CheckoutSheet>
  );
}
