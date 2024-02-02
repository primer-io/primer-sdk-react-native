import { PrimerVaultedPaymentMethod } from "./PrimerVaultedPaymentMethod";

export type PrimerVaultedPaymentMethodResult = IPrimerVaultedPaymentMethodResult;

export interface IPrimerVaultedPaymentMethodResult {
    paymentMethods: PrimerVaultedPaymentMethod[];
}