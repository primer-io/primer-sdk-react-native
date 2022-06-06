import type { PrimerCheckoutData, PrimerCheckoutPaymentMethodData, PrimerClientSession, PrimerErrorHandler, PrimerPaymentCreationHandler, PrimerPaymentMethodTokenData, PrimerResumeHandler, PrimerTokenizationHandler } from "..";

export interface PrimerHeadlessUniversalCheckoutStartResponse {
  paymentMethodTypes: string[];
}

export interface PrimerError {
  errorId: string;
  description: string;
  recoverySuggestion?: string;
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
  onHUCPaymentMethodPresent?: (paymentMethod: string) => void;
  onHUCClientSessionSetup?: (paymentMethods: string[]) => void;
}
