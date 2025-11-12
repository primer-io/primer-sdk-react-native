import { useContext } from 'react';
import { PrimerCheckoutContext } from '../internal/PrimerCheckoutContext';
import type { PrimerCheckoutContextValue } from '../../models/components/PrimerCheckoutProviderTypes';

/**
 * Hook to access Primer Checkout context
 *
 * Must be used within a PrimerCheckoutProvider component.
 *
 * @returns The Primer Checkout context value
 * @throws Error if used outside PrimerCheckoutProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isReady, availablePaymentMethods } = usePrimerCheckout();
 *
 *   if (!isReady) {
 *     return <LoadingSpinner />;
 *   }
 *
 *   return <PaymentMethodList methods={availablePaymentMethods} />;
 * }
 * ```
 */
export function usePrimerCheckout(): PrimerCheckoutContextValue {
  const context = useContext(PrimerCheckoutContext);

  if (!context) {
    throw new Error(
      'usePrimerCheckout must be used within a PrimerCheckoutProvider. ' +
        'Wrap your component tree with <PrimerCheckoutProvider> to use this hook.'
    );
  }

  return context;
}
