import type { PrimerSessionIntent } from "./PrimerSessionIntent";
import type { PrimerSettings } from "./PrimerSettings";

export interface Primer {
  configure(settings: PrimerSettings): Promise<void>;
  showUniversalCheckout(clientToken: string): Promise<void>;
  showVaultManager(clientToken: string): Promise<void>;
  showPaymentMethod(
    paymentMethodType: string,
    intent: PrimerSessionIntent,
    clientToken: string
  ): Promise<void>
  dismiss(): void;
}

export interface PrimerPaymentCreationHandler {
  abortPaymentCreation(errorMessage: string | null): void;
  continuePaymentCreation(): void;
}

export interface PrimerTokenizationHandler {
  handleSuccess(): void;
  handleFailure(errorMessage: string | null): void;
  continueWithNewClientToken(newClientToken: string): void;
}

export interface PrimerResumeHandler {
  handleSuccess(): void;
  handleFailure(errorMessage: string | null): void;
  continueWithNewClientToken(newClientToken: string): void;
}

export interface PrimerErrorHandler {
  handleFailure(errorMessage: string | null): void;
}
