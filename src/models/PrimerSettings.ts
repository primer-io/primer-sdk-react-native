import type {
  PrimerErrorHandler,
  PrimerPaymentCreationHandler,
  PrimerResumeHandler,
  PrimerTokenizationHandler
} from "./PrimerInterfaces";
import type { PrimerCheckoutData } from "./PrimerCheckoutData";
import type { PrimerCheckoutAdditionalInfo } from "./PrimerCheckoutAdditionalInfo";
import type { PrimerCheckoutPaymentMethodData } from "./PrimerCheckoutPaymentMethodData";
import type { PrimerClientSession } from "./PrimerClientSession";
import type { PrimerPaymentMethodTokenData } from "./PrimerPaymentMethodTokenData";
import type { PrimerError } from "./PrimerError";
import type { IPrimerTheme } from "./PrimerTheme";

export type PrimerSettings = IPrimerSettings;

interface IPrimerSettings {
  paymentHandling?: 'AUTO' | 'MANUAL';
  localeData?: IPrimerLocaleData;
  paymentMethodOptions?: IPrimerPaymentMethodOptions;
  uiOptions?: IPrimerUIOptions;
  debugOptions?: IPrimerDebugOptions;

  // Common
  onBeforeClientSessionUpdate?: () => void;
  onClientSessionUpdate?: (clientSession: PrimerClientSession) => void;
  onBeforePaymentCreate?: (checkoutPaymentMethodData: PrimerCheckoutPaymentMethodData, handler: PrimerPaymentCreationHandler) => void;
  onCheckoutComplete?: (checkoutData: PrimerCheckoutData) => void;
  onTokenizeSuccess?: (paymentMethodTokenData: PrimerPaymentMethodTokenData, handler: PrimerTokenizationHandler) => void;
  onResumeSuccess?: (resumeToken: string, handler: PrimerResumeHandler) => void;
  onResumePending?: (additionalInfo: PrimerCheckoutAdditionalInfo) => void;
  onCheckoutReceivedAdditionalInfo?: (additionalInfo: PrimerCheckoutAdditionalInfo) => void;
  // PrimerErrorHandler will be undefined on the HUC flow.
  onError?: (error: PrimerError, checkoutData: PrimerCheckoutData | null, handler: PrimerErrorHandler | undefined) => void;

  // Only on main SDK
  onDismiss?: () => void;

  // Only on HUC
  onPrepareStart?: (paymentMethod: string) => void;
  onTokenizeStart?: (paymentMethod: string) => void;
  onPaymentMethodShow?: (paymentMethod: string) => void;
  onAvailablePaymentMethodsLoad?: (paymentMethods: string[]) => void;
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
}

interface IPrimerApayaOptions {
  webViewTitle: string;
}

interface IPrimerApplePayOptions {
  merchantIdentifier: string;
  merchantName: string;
  isCaptureBillingAddressEnabled?: boolean;
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
