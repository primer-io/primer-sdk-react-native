import { NativeModules } from 'react-native';
import type { ClientSessionActionsRequest } from './models/client-session-actions-request';
import type { PaymentInstrumentToken } from './models/payment-instrument-token';
import type { IPrimer } from './models/primer';
import type {
  OnClientSessionActionsCallback,
  OnDismissCallback,
  OnPrimerErrorCallback,
  OnTokenAddedToVaultCallback,
  OnTokenizeSuccessCallback,
} from './models/primer-callbacks';
import type { PrimerConfig } from './models/primer-config';
import type { PrimerError } from './models/primer-error';
import type {
  PrimerIntent,
  PrimerPaymentMethodIntent,
} from './models/primer-intent';
import type { PrimerSettings } from './models/primer-settings';
import type { PrimerTheme } from './models/primer-theme';
import { parseCallback } from './utils';

const { PrimerRN: NativeModule } = NativeModules;

export const PrimerNativeMapping: IPrimer = {
  showUniversalCheckout(token: String, config: PrimerConfig): void {
    configureIntent({ vault: false, paymentMethod: 'Any' });
    configure(config);
    NativeModule.initialize(token);
  },

  showVaultManager(token: String, config: PrimerConfig): void {
    configureIntent({ vault: true, paymentMethod: 'Any' });
    configure(config);
    NativeModule.initialize(token);
  },

  showPaymentMethod(
    token: String,
    intent: PrimerPaymentMethodIntent,
    config: PrimerConfig
  ): void {
    configureIntent(intent);
    configure(config);
    NativeModule.initialize(token);
  },

  // todo: refactor
  // fetchSavedPaymentInstruments(token: String, config: PrimerConfig): void {
  //   configure(config);
  //   NativeModule.fetchSavedPaymentInstruments(token);
  // },

  dispose(): void {
    NativeModule.dispose();
  },
};

function configure(config: PrimerConfig): void {
  configureTheme(config.theme);
  configureSettings(config.settings);
  configureOnVaultSuccess(config.onTokenAddedToVault);
  configureOnDismiss(config.onDismiss);
  configureOnError(config.onError);
  configureOnTokenizeSuccess(config.onTokenizeSuccess);
  configureOnClientSessionActions(config.onClientSessionActions);
  configureOnResumeSuccess(config.onResumeSuccess);
}

function configureSettings(settings: PrimerSettings = {}): void {
  const data = JSON.stringify(settings);
  NativeModule.configureSettings(data);
}

function configureTheme(theme: PrimerTheme = {}): void {
  const data = JSON.stringify(theme);
  NativeModule.configureTheme(data);
}

function configureIntent(
  intent: PrimerIntent = { vault: false, paymentMethod: 'Any' }
): void {
  const data = JSON.stringify(intent);
  NativeModule.configureIntent(data);
}

function resume(request: ResumeRequest) {
  const data = JSON.stringify(request);
  NativeModule.resume(data);
}

function configureOnTokenizeSuccess(
  callback: OnTokenizeSuccessCallback = (_, __) => {}
) {
  NativeModule.configureOnTokenizeSuccess((data: any) => {
    try {
      const parsedData = JSON.parse(data) as PaymentInstrumentToken;
      callback(parsedData, {
        handleError: (error) => resume({ error, token: null }),
        handleSuccess: () => resume({ error: null, token: null }),
        handleNewClientToken: (token) => resume({ error: null, token }),
        // deprecated
        resumeWithError: (error) => resume({ error, token: null }),
        resumeWithSuccess: (token) => resume({ error: null, token }),
      });
    } catch (e) {
      console.log('failed to parse json', e);
    }
  });
}

function actionResume(request: ResumeRequest) {
  const data = JSON.stringify(request);
  NativeModule.actionResume(data);
}

function configureOnClientSessionActions(
  callback?: OnClientSessionActionsCallback
) {
  NativeModule.configureOnClientSessionActions((data: any) => {
    try {
      const parsedData = JSON.parse(data) as ClientSessionActionsRequest;

      if (!callback) {
        actionResume({ error: null, token: null });
      } else {
        callback(parsedData, {
          handleError: (error) => actionResume({ error, token: null }),
          handleSuccess: () => actionResume({ error: null, token: null }),
          handleNewClientToken: (token) => actionResume({ error: null, token }),
          // deprecated
          resumeWithError: (error) => actionResume({ error, token: null }),
          resumeWithSuccess: (token) => actionResume({ error: null, token }),
        });
      }

      configureOnClientSessionActions(callback);
    } catch (e) {
      console.log('[OnClientSessionActions]', 'failed to parse json', e);
    }
  });
}

function configureOnResumeSuccess(
  callback: OnTokenizeSuccessCallback = (_, __) => {}
) {
  NativeModule.configureOnResumeSuccess((paymentMethodToken: any) => {
    try {
      callback(paymentMethodToken, {
        handleError: (error) => resume({ error, token: null }),
        handleSuccess: () => resume({ error: null, token: null }),
        handleNewClientToken: (token) => resume({ error: null, token }),
        // deprecated
        resumeWithError: (error) => resume({ error, token: null }),
        resumeWithSuccess: (token) => resume({ error: null, token }),
      });
    } catch (e) {
      console.log('failed to parse json', e);
    }
  });
}

function configureOnVaultSuccess(
  callback: OnTokenAddedToVaultCallback = (_) => {}
) {
  NativeModule.configureOnVaultSuccess((data: any) => {
    parseCallback<PaymentInstrumentToken>(data, callback);
  });
}

function configureOnDismiss(callback: OnDismissCallback = () => {}) {
  NativeModule.configureOnDismiss((_: any) => callback());
}

function configureOnError(callback: OnPrimerErrorCallback = (_) => {}) {
  NativeModule.configureOnPrimerError((data: any) => {
    parseCallback<PrimerError>(data, callback);
  });
}

interface ResumeRequest {
  error: string | null;
  token: string | null;
}
