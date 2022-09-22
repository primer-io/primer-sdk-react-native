export type PrimerCheckoutAdditionalInfo = IPrimerCheckoutAdditionalInfo;

interface IPrimerCheckoutAdditionalInfo {}

export type MultibancoCheckoutAdditionalInfo = IMultibancoCheckoutAdditionalInfo;

interface IMultibancoCheckoutAdditionalInfo extends IPrimerCheckoutAdditionalInfo {
    expiresAt?: string;
    entity?: string;
    reference?: string;
}

export type PrimerCheckoutQRCodeInfo = IPrimerCheckoutQRCodeInfo;

interface IPrimerCheckoutQRCodeInfo extends IPrimerCheckoutAdditionalInfo {}

export type PromptPayCheckoutAdditionalInfo = IPromptPayCheckoutAdditionalInfo;

interface IPromptPayCheckoutAdditionalInfo extends IPrimerCheckoutQRCodeInfo {
    expiresAt: string;
    qrCodeUrl?: string;
    qrCodeBase64?: string;
}
