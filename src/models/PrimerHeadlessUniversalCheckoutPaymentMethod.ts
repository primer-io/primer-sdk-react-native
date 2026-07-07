export type PrimerPaymentMethodManagerCategoryName =
  | 'NATIVE_UI'
  | 'RAW_DATA'
  | 'CARD_COMPONENTS'
  | 'COMPONENT_WITH_REDIRECT';
export type PrimerSessionIntentName = 'CHECKOUT' | 'VAULT';

export interface IPrimerHeadlessUniversalCheckoutPaymentMethod {
  paymentMethodType: string;
  paymentMethodManagerCategories: PrimerPaymentMethodManagerCategoryName[];
  supportedPrimerSessionIntents: PrimerSessionIntentName[];
}
