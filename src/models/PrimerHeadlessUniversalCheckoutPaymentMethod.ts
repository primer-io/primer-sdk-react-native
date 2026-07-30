export type PrimerPaymentMethodManagerCategoryName =
  | 'NATIVE_UI'
  | 'RAW_DATA'
  | 'CARD_COMPONENTS'
  | 'COMPONENT_WITH_REDIRECT'
  | 'KLARNA'
  | 'STRIPE_ACH';
export type PrimerSessionIntentName = 'CHECKOUT' | 'VAULT';

export interface IPrimerHeadlessUniversalCheckoutPaymentMethod {
  paymentMethodType: string;
  paymentMethodManagerCategories: PrimerPaymentMethodManagerCategoryName[];
  supportedPrimerSessionIntents: PrimerSessionIntentName[];
}
