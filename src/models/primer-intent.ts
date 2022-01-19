const paymentMethods = [
  'ADYEN_ALIPAY',
  'ADYEN_DOTPAY',
  'ADYEN_GIROPAY',
  'ADYEN_IDEAL',
  'ADYEN_MOBILEPAY',
  'ADYEN_SOFORT',
  'ADYEN_TRUSTLY',
  'ADYEN_TWINT',
  'ADYEN_VIPPS',
  'APAYA',
  'APPLE_PAY',
  'ATOME',
  'BUCKAROO_BANCONTACT',
  'BUCKAROO_EPS',
  'BUCKAROO_GIROPAY',
  'BUCKAROO_IDEAL',
  'BUCKAROO_SOFORT',
  'GOCARDLESS',
  'GOOGLE_PAY',
  'HOOLAH',
  'KLARNA',
  'MOLLIE_BANCONTACT',
  'MOLLIE_IDEAL',
  'PAY_NL_BANCONTACT',
  'PAY_NL_GIROPAY',
  'PAY_NL_IDEAL',
  'PAY_NL_PAYCONIQ',
  'PAYMENT_CARD',
  'PAYPAL',
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
