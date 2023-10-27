import { IPrimerPaymentInstrumentData, IPrimerThreeDSAuthenticationData } from "./PrimerPaymentMethodTokenData";

export type PrimerVaultedPaymentMethod = IPrimerVaultedPaymentMethod;

export interface IPrimerVaultedPaymentMethod {
    id: String;
    analyticsId: String;
    paymentInstrumentType: String;
    paymentMethodType: String;
    paymentInstrumentData?: IPrimerPaymentInstrumentData;
    threeDSecureAuthentication?: IPrimerThreeDSAuthenticationData;
}
