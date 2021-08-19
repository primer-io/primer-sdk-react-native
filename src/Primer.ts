import { NativeModules } from 'react-native';
import type { IPrimer } from './models/primer';
import type {
  OnDismissCallback,
  OnPrimerErrorCallback,
  OnTokenAddedToVaultCallback,
  OnTokenizeSuccessCallback,
} from './models/primer-callbacks';
import type { IPrimerConfig } from './models/primer-config';
import type { PrimerIntent } from './models/primer-intent';
import type { IPrimerSettings } from './models/primer-settings';
import type { IPrimerTheme } from './models/primer-theme';
import { parseCallback, parseCallbackResume } from './utils';

const { PrimerRN: NativeModule } = NativeModules;

export const PrimerNativeMapping: IPrimer = {
  init(token: String, config: IPrimerConfig): void {
    configureSettings(config.settings);
    configureTheme(config.theme);
    configureFlow(config.intent);
    configureOnVaultSuccess(config.onTokenAddedToVault);
    configureOnDismiss(config.onDismiss);
    configureOnPrimerError(config.onPrimerError);
    configureOnTokenizeSuccess(config.onTokenizeSuccess);

    NativeModule.init(token);
  },

  fetchSavedPaymentInstruments(callback: (data: any) => void): void {
    NativeModule.fetchSavedPaymentInstruments(callback);
  },

  dispose(): void {
    NativeModule.dispose();
  },
};

function configureSettings(settings: IPrimerSettings = {}): void {
  const data = JSON.stringify(settings);
  NativeModule.configureSettings(data);
}

function configureTheme(theme: IPrimerTheme = {}): void {
  const data = JSON.stringify(theme);
  NativeModule.configureTheme(data);
}

function configureFlow(
  intent: PrimerIntent = { flow: 'Checkout', paymentMethod: 'Any' }
): void {
  const data = JSON.stringify(intent);
  NativeModule.configureFlow(data);
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
    parseCallbackResume(data, callback, resume);
  });
}

function configureOnVaultSuccess(
  callback: OnTokenAddedToVaultCallback = (_) => {}
) {
  NativeModule.configureOnVaultSuccess((data: any) => {
    parseCallback(data, callback);
  });
}

function configureOnDismiss(callback: OnDismissCallback = () => {}) {
  NativeModule.configureOnDismiss((_: any) => {
    callback();
  });
}

function configureOnPrimerError(callback: OnPrimerErrorCallback = (_) => {}) {
  NativeModule.configureOnPrimerError((data: any) => {
    parseCallback(data, callback);
  });
}
