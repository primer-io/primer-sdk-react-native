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

/**
 * Call @method configureOnClientSessionActions on the native bridge, passing
 * in a callback that the native side will call every time a client session
 * action is triggered.
 */
function configureOnClientSessionActions(
  callback?: OnClientSessionActionsCallback // defined by integrating developer.
) {
  NativeModule.configureOnClientSessionActions((data: any) => {
    try {
      // parse the client session action JSON string.
      const parsedData = JSON.parse(data) as ClientSessionActionsRequest;

      if (!callback) {
        /**
         * if @param callback is undefined immediately call the native bridge
         * and resume with null values. This will resume the SDK flow without
         * triggering extra configuration API fetch calls.
         */
        actionResume({ error: null, token: null });
      } else {
        /**
         * send the parsed data back to the developer through the defined callback.
         * The developer will determine how to resume the flow using one of the provided
         * resume handlers.
         */
        callback(parsedData, {
          handleError: (error) => actionResume({ error, token: null }),
          handleSuccess: () => actionResume({ error: null, token: null }),
          handleNewClientToken: (token) => actionResume({ error: null, token }),
          // deprecated, remove in next major version update.
          resumeWithError: (error) => actionResume({ error, token: null }),
          resumeWithSuccess: (token) => actionResume({ error: null, token }),
        });
      }

      // reset the client session action callback (native bridge callbacks are disposed once they're invoked).
      configureOnClientSessionActions(callback);
    } catch (e) {
      // log error if the client session action JSON string cannot be parsed (this should never happen!).
      console.error('[OnClientSessionActions]', 'failed to parse json', e);
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
