export type PrimerPaymentMethodTokenData = IPrimerPaymentMethodTokenData;

export interface IPrimerPaymentMethodTokenData {
  analyticsId?: string;
  id?: string;
  isVaulted?: boolean;
  paymentInstrumentData: IPrimerPaymentInstrumentData;
  paymentInstrumentType: string;
  token: string;
  tokenType?: PrimerTokenType;
  threeDSecureAuthentication?: IPrimerThreeDSAuthenticationData;
  vaultData?: IPrimerVaultData;
}

export enum PrimerTokenType {
  SINGLE_USE = 'SINGLE_USE',
  MULTI_USE = 'MULTI_USE',
}

export interface IPrimerThreeDSAuthenticationData {
  challengeIssued?: boolean;
  protocolVersion?: string;
  reasonCode?: string;
  reasonText?: string;
  responseCode?: string;
}

export interface IPrimerVaultData {
  customerId?: string;
}

export interface IPrimerPaymentInstrumentData {
  paymentMethodType?: string;
  first6Digits?: number;
  last4Digits?: number;
  expirationMonth?: number;
  expirationYear?: number;
  cardholderName?: string;
  network?: string;
  klarnaCustomerToken?: string;
  sessionData?: IKlarnaSessionData;
  externalPayerInfo?: IExternalPayerInfo;
  binData?: IBinData;
  accountNumberLast4Digits?: number;
  bankName?: string;
}

export interface IKlarnaSessionData {
  recurringDescription?: string;
  billingAddress?: IKlarnaBillingAddress;
}

export interface IKlarnaBillingAddress {
  email?: string;
}

export interface IExternalPayerInfo {
  email: string;
  externalPayerId?: string;
  firstName?: string;
  lastName?: string;
}

export interface IShippingAddress {
  firstName?: string;
  lastName?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  countryCode?: string;
  postalCode?: string;
}

export interface IBinData {
  network?: string;
  issuerCountryCode?: string;
  issuerName?: string;
  issuerCurrencyCode?: string;
  regionalRestriction?: string;
  accountNumberType?: string;
  accountFundingType?: string;
  prepaidReloadableIndicator?: string;
  productUsageType?: string;
  productCode?: string;
  productName?: string;
}
