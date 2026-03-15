import { createContext } from 'react';
import type { PrimerCheckoutContextValue } from '../../models/components/PrimerCheckoutProviderTypes';

export const PrimerCheckoutContext = createContext<PrimerCheckoutContextValue | null>(null);
