export interface IPrimer {
  showUniversalCheckout(clientToken: string): Promise<void>;
  showVaultManager(clientToken: string): Promise<void>;
  showPaymentMethod(
    paymentMethodType: string,
    intent: 'CHECKOUT' | 'VAULT',
    clientToken: string
  ): Promise<void>
  dismiss(): void;

  onBeforeClientSessionUpdate?: () => void;
  onClientSessionUpdate?: (clientSession: any) => void;
  onBeforePaymentCreate?: (paymentMethodTokenData: any, handler: PaymentCreationHandler) => void;
  onCheckoutComplete?: (checkoutData: any) => void;
  onCheckoutFail?: (error: Error, handler: ErrorHandler) => void;
  onTokenizeSuccess?: (paymentMethodTokenData: any, handler: TokenizationHandler) => void;
  onResumeSuccess?: (resumeTokenData: any, handler: ResumeHandler) => void;
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
