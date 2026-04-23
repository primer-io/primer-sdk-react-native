import type { ReactNode } from 'react';
import type { PrimerSettings } from '../../models/PrimerSettings';
import type { PrimerError } from '../../models/PrimerError';
import type { PrimerClientSession } from '../../models/PrimerClientSession';
import type { PrimerCheckoutData } from '../../models/PrimerCheckoutData';
import type { PrimerCheckoutPaymentMethodData } from '../../models/PrimerCheckoutPaymentMethodData';
import type { PrimerPaymentMethodTokenData } from '../../models/PrimerPaymentMethodTokenData';
import type {
  PrimerHeadlessUniversalCheckoutResumeHandler,
  PrimerPaymentCreationHandler,
} from '../../models/PrimerHandlers';
import type { IPrimerHeadlessUniversalCheckoutPaymentMethod } from '../../models/PrimerHeadlessUniversalCheckoutPaymentMethod';
import type { PrimerPaymentMethodAsset, PrimerPaymentMethodNativeView } from '../../models/PrimerPaymentMethodResource';
import type { PrimerThemeOverride } from '../internal/theme/types';

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
  paymentMethodResources: Array<PrimerPaymentMethodAsset | PrimerPaymentMethodNativeView>;
  isLoadingResources: boolean;
  resourcesError: Error | null;
}
