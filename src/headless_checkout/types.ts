export interface PrimerHeadlessUniversalCheckoutStartResponse {
  paymentMethodTypes: string[];
}

export interface PrimerError {
  errorId: string;
  description: string;
  recoverySuggestion?: string;
}

export interface PrimerHeadlessUniversalCheckoutCallbacks {
  onPreparationStarted?: () => void;
  onPaymentMethodPresented?: () => void;
  onTokenizeStart?: () => void;
  onTokenizeSuccess?: (paymentMethod: any) => void;
  onResumeSuccess?: (resumeToken: string) => void;
  onFailure?: (error: PrimerError) => void;
}
