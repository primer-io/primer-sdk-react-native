import type { ReactNode } from 'react';
import type { PrimerSettings } from '../PrimerSettings';
import type { PrimerError } from '../PrimerError';
import type { PrimerClientSession } from '../PrimerClientSession';
import type { PrimerCheckoutData } from '../PrimerCheckoutData';
import type { PrimerCheckoutPaymentMethodData } from '../PrimerCheckoutPaymentMethodData';
import type { PrimerPaymentMethodTokenData } from '../PrimerPaymentMethodTokenData';
import type { PrimerHeadlessUniversalCheckoutResumeHandler, PrimerPaymentCreationHandler } from '../PrimerHandlers';
import type { IPrimerHeadlessUniversalCheckoutPaymentMethod } from '../PrimerHeadlessUniversalCheckoutPaymentMethod';
import type { PrimerPaymentMethodAsset, PrimerPaymentMethodNativeView } from '../PrimerPaymentMethodResource';
import type { PrimerThemeOverride } from '../../Components/internal/theme/types';

export interface PrimerCheckoutProviderProps {
  clientToken: string;
  settings?: PrimerSettings;
  theme?: PrimerThemeOverride;
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
  paymentMethodResources: (PrimerPaymentMethodAsset | PrimerPaymentMethodNativeView)[];
  isLoadingResources: boolean;
}
