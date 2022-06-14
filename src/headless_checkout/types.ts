import type { PrimerCheckoutData } from '../models/PrimerCheckoutData';
import type { PrimerCheckoutPaymentMethodData } from '../models/PrimerCheckoutPaymentMethodData';
import type { 
  PrimerTokenizationHandler, 
  PrimerResumeHandler, 
  PrimerPaymentCreationHandler, 
  PrimerErrorHandler
} from '../models/PrimerInterfaces';
import type { PrimerClientSession } from '../models/PrimerClientSession';
import type { PrimerPaymentMethodTokenData } from '../models/PrimerPaymentMethodTokenData'; 
import type { PrimerError } from '../models/PrimerError';

export interface PrimerHeadlessUniversalCheckoutStartResponse {
  paymentMethodTypes: string[];
}

export interface PrimerHeadlessUniversalCheckoutCallbacks {
  // Common
  onBeforeClientSessionUpdate?: () => void;
  onClientSessionUpdate?: (clientSession: PrimerClientSession) => void;
  onBeforePaymentCreate?: (checkoutPaymentMethodData: PrimerCheckoutPaymentMethodData, handler: PrimerPaymentCreationHandler) => void;
  onCheckoutComplete?: (checkoutData: PrimerCheckoutData) => void;
  onTokenizeSuccess?: (paymentMethodTokenData: PrimerPaymentMethodTokenData, handler: PrimerTokenizationHandler) => void;
  onResumeSuccess?: (resumeToken: string, handler: PrimerResumeHandler) => void;
  onError?: (error: PrimerError, checkoutData: PrimerCheckoutData | null, handler: PrimerErrorHandler | undefined) => void;

  // Only on HUC
  onHUCPrepareStart?: (paymentMethod: string) => void;
  onHUCTokenizeStart?: (paymentMethod: string) => void;
  onHUCPaymentMethodShow?: (paymentMethod: string) => void;
  onHUCAvailablePaymentMethodsLoaded?: (paymentMethods: string[]) => void;
}
