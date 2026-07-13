import { useContext, useEffect, useRef } from 'react';

import { usePrimerCheckout } from '../../hooks/usePrimerCheckout';
import { useNavigation } from '../navigation/useNavigation';
import { CheckoutRoute } from '../navigation/types';
import { CheckoutFlowContext } from './CheckoutFlowContext';

// Renders nothing; routes each payment outcome to the success/error screen (or dismisses when disabled).
export function PaymentOutcomeTransitioner() {
  const { paymentOutcome, settings, clearPaymentOutcome } = usePrimerCheckout();
  const { replace, isAnimating } = useNavigation();
  const flow = useContext(CheckoutFlowContext);
  const lastOutcomeRef = useRef<typeof paymentOutcome>(null);

  useEffect(() => {
    // Guard against re-fires when unrelated context fields change.
    if (paymentOutcome === lastOutcomeRef.current) return;

    if (!paymentOutcome) {
      lastOutcomeRef.current = null;
      return;
    }

    if (isAnimating) return; // replace() no-ops mid-transition; re-runs when it clears

    lastOutcomeRef.current = paymentOutcome;

    const uiOptions = settings?.uiOptions;

    if (paymentOutcome.status === 'success') {
      if (uiOptions?.isSuccessScreenEnabled === false) {
        clearPaymentOutcome();
        flow?.onCancel();
        return;
      }
      replace(CheckoutRoute.success, { checkoutData: paymentOutcome.data });
    } else {
      if (uiOptions?.isErrorScreenEnabled === false) {
        clearPaymentOutcome();
        flow?.onCancel();
        return;
      }
      replace(CheckoutRoute.error, { error: paymentOutcome.error });
    }
  }, [paymentOutcome, settings, replace, clearPaymentOutcome, flow, isAnimating]);

  return null;
}
