import { NativeModules } from 'react-native';
import type { PaymentInstrumentToken } from './models/payment-instrument-token';
import type { IPrimer } from './models/primer';
import type {
  OnDismissCallback,
  OnPrimerErrorCallback,
  OnTokenAddedToVaultCallback,
  OnTokenizeSuccessCallback,
} from './models/primer-callbacks';
import type { IPrimerConfig } from './models/primer-config';
import type { PrimerException } from './models/primer-exception';
import type {
  IPrimerIntent,
  ISinglePrimerPaymentMethodIntent,
} from './models/primer-intent';
import type { IPrimerSettings } from './models/primer-settings';
import type { IPrimerTheme } from './models/primer-theme';
import { parseCallback, parseCallbackResume } from './utils';

const { PrimerRN: NativeModule } = NativeModules;

export const PrimerNativeMapping: IPrimer = {
  showUniversalCheckout(token: String, config: IPrimerConfig): void {
    configure({ vault: false, paymentMethod: 'Any' }, config);
    NativeModule.initialize(token);
  },

  showVaultManager(token: String, config: IPrimerConfig): void {
    configure({ vault: true, paymentMethod: 'Any' }, config);
    NativeModule.initialize(token);
  },

  showSinglePaymentMethod(
    token: String,
    intent: ISinglePrimerPaymentMethodIntent,
    config: IPrimerConfig
  ): void {
    configure(intent, config);
    NativeModule.initialize(token);
  },

  fetchSavedPaymentInstruments(
    token: String,
    callback: (data: any) => void
  ): void {
    NativeModule.fetchSavedPaymentInstruments(token, callback);
  },

  dispose(): void {
    NativeModule.dispose();
  },
};

function configure(intent: IPrimerIntent, config: IPrimerConfig): void {
  configureIntent(intent);
  configureTheme(config.theme);
  configureSettings(config.settings);
  configureOnVaultSuccess(config.onTokenAddedToVault);
  configureOnDismiss(config.onDismiss);
  configureOnPrimerError(config.onPrimerError);
  configureOnTokenizeSuccess(config.onTokenizeSuccess);
}

function configureSettings(settings: IPrimerSettings = {}): void {
  const data = JSON.stringify(settings);
  NativeModule.configureSettings(data);
}

function configureTheme(theme: IPrimerTheme = {}): void {
  const data = JSON.stringify(theme);
  NativeModule.configureTheme(data);
}

function configureIntent(
  intent: IPrimerIntent = { vault: false, paymentMethod: 'Any' }
): void {
  const data = JSON.stringify(intent);
  NativeModule.configureIntent(data);
}

function resume() {
  const data = JSON.stringify({
    intent: 'success',
    token: 'none',
    metadata: {
      message: 'none',
    },
  });
  NativeModule.resume(data);
}

function configureOnTokenizeSuccess(
  callback: OnTokenizeSuccessCallback = (_) => {}
) {
  NativeModule.configureOnTokenizeSuccess((data: any) => {
    console.log('token:', data);
    parseCallbackResume<PaymentInstrumentToken>(data, callback, resume);
  });
}

function configureOnVaultSuccess(
  callback: OnTokenAddedToVaultCallback = (_) => {}
) {
  NativeModule.configureOnVaultSuccess((data: any) => {
    console.log('vault:', data);
    parseCallback<PaymentInstrumentToken>(data, callback);
  });
}

function configureOnDismiss(callback: OnDismissCallback = () => {}) {
  NativeModule.configureOnDismiss((_: any) => {
    console.log('dismiss:');
    callback();
  });
}

function configureOnPrimerError(callback: OnPrimerErrorCallback = (_) => {}) {
  NativeModule.configureOnPrimerError((data: any) => {
    console.log('error:', data);
    parseCallback<PrimerException>(data, callback);
  });
}
