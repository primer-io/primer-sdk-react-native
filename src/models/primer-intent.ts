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

export type PrimerPaymentMethodIntent = ISinglePrimerPaymentMethodIntent;

interface ISinglePrimerPaymentMethodIntent {
  vault: boolean;
  paymentMethod: SinglePrimerPaymentMethod;
}

export type PrimerIntent =
  | ISinglePrimerPaymentMethodIntent
  | AnyPrimerPaymentMethodIntent;
