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
import type { PrimerNativeException } from './models/primer-exception';
import type { PrimerFlow } from './models/primer-flow';
import type { IPrimerResumeRequest } from './models/primer-request';
import type { IPrimerSettings } from './models/primer-settings';
import type { IPrimerTheme } from './models/primer-theme';

const { PrimerRN: NativeModule } = NativeModules;

export const PrimerNativeMapping: IPrimer = {
  init(token: String, config: IPrimerConfig): void {
    configureSettings(config.settings);
    configureTheme(config.theme);
    configureFlow(config.flow);
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
  flow: PrimerFlow = { intent: 'Checkout', paymentMethod: 'Any' }
): void {
  const data = JSON.stringify(flow);
  NativeModule.configureFlow(data);
}

function configureOnTokenizeSuccess(
  callback: OnTokenizeSuccessCallback = (data) => {
    console.log(data);
  }
) {
  NativeModule.configureOnTokenizeSuccess((data: any) => {
    let completion = (_: IPrimerResumeRequest): void => {
      NativeModule.resume('success');
    };
    try {
      const paymentInstrument = JSON.parse(data) as PaymentInstrumentToken;

      callback(paymentInstrument, completion);
    } catch (e) {
      callback({ name: 'ParseJsonFailed' }, completion);
    }
    configureOnTokenizeSuccess(callback);
  });
}

function configureOnVaultSuccess(
  callback: OnTokenAddedToVaultCallback = (data) => {
    console.log(data);
  }
) {
  NativeModule.configureOnVaultSuccess((data: any) => {
    try {
      const paymentInstrument = JSON.parse(data) as PaymentInstrumentToken;
      callback(paymentInstrument);
    } catch (error) {
      callback({ name: 'ParseJsonFailed' });
    }
    configureOnVaultSuccess(callback);
  });
}

function configureOnDismiss(
  callback: OnDismissCallback = () => {
    console.log('dismissed!');
  }
) {
  NativeModule.configureOnDismiss((_: any) => {
    callback();
    configureOnDismiss(callback);
  });
}

function configureOnPrimerError(
  callback: OnPrimerErrorCallback = (data) => {
    console.log(data);
  }
) {
  NativeModule.configureOnPrimerError((data: any) => {
    try {
      const error = JSON.parse(data) as PrimerNativeException;
      callback(error);
    } catch (e) {
      callback({ name: 'ParseJsonFailed' });
    }
    configureOnPrimerError(callback);
  });
}
