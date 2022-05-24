import { NativeEventEmitter, NativeModules } from 'react-native';
import type { PrimerSessionIntent } from './models/PrimerSessionIntent';
import type { PrimerSettings } from './models/PrimerSettings';

const { NativePrimer } = NativeModules;
const eventEmitter = new NativeEventEmitter(NativePrimer);

type EventType =
  | 'onCheckoutComplete'
  | 'onBeforeClientSessionUpdate'
  | 'onClientSessionUpdate'
  | 'onBeforePaymentCreate'
  | 'onCheckoutFail'
  | 'onDismiss'
  | 'onTokenizeSuccess'
  | 'onResumeSuccess'
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

  removeListener: (eventType: EventType, listener: (...args: any[]) => any) => {
    eventEmitter.removeListener(eventType, listener);
  },

  removeAllListenersForEvent(eventType: EventType) {
    eventEmitter.removeAllListeners(eventType);
  },

  removeAllListeners() {
    RNPrimer.removeAllListenersForEvent('onCheckoutComplete');
    RNPrimer.removeAllListenersForEvent('onBeforeClientSessionUpdate');
    RNPrimer.removeAllListenersForEvent('onClientSessionUpdate');
    RNPrimer.removeAllListenersForEvent('onBeforePaymentCreate');
    RNPrimer.removeAllListenersForEvent('onCheckoutFail');
    RNPrimer.removeAllListenersForEvent('onDismiss');
    RNPrimer.removeAllListenersForEvent('onTokenizeSuccess');
    RNPrimer.removeAllListenersForEvent('onResumeSuccess');
    RNPrimer.removeAllListenersForEvent('detectImplementedRNCallbacks');
  },

  ///////////////////////////////////////////
  // Native API
  ///////////////////////////////////////////
  configure: (settings: PrimerSettings | undefined): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      try {
        await NativePrimer.configure(JSON.stringify(settings) || "");
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  },

  showUniversalCheckout: (clientToken: string): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      try {
        await NativePrimer.showUniversalCheckoutWithClientToken(clientToken);
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  },

  showVaultManager: (clientToken: string | undefined): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      try {
        await NativePrimer.showVaultManagerWithClientToken(clientToken);
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  },

  showPaymentMethod: (
    paymentMethodType: string,
    intent: PrimerSessionIntent,
    clientToken: string
  ): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      try {
        await NativePrimer.showPaymentMethod(clientToken, paymentMethodType, intent);
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  },

  dismiss: (): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      try {
        await NativePrimer.dismiss();
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  },

  ///////////////////////////////////////////
  // DECISION HANDLERS
  ///////////////////////////////////////////

  // Tokenization Handlers

  handleTokenizationNewClientToken: (newClientToken: string): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      try {
        await NativePrimer.handleTokenizationNewClientToken(newClientToken);
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  },

  handleTokenizationSuccess: (): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      try {
        await NativePrimer.handleTokenizationSuccess();
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  },

  handleTokenizationFailure: (errorMessage: string | null): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      try {
        await NativePrimer.handleTokenizationFailure(errorMessage || "");
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  },

    // Resume Handlers

    handleResumeWithNewClientToken: (newClientToken: string): Promise<void> => {
      return new Promise(async (resolve, reject) => {
        try {
          await NativePrimer.handleResumeWithNewClientToken(newClientToken);
          resolve();
        } catch (err) {
          reject(err);
        }
      });
    },
  
    handleResumeSuccess: (): Promise<void> => {
      return new Promise(async (resolve, reject) => {
        try {
          await NativePrimer.handleResumeSuccess();
          resolve();
        } catch (err) {
          reject(err);
        }
      });
    },
  
    handleResumeFailure: (errorMessage: string | null): Promise<void> => {
      return new Promise(async (resolve, reject) => {
        try {
          await NativePrimer.handleTokenizationFailure(errorMessage || "");
          resolve();
        } catch (err) {
          reject(err);
        }
      });
    },

  // Payment Creation Handlers

  handlePaymentCreationAbort: (errorMessage: string | null): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      try {
        await NativePrimer.handlePaymentCreationAbort(errorMessage || "");
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  },

  handlePaymentCreationContinue: (): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      try {
        await NativePrimer.handlePaymentCreationContinue();
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  },

    // Error Handler

    handleErrorMessage: (errorMessage: string | null): Promise<void> => {
      return new Promise(async (resolve, reject) => {
        try {
          await NativePrimer.handleErrorMessage(errorMessage || "");
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

};

export default RNPrimer;
