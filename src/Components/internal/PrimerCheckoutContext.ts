import { createContext } from 'react';
import type { PrimerCheckoutContextValue } from '../types/PrimerCheckoutProviderTypes';

export const PrimerCheckoutContext = createContext<PrimerCheckoutContextValue | null>(null);
