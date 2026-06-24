import { useContext, useEffect, useRef } from 'react';

import { usePrimerCheckout } from '../../hooks/usePrimerCheckout';
import { useNavigation } from '../navigation/useNavigation';
import { CheckoutRoute } from '../navigation/types';
import { CheckoutFlowContext } from './CheckoutFlowContext';

/**
 * Headless transitioners — they render nothing; each watches provider state and drives navigation.
 * Split out of CheckoutFlow so the navigation guarantees (a failed flow lands on the error screen, a
 * QR payload opens the QR screen) can be unit-tested without rendering the whole screen tree.
 */

export function ReadinessTransitioner() {
  const { isReady, isLoadingResources, error } = usePrimerCheckout();
  const { replace } = useNavigation();
  const hasTransitioned = useRef(false);

  useEffect(() => {
    if (hasTransitioned.current) return;

    if (error) {
      hasTransitioned.current = true;
      replace(CheckoutRoute.error, { error });
      return;
    }

    if (isReady && !isLoadingResources) {
      hasTransitioned.current = true;
      replace(CheckoutRoute.methodSelection);
    }
  }, [isReady, isLoadingResources, error, replace]);

  return null;
}

export function QrCodeTransitioner() {
  // Navigate to the QR screen only when an actual QR payload arrives (keyed on `qrCode`, not
  // `isQrPending` — pending can fire for non-QR async methods). startNativeUI clears `qrCode` at
  // the start of each flow, which resets the guard for the next QR payment.
  const { qrCode } = usePrimerCheckout();
  const { replace, isAnimating } = useNavigation();
  const shownRef = useRef(false);

  useEffect(() => {
    if (qrCode != null && !shownRef.current) {
      if (isAnimating) return; // replace() no-ops mid-transition; re-runs when it clears
      shownRef.current = true;
      replace(CheckoutRoute.qrCode);
    } else if (qrCode == null) {
      shownRef.current = false;
    }
  }, [qrCode, replace, isAnimating]);

  return null;
}

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
