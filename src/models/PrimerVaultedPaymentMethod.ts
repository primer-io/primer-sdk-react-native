import type { IPrimerPaymentInstrumentData, IPrimerThreeDSAuthenticationData } from './PrimerPaymentMethodTokenData';

export type PrimerVaultedPaymentMethod = IPrimerVaultedPaymentMethod;

export interface IPrimerVaultedPaymentMethod {
  id: string;
  analyticsId: string;
  paymentInstrumentType: string;
  paymentMethodType: string;
  paymentInstrumentData?: IPrimerPaymentInstrumentData;
  threeDSecureAuthentication?: IPrimerThreeDSAuthenticationData;
}
