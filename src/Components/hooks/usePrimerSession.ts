import { useContext } from 'react';
import { PrimerCheckoutContext } from '../internal/PrimerCheckoutContext';
import type { PrimerSessionController } from '../types/PrimerCheckoutProviderTypes';

/**
 * Read session-scoped state: lifecycle (`isReady`, `error`), `clientSession`,
 * available payment methods, and the resource-loading flags. Read-only — actions
 * for the active payment attempt live on `usePrimerCard()`.
 */
export function usePrimerSession(): PrimerSessionController {
  const context = useContext(PrimerCheckoutContext);
  if (context === null) {
    throw new Error(
      'usePrimerSession must be used within a <PrimerCheckoutProvider>. ' +
        'Wrap your component tree with <PrimerCheckoutProvider clientToken="...">.'
    );
  }
  return context;
}
