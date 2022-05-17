import type { IPrimerTheme } from "./primer-theme";

export type PrimerSettings = IPrimerSettings;

interface IPrimerSettings {
  paymentHandling?: 'AUTO' | 'MANUAL';
  localeData?: IPrimerLocaleData;
  paymentMethodOptions?: IPrimerPaymentMethodOptions;
  uiOptions?: IPrimerUIOptions;
  debugOptions?: IPrimerDebugOptions;
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
