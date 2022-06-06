import type { PrimerErrorHandler, PrimerPaymentCreationHandler, PrimerResumeHandler, PrimerTokenizationHandler } from "./Primer";
import type { PrimerCheckoutData } from "./PrimerCheckoutData";
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
  // PrimerErrorHandler will be undefined on the HUC flow.
  onError?: (error: PrimerError, checkoutData: PrimerCheckoutData | null, handler: PrimerErrorHandler | undefined) => void;
  
  // Only on main SDK
  onDismiss?: () => void;

  // Only on HUC
  onHUCPrepareStart?: (paymentMethod: string) => void;
  onHUCTokenizeStart?: (paymentMethod: string) => void;
  onHUCPaymentMethodPresent?: (paymentMethod: string) => void;
  onHUCClientSessionSetup?: (paymentMethods: string[]) => void;
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
