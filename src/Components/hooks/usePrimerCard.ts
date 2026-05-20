import { useContext } from 'react';
import { PrimerCheckoutContext } from '../internal/PrimerCheckoutContext';
import type { PrimerCardController } from '../types/PrimerCheckoutProviderTypes';

/**
 * Read card form state and active-payment actions: `cardFormState`, `activeMethod`,
 * `paymentOutcome`, plus `setRawData` / `setBillingAddress` / `submit` / `retry`.
 */
export function usePrimerCard(): PrimerCardController {
  const context = useContext(PrimerCheckoutContext);
  if (context === null) {
    throw new Error(
      'usePrimerCard must be used within a <PrimerCheckoutProvider>. ' +
        'Wrap your component tree with <PrimerCheckoutProvider clientToken="...">.'
    );
  }
  return context;
}
