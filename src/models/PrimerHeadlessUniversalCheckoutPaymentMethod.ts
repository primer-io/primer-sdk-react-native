export interface IPrimerHeadlessUniversalCheckoutPaymentMethod {
  paymentMethodType: string;
  paymentMethodManagerCategories: ('NATIVE_UI' | 'RAW_DATA' | 'CARD_COMPONENTS')[];
  supportedPrimerSessionIntents: ('CHECKOUT' | 'VAULT')[];
}
