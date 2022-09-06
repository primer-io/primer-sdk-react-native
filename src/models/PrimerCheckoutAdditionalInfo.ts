export type PrimerCheckoutAdditionalInfo = IPrimerCheckoutAdditionalInfo;

interface IPrimerCheckoutAdditionalInfo {}

export type MultibancoCheckoutAdditionalInfo = IMultibancoCheckoutAdditionalInfo;

interface IMultibancoCheckoutAdditionalInfo extends IPrimerCheckoutAdditionalInfo {
    expiresAt?: string;
    entity?: string;
    reference?: string;
}
