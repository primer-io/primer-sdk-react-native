import { useEffect, useRef } from 'react';

import { usePrimerCheckout } from '../../hooks/usePrimerCheckout';
import { useNavigation } from '../navigation/useNavigation';
import { CheckoutRoute } from '../navigation/types';

// The ACH mandate arrives flow-level (checkout additionalInfo event), decoupled from any screen's
// lifecycle — a flow-level transitioner is the only place guaranteed to catch it.
export function AchMandateTransitioner() {
  const { achMandate } = usePrimerCheckout();
  const { replace, isAnimating } = useNavigation();
  const hadMandateRef = useRef(false);

  useEffect(() => {
    if (!achMandate) {
      hadMandateRef.current = false;
      return;
    }
    // replace() no-ops mid-transition; the once-latch would then strand the mandate forever, so
    // wait for the animation to clear (isAnimating dep) before latching + navigating.
    if (hadMandateRef.current || isAnimating) return;
    hadMandateRef.current = true;
    replace(CheckoutRoute.stripeAchMandate);
  }, [achMandate, replace, isAnimating]);

  return null;
}
