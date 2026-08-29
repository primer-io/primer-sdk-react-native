import { useContext } from 'react';
import { PrimerCheckoutContext } from '../internal/PrimerCheckoutContext';
import type { PrimerCheckoutContextValue } from '../types/PrimerCheckoutProviderTypes';

export function usePrimerCheckout(): PrimerCheckoutContextValue {
  const context = useContext(PrimerCheckoutContext);
  if (context === null) {
    throw new Error(
      'usePrimerCheckout must be used within a <PrimerCheckoutProvider>. ' +
        'Wrap your component tree with <PrimerCheckoutProvider clientToken="...">.'
    );
  }
  return context;
}
