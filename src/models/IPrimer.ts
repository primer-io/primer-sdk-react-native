import type { IPrimerCheckoutData } from "./IPrimerCheckoutData";
import type { IPrimerCheckoutPaymentMethodData } from "./IPrimerCheckoutPaymentMethodData";
import type { IPrimerClientSession } from "./IPrimerClientSession";
import type { PrimerSessionIntent } from "./PrimerSessionIntent";
import type { PrimerPaymentMethodTokenData } from "./PrimerPaymentMethodTokenData";
import type { PrimerSettings } from "./PrimerSettings";

export interface IPrimer {
  configure(settings: PrimerSettings): Promise<void>;
  showUniversalCheckout(clientToken: string): Promise<void>;
  showVaultManager(clientToken: string): Promise<void>;
  showPaymentMethod(
    paymentMethodType: string,
    intent: PrimerSessionIntent,
    clientToken: string
  ): Promise<void>
  dismiss(): void;

  onBeforeClientSessionUpdate?: () => void;
  onClientSessionUpdate?: (clientSession: IPrimerClientSession) => void;
  onBeforePaymentCreate?: (checkoutPaymentMethodData: IPrimerCheckoutPaymentMethodData, handler: PaymentCreationHandler) => void;
  onCheckoutComplete?: (checkoutData: IPrimerCheckoutData) => void;
  onCheckoutFail?: (error: Error, handler: ErrorHandler) => void;
  onTokenizeSuccess?: (paymentMethodTokenData: PrimerPaymentMethodTokenData, handler: TokenizationHandler) => void;
  onResumeSuccess?: (resumeToken: string, handler: ResumeHandler) => void;
}

export interface PaymentCreationHandler {
  abortPaymentCreation(errorMessage?: string): void;
  continuePaymentCreation(): void;
}

export interface TokenizationHandler {
  handleSuccess(): void;
  handleFailure(errorMessage?: string): void;
  continueWithNewClientToken(newClientToken: string): void;
}

export interface ResumeHandler {
  handleSuccess(): void;
  handleFailure(errorMessage?: string): void;
  continueWithNewClientToken(newClientToken: string): void;
}

export interface ErrorHandler {
  handleFailure(errorMessage?: string): void;
}
