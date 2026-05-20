import { useContext } from 'react';
import { PrimerCheckoutContext } from '../internal/PrimerCheckoutContext';
import type { PrimerCheckoutContextValue } from '../types/PrimerCheckoutProviderTypes';

/**
 * @deprecated Returns the full checkout context as a single object. Prefer the focused
 * hooks: `usePrimerSession()` for session state, `usePrimerCard()` for card-form actions,
 * `usePrimerVault()` for vaulted-method state. This hook stays exported for backward
 * compatibility but will be removed in a future major version.
 */
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
