import type { ReactNode } from 'react';
import type { PrimerSettings, IPrimerLocaleData } from '../PrimerSettings';
import type { PrimerError } from '../PrimerError';
import type { PrimerClientSession } from '../PrimerClientSession';
import type { PrimerCheckoutData } from '../PrimerCheckoutData';
import type { PrimerCheckoutPaymentMethodData } from '../PrimerCheckoutPaymentMethodData';
import type { PrimerPaymentMethodTokenData } from '../PrimerPaymentMethodTokenData';
import type { PrimerHeadlessUniversalCheckoutResumeHandler, PrimerPaymentCreationHandler } from '../PrimerHandlers';
import type { IPrimerHeadlessUniversalCheckoutPaymentMethod } from '../PrimerHeadlessUniversalCheckoutPaymentMethod';

export interface PrimerCheckoutProviderProps {
  clientToken: string;
  settings?: PrimerSettings;
  onCheckoutComplete?: (checkoutData: PrimerCheckoutData) => void;
  onTokenizationSuccess?: (
    paymentMethodTokenData: PrimerPaymentMethodTokenData,
    handler: PrimerHeadlessUniversalCheckoutResumeHandler
  ) => void;
  onBeforePaymentCreate?: (
    checkoutPaymentMethodData: PrimerCheckoutPaymentMethodData,
    handler: PrimerPaymentCreationHandler
  ) => void;
  onError?: (error: PrimerError, checkoutData: PrimerCheckoutData | null) => void;
  children?: ReactNode;
}

export interface PrimerCheckoutContextValue {
  isReady: boolean;
  error: PrimerError | null;
  clientSession: PrimerClientSession | null;
  availablePaymentMethods: IPrimerHeadlessUniversalCheckoutPaymentMethod[];
  localeData?: IPrimerLocaleData;
}
