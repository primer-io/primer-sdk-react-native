import { useContext } from 'react';
import { PrimerCheckoutContext } from '../internal/PrimerCheckoutContext';
import type { PrimerVaultController } from '../types/PrimerCheckoutProviderTypes';

/**
 * Read vaulted-method state and actions: `vaultedMethods`, `activeVaultedMethodId`,
 * loading/error flags, plus `payFromVault` / `selectVaultedMethodId`.
 */
export function usePrimerVault(): PrimerVaultController {
  const context = useContext(PrimerCheckoutContext);
  if (context === null) {
    throw new Error(
      'usePrimerVault must be used within a <PrimerCheckoutProvider>. ' +
        'Wrap your component tree with <PrimerCheckoutProvider clientToken="...">.'
    );
  }
  return context;
}
