export interface PrimerImplementedRNCallbacks {
  onAvailablePaymentMethodsLoad: boolean;
  onTokenizationStart: boolean;
  onTokenizationSuccess: boolean;

  onCheckoutResume: boolean;
  onCheckoutPending: boolean;
  onCheckoutAdditionalInfo: boolean;

  onError: boolean;
  onCheckoutComplete: boolean;
  onBeforeClientSessionUpdate: boolean;

  onClientSessionUpdate: boolean;
  onBeforePaymentCreate: boolean;
  onPreparationStart: boolean;

  onPaymentMethodShow: boolean;
  onDismiss: boolean;
}
