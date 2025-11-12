import { createContext } from 'react';
import type { PrimerCheckoutContextValue } from '../../models/components/PrimerCheckoutProviderTypes';

/**
 * Context for Primer Components API
 * @internal This is a private implementation detail
 */
export const PrimerCheckoutContext = createContext<PrimerCheckoutContextValue | null>(null);
