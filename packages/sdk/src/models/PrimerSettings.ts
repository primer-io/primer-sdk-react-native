import type { PrimerCheckoutData } from './PrimerCheckoutData';
import type { PrimerCheckoutAdditionalInfo } from './PrimerCheckoutAdditionalInfo';
import type { PrimerCheckoutPaymentMethodData } from './PrimerCheckoutPaymentMethodData';
import type { PrimerClientSession } from './PrimerClientSession';
import type { PrimerPaymentMethodTokenData } from './PrimerPaymentMethodTokenData';
import type { PrimerError } from './PrimerError';
import type { IPrimerTheme } from './PrimerTheme';
import type {
  PrimerPaymentCreationHandler,
  PrimerTokenizationHandler,
  PrimerResumeHandler,
  PrimerErrorHandler,
  PrimerHeadlessUniversalCheckoutResumeHandler,
} from './PrimerHandlers';

export type PrimerSettings = IPrimerSettings;

interface IPrimerSettings {
  paymentHandling?: 'AUTO' | 'MANUAL';
  localeData?: IPrimerLocaleData;
  paymentMethodOptions?: IPrimerPaymentMethodOptions;
  uiOptions?: IPrimerUIOptions;
  debugOptions?: IPrimerDebugOptions;
  clientSessionCachingEnabled?: boolean;
  apiVersion?: PrimerApiVersion;

  // Dropin UI
  onBeforeClientSessionUpdate?: () => void;
  onClientSessionUpdate?: (clientSession: PrimerClientSession) => void;
  onBeforePaymentCreate?: (
    checkoutPaymentMethodData: PrimerCheckoutPaymentMethodData,
    handler: PrimerPaymentCreationHandler
  ) => void;
  onCheckoutComplete?: (checkoutData: PrimerCheckoutData) => void;
  onTokenizeSuccess?: (
    paymentMethodTokenData: PrimerPaymentMethodTokenData,
    handler: PrimerTokenizationHandler
  ) => void;
  onResumeSuccess?: (resumeToken: string, handler: PrimerResumeHandler) => void;
  onResumePending?: (additionalInfo: PrimerCheckoutAdditionalInfo) => void;
  onCheckoutReceivedAdditionalInfo?: (additionalInfo: PrimerCheckoutAdditionalInfo) => void;
  onError?: (
    error: PrimerError,
    checkoutData: PrimerCheckoutData | null,
    handler: PrimerErrorHandler | undefined
  ) => void;
  onDismiss?: () => void;

  headlessUniversalCheckoutCallbacks?: {
    onAvailablePaymentMethodsLoad?: (availablePaymentMethods: any[]) => void;
    onTokenizationStart?: (paymentMethodType: string) => void;
    onTokenizationSuccess?: (
      paymentMethodTokenData: PrimerPaymentMethodTokenData,
      handler: PrimerHeadlessUniversalCheckoutResumeHandler
    ) => void;

    onCheckoutResume?: (resumeToken: string, handler: PrimerHeadlessUniversalCheckoutResumeHandler) => void;
    onCheckoutPending?: (additionalInfo: PrimerCheckoutAdditionalInfo) => void;
    onCheckoutAdditionalInfo?: (additionalInfo: PrimerCheckoutAdditionalInfo) => void;

    onError?: (error: PrimerError, checkoutData: PrimerCheckoutData | null) => void;
    onCheckoutComplete?: (checkoutData: PrimerCheckoutData) => void;
    onBeforeClientSessionUpdate?: () => void;

    onClientSessionUpdate?: (clientSession: PrimerClientSession) => void;
    onBeforePaymentCreate?: (
      checkoutPaymentMethodData: PrimerCheckoutPaymentMethodData,
      handler: PrimerPaymentCreationHandler
    ) => void;
    onPreparationStart?: (paymentMethodType: string) => void;

    onPaymentMethodShow?: (paymentMethodType: string) => void;
  };
}

//----------------------------------------

interface IPrimerLocaleData {
  languageCode?: string;
  localeCode?: string;
}

//----------------------------------------

interface IPrimerPaymentMethodOptions {
  iOS?: {
    urlScheme?: string;
  };
  android?: {
    redirectScheme?: string;
  };
  apayaOptions?: IPrimerApayaOptions;
  applePayOptions?: IPrimerApplePayOptions;

  /**
   * @obsoleted The IPrimerCardPaymentOptions is obsoleted on v.2.14.0
   */
  cardPaymentOptions?: IPrimerCardPaymentOptions;

  goCardlessOptions?: IPrimerGoCardlessOptions;
  googlePayOptions?: IPrimerGooglePayOptions;
  klarnaOptions?: IPrimerKlarnaOptions;
  threeDsOptions?: IPrimerThreeDsOptions;
  stripeOptions?: IPrimerStripeOptions;
}

interface IPrimerApayaOptions {
  webViewTitle: string;
}

interface IPrimerApplePayOptions {
  merchantIdentifier: string;
  /**
   * @deprecated Use Client Session API to provide merchant name value: https://primer.io/docs/payment-methods/apple-pay/direct-integration#prepare-the-client-session
   */
  merchantName?: string;
  /**
   * @deprecated Use BillingOptions to configure required billing fields.
   */
  isCaptureBillingAddressEnabled: boolean;
  /**
   * If you don't want to present the Apple Pay option when the device doesn't support it, set this to `false`.
   * Default value is `true`.
   */
  showApplePayForUnsupportedDevice?: boolean;
  /**
   * Due to reports about the Apple Pay flow not presenting because `canMakePayments(usingNetworks:)` was returning false
   * when there were no cards in the Wallet, we introduced this flag to continue supporting the old behavior.
   * Default value is `true`.
   */
  checkProvidedNetworks?: boolean;
  shippingOptions?: IShippingOptions;
  billingOptions?: IBillingOptions;
}
interface IShippingOptions {
  shippingContactFields?: RequiredContactField[];
  requireShippingMethod: boolean;
}
interface IBillingOptions {
  requiredBillingContactFields?: RequiredContactField[];
}

type RequiredContactField = 'name' | 'emailAddress' | 'phoneNumber' | 'postalAddress';

interface IPrimerCardPaymentOptions {
  is3DSOnVaultingEnabled: boolean;
}

interface IPrimerGoCardlessOptions {
  businessName?: string;
  businessAddress?: string;
}

interface IPrimerGooglePayOptions {
  merchantName?: string;
  allowedCardNetworks?: string[];
  isCaptureBillingAddressEnabled?: boolean;
  isExistingPaymentMethodRequired?: boolean;
  shippingAddressParameters?: IPrimerGoogleShippingAddressParameters;
  requireShippingMethod?: boolean;
  emailAddressRequired?: boolean;
  buttonOptions?: IPrimerGooglePayButtonOptions;
}

interface IPrimerGooglePayButtonOptions {
  buttonType?: number;
  buttonTheme?: number;
}

interface IPrimerGoogleShippingAddressParameters {
  isPhoneNumberRequired?: boolean;
}

interface IPrimerKlarnaOptions {
  recurringPaymentDescription?: string;
  webViewTitle?: string;
}

//----------------------------------------

interface IPrimerUIOptions {
  isInitScreenEnabled?: boolean;
  isSuccessScreenEnabled?: boolean;
  isErrorScreenEnabled?: boolean;
  dismissalMechanism?: DismissalMechanism[];
  theme?: IPrimerTheme;
  cardFormUIOptions?: IPrimerCardFormUIOptions;
}

//----------------------------------------

export type DismissalMechanism = 'gestures' | 'closeButton';

//----------------------------------------

interface IPrimerDebugOptions {
  is3DSSanityCheckEnabled?: boolean;
}

//----------------------------------------

/**
 * Type representing the supported versions of the Primer API.
 */
export type PrimerApiVersion = '2.3' | '2.4' | 'latest';

//----------------------------------------

interface IPrimerThreeDsOptions {
  iOS?: {
    threeDsAppRequestorUrl?: string;
  };
  android?: {
    threeDsAppRequestorUrl?: string;
  };
}

//----------------------------------------

interface IPrimerStripeOptions {
  publishableKey?: string;
  mandateData?: IPrimerStripeTemplateMandateData | IPrimerFullMandateData;
}

interface IPrimerStripeMandateData {}

interface IPrimerStripeTemplateMandateData extends IPrimerStripeMandateData {
  merchantName: string;
}

interface IPrimerFullMandateData extends IPrimerStripeMandateData {
  fullMandateText: string;
  fullMandateStringResourceName?: string;
}

//----------------------------------------

interface IPrimerCardFormUIOptions {
  payButtonAddNewCard?: boolean;
}
