import { useEffect, useRef } from 'react';

import { usePrimerCheckout } from '../../hooks/usePrimerCheckout';
import { useNavigation } from '../navigation/useNavigation';
import { CheckoutRoute } from '../navigation/types';

// Renders nothing; routes off the splash screen once the provider is ready (or errored).
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
