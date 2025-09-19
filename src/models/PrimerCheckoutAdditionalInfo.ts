export type PrimerCheckoutAdditionalInfo = IPrimerCheckoutAdditionalInfo;

interface IPrimerCheckoutAdditionalInfo {
  /**
   * The name of this additional info.
   */
  additionalInfoName: string;
}

export type MultibancoCheckoutAdditionalInfo = IMultibancoCheckoutAdditionalInfo;
interface IMultibancoCheckoutAdditionalInfo extends IPrimerCheckoutAdditionalInfo {
  expiresAt?: string;
  entity?: string;
  reference?: string;
  additionalInfoName: 'MultibancoCheckoutAdditionalInfo';
}

export type PrimerCheckoutQRCodeInfo = IPrimerCheckoutQRCodeInfo;

interface IPrimerCheckoutQRCodeInfo extends IPrimerCheckoutAdditionalInfo {}

export type PromptPayCheckoutAdditionalInfo = IPromptPayCheckoutAdditionalInfo;
interface IPromptPayCheckoutAdditionalInfo extends IPrimerCheckoutQRCodeInfo {
  expiresAt: string;
  qrCodeUrl?: string;
  qrCodeBase64?: string;
  additionalInfoName: 'PromptPayCheckoutAdditionalInfo';
}

export type PrimerCheckoutVoucherAdditionalInfo = IPrimerCheckoutVoucherAdditionalInfo;

interface IPrimerCheckoutVoucherAdditionalInfo extends IPrimerCheckoutAdditionalInfo {}

export type XenditCheckoutVoucherAdditionalInfo = IXenditCheckoutVoucherAdditionalInfo;
interface IXenditCheckoutVoucherAdditionalInfo extends IPrimerCheckoutVoucherAdditionalInfo {
  expiresAt: string;
  couponCode: string;
  retailerName: string;
  additionalInfoName: 'XenditCheckoutVoucherAdditionalInfo';
}

export type DisplayStripeAchMandateAdditionalInfo = {
  additionalInfoName: 'DisplayStripeAchMandateAdditionalInfo';
} & IPrimerCheckoutAdditionalInfo;
