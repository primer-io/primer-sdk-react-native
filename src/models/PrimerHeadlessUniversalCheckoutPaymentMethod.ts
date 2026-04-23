export type PrimerPaymentMethodManagerCategoryName = 'NATIVE_UI' | 'RAW_DATA' | 'CARD_COMPONENTS';
export type PrimerSessionIntentName = 'CHECKOUT' | 'VAULT';

export interface IPrimerHeadlessUniversalCheckoutPaymentMethod {
  paymentMethodType: string;
  paymentMethodManagerCategories: PrimerPaymentMethodManagerCategoryName[];
  supportedPrimerSessionIntents: PrimerSessionIntentName[];
}
