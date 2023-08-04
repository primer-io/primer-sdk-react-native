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
  
  export interface PrimerHeadlessUniversalCheckoutResumeHandler {
    continueWithNewClientToken(newClientToken: string): void;
    complete(): void;
  }
  
  export interface PrimerErrorHandler {
    showErrorMessage(errorMessage: string | null): void;
  }