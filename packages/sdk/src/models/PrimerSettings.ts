
import type { PrimerCheckoutData } from "./PrimerCheckoutData";
import type { PrimerCheckoutAdditionalInfo } from "./PrimerCheckoutAdditionalInfo";
import type { PrimerCheckoutPaymentMethodData } from "./PrimerCheckoutPaymentMethodData";
import type { PrimerClientSession } from "./PrimerClientSession";
import type { PrimerPaymentMethodTokenData } from "./PrimerPaymentMethodTokenData";
import type { PrimerError } from "./PrimerError";
import type { IPrimerTheme } from "./PrimerTheme";
import type {
  PrimerPaymentCreationHandler,
  PrimerTokenizationHandler,
  PrimerResumeHandler,
  PrimerErrorHandler,
  PrimerHeadlessUniversalCheckoutResumeHandler
} from "./PrimerHandlers";

export type PrimerSettings = IPrimerSettings;

interface IPrimerSettings {
  paymentHandling?: 'AUTO' | 'MANUAL';
  localeData?: IPrimerLocaleData;
  paymentMethodOptions?: IPrimerPaymentMethodOptions;
  uiOptions?: IPrimerUIOptions;
  debugOptions?: IPrimerDebugOptions;

  // Dropin UI
  onBeforeClientSessionUpdate?: () => void;
  onClientSessionUpdate?: (clientSession: PrimerClientSession) => void;
  onBeforePaymentCreate?: (checkoutPaymentMethodData: PrimerCheckoutPaymentMethodData, handler: PrimerPaymentCreationHandler) => void;
  onCheckoutComplete?: (checkoutData: PrimerCheckoutData) => void;
  onTokenizeSuccess?: (paymentMethodTokenData: PrimerPaymentMethodTokenData, handler: PrimerTokenizationHandler) => void;
  onResumeSuccess?: (resumeToken: string, handler: PrimerResumeHandler) => void;
  onResumePending?: (additionalInfo: PrimerCheckoutAdditionalInfo) => void;
  onCheckoutReceivedAdditionalInfo?: (additionalInfo: PrimerCheckoutAdditionalInfo) => void;
  onError?: (error: PrimerError, checkoutData: PrimerCheckoutData | null, handler: PrimerErrorHandler | undefined) => void;
  onDismiss?: () => void;

  headlessUniversalCheckoutCallbacks?: {
    onAvailablePaymentMethodsLoad?: (availablePaymentMethods: any[]) => void;
    onTokenizationStart?: (paymentMethodType: string) => void;
    onTokenizationSuccess?: (paymentMethodTokenData: PrimerPaymentMethodTokenData, handler: PrimerHeadlessUniversalCheckoutResumeHandler) => void;

    onCheckoutResume?: (resumeToken: string, handler: PrimerHeadlessUniversalCheckoutResumeHandler) => void;
    onCheckoutPending?: (additionalInfo: PrimerCheckoutAdditionalInfo) => void;
    onCheckoutAdditionalInfo?: (additionalInfo: PrimerCheckoutAdditionalInfo) => void;

    onError?: (error: PrimerError, checkoutData: PrimerCheckoutData | null) => void;
    onCheckoutComplete?: (checkoutData: PrimerCheckoutData) => void;
    onBeforeClientSessionUpdate?: () => void;

    onClientSessionUpdate?: (clientSession: PrimerClientSession) => void;
    onBeforePaymentCreate?: (checkoutPaymentMethodData: PrimerCheckoutPaymentMethodData, handler: PrimerPaymentCreationHandler) => void;
    onPreparationStart?: (paymentMethodType: string) => void;

    onPaymentMethodShow?: (paymentMethodType: string) => void;
  }
}

//----------------------------------------

interface IPrimerLocaleData {
  languageCode?: string
  localeCode?: string
}

//----------------------------------------

interface IPrimerPaymentMethodOptions {
  iOS?: {
    urlScheme?: string;
  }
  android?: {
    redirectScheme?: string;
  },
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
  merchantName: string;
  isCaptureBillingAddressEnabled?: boolean;
  showApplePayForUnsupportedDevice?: boolean;
  checkProvidedNetworks?: boolean;
}

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
  theme?: IPrimerTheme;
}

//----------------------------------------

interface IPrimerDebugOptions {
  is3DSSanityCheckEnabled?: boolean;
}

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
  iOS?: {
    publishableKey?: string; // TODO TWS: iOS
  };
  android?: {
    publishableKey?: string;
  };
}
