const paymentMethods = [
  'Card',
  'PayPal',
  'Klarna',
  'ApplePay',
  'GooglePay',
  'GoCardless',
] as const;

export type SinglePrimerPaymentMethod = typeof paymentMethods[number];
export interface AnyPrimerPaymentMethodIntent {
  vault: boolean;
  paymentMethod: 'Any';
}

export interface ISinglePrimerPaymentMethodIntent {
  vault: boolean;
  paymentMethod: SinglePrimerPaymentMethod;
}

export type IPrimerIntent =
  | ISinglePrimerPaymentMethodIntent
  | AnyPrimerPaymentMethodIntent;
