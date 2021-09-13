export interface IPaymentMethodToken<T, U extends PaymentInstrumentType> {
  token: string;
  analyticsId: string;
  tokenType: TokenType;
  paymentInstrumentData: T;
  paymentInstrumentType: U;
  threeDSecureAuthentication: Nullable<ThreeDSAuthenticationData>;
  vaultData: Nullable<VaultData>;
}

enum PaymentInstrumentType {
  CARD = 'PAYMENT_CARD',
  APPLE_PAY = 'APPLE_PAY',
  GOOGLE_PAY = 'GOOGLE_PAY',
  PAYPAL = 'PAYPAL_ORDER',
  PAYPAL_VAULTED = 'PAYPAL_BILLING_AGREEMENT',
  GO_CARDLESS = 'GOCARDLESS',
  PAY_NL_IDEAL = 'PAY_NL_IDEAL',
}

enum TokenType {
  SINGLE_USE = 'SINGLE_USE',
  MULTI_USE = 'MULTI_USE',
}

interface VaultData {
  customerId: string;
}

interface ThreeDSAuthenticationData {
  responseCode: ThreeDSecureStatus;
  reasonCode?: string;
  reasonText?: string;
  protocolVersion: string;
  challengeIssued: boolean;
}

enum ThreeDSecureStatus {
  SUCCESS = 'AUTH_SUCCESS',
  FAILED = 'AUTH_FAILED',
  SKIPPED = 'SKIPPED',
  CHALLENGE = 'CHALLENGE',
}

type Nullable<T> = T | null;

export type PaymentInstrumentToken =
  | PaymentCardToken
  | PayPalBillingAgreementToken
  | GoCardlessToken
  | IdealPayToken
  | IPaymentMethodToken<any, any>;

type PaymentCardToken = IPaymentMethodToken<
  PaymentCardDetails,
  PaymentInstrumentType.CARD
>;

type PayPalBillingAgreementToken = IPaymentMethodToken<
  PayPalBillingAgreementDetails,
  PaymentInstrumentType.PAYPAL_VAULTED
>;

type GoCardlessToken = IPaymentMethodToken<
  GoCardlessDetails,
  PaymentInstrumentType.GO_CARDLESS
>;

type IdealPayToken = IPaymentMethodToken<
  Record<string, never>,
  PaymentInstrumentType.PAY_NL_IDEAL
>;

interface PaymentCardDetails {
  last4Digits: string;
  cardholderName: string;
  network: string;
}

interface PayPalBillingAgreementDetails {
  paypalBillingAgreementId: string;
  externalPayerInfo?: ExternalPayerInfo;
  shippingAddress?: BillingAddress;
}

interface GoCardlessDetails {
  gocardlessMandateId: string;
}

interface ExternalPayerInfo {
  externalPayerId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

interface BillingAddress {
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string;
  addressLine3?: string;
  city: string;
  state?: string;
  countryCode: Alpha2CountryCode;
  postalCode: string;
}

type Alpha2CountryCode = 'ES' | 'FR' | 'GB' | 'DE' | 'PL' | 'IT';
