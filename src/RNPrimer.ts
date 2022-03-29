import * as React from 'react';
import { NativeEventEmitter, NativeModules } from 'react-native';
import type { PrimerSettings } from './models/primer-settings';
import type { PrimerTheme } from './models/primer-theme';

const { NativePrimer } = NativeModules;
const eventEmitter = new NativeEventEmitter(NativePrimer);

type EventType =
  | 'onClientTokenCallback'
  | 'onClientSessionActions'
  | 'onTokenizeSuccessCallback'
  | 'onResumeSuccess'
  | 'onCheckoutDismissed'
  | 'onError'
  | 'detectImplementedRNCallbacks';

export interface IPrimerError {
  errorId: string
  errorDescription?: string
  recoverySuggestion?: string
}

const RNPrimer = {
  ///////////////////////////////////////////
  // Event Emitter
  ///////////////////////////////////////////
  addListener: (eventType: EventType, listener: (...args: any[]) => any) => {
    eventEmitter.addListener(eventType, listener);
  },

  ///////////////////////////////////////////
  // Native API
  ///////////////////////////////////////////
  configure: (
    settings: PrimerSettings | null,
    theme: PrimerTheme | null
  ): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      try {
        if (settings === null && theme === null) {
          // Do nothing, SDK will use default settings and theme.
        } else if (settings && theme === null) {
          await NativePrimer.configureWithSettings(JSON.stringify(settings));
        } else if (settings === null && theme) {
          await NativePrimer.configureWithTheme(JSON.stringify(theme));
        } else {
          await await NativePrimer.configureWithSettings(JSON.stringify(settings));
          await NativePrimer.configureWithTheme(JSON.stringify(theme));
        }
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  },

  showUniversalCheckout: (clientToken: string | undefined): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      try {
        if (clientToken) {
          await NativePrimer.showUniversalCheckoutWithClientToken(clientToken);
        } else {
          await NativePrimer.showUniversalCheckout();
        }
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  },

  showVaultManager: (clientToken: string | undefined): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      try {
        if (clientToken) {
          await NativePrimer.showVaultManager(clientToken);
        } else {
          await NativePrimer.showVaultManager();
        }
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  },

  showPaymentMethod: (
    paymentMethodType: string,
    token: string,
    intent: "checkout" | "vault"
  ): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      resolve();
    });
  },

  handleNewClientToken: (clientToken: string | undefined): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      try {
        await NativePrimer.handleNewClientToken(clientToken);
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  },

  handleError: (err: IPrimerError): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      try {
        await NativePrimer.handleError(JSON.stringify(err));
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  },

  handleSuccess: (): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      try {
        await NativePrimer.handleSuccess();
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  },

  setImplementedRNCallbacks: (implementedRNCallbacks: any): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      try {
        await NativePrimer.setImplementedRNCallbacks(JSON.stringify(implementedRNCallbacks));
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  },

  dispose: (): void => {
    
  }
};

export default RNPrimer;
