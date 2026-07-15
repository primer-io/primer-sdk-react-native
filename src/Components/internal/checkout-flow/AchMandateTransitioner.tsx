import { useEffect, useRef } from 'react';

import { usePrimerCheckout } from '../../hooks/usePrimerCheckout';
import { useNavigation } from '../navigation/useNavigation';
import { CheckoutRoute } from '../navigation/types';

// The mandate arrives flow-level (additionalInfo), so only a flow-level transitioner reliably catches it.
export function AchMandateTransitioner() {
  const { achMandate } = usePrimerCheckout();
  const { replace, isAnimating } = useNavigation();
  const hadMandateRef = useRef(false);

  useEffect(() => {
    if (!achMandate) {
      hadMandateRef.current = false;
      return;
    }
    // replace() no-ops mid-transition, so wait for isAnimating to clear before latching + navigating.
    if (hadMandateRef.current || isAnimating) return;
    hadMandateRef.current = true;
    replace(CheckoutRoute.stripeAchMandate);
  }, [achMandate, replace, isAnimating]);

  return null;
}
