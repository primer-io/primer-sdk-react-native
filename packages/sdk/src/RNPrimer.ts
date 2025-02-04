import { NativeEventEmitter, NativeModules, EmitterSubscription } from 'react-native';
import type { PrimerSettings } from './models/PrimerSettings';
import { EventSubscription } from 'react-native';

const { NativePrimer } = NativeModules;
const eventEmitter = new NativeEventEmitter(NativePrimer);

type EventType =
  | 'onCheckoutComplete'
  | 'onBeforeClientSessionUpdate'
  | 'onClientSessionUpdate'
  | 'onBeforePaymentCreate'
  | 'onError'
  | 'onDismiss'
  | 'onTokenizeSuccess'
  | 'onResumeSuccess'
  | 'onResumePending'
  | 'onCheckoutReceivedAdditionalInfo'
  | 'detectImplementedRNCallbacks';

export interface IPrimerError {
  errorId: string;
  errorDescription?: string;
  recoverySuggestion?: string;
}

const eventTypes: EventType[] = [
  'onCheckoutComplete',
  'onBeforeClientSessionUpdate',
  'onClientSessionUpdate',
  'onBeforePaymentCreate',
  'onError',
  'onDismiss',
  'onTokenizeSuccess',
  'onResumeSuccess',
  'onCheckoutReceivedAdditionalInfo',
  'onResumePending',
  'detectImplementedRNCallbacks',
];

const RNPrimer = {
  ///////////////////////////////////////////
  // Event Emitter
  ///////////////////////////////////////////

  addListener(eventType: EventType, listener: (...args: any[]) => any): EventSubscription {
    return eventEmitter.addListener(eventType, listener);
  },

  removeListener(subscription: EmitterSubscription) {
    subscription.remove();
  },

  removeAllListenersForEvent(eventType: EventType) {
    eventEmitter.removeAllListeners(eventType);
  },

  removeAllListeners() {
    eventTypes.forEach(eventType => RNPrimer.removeAllListenersForEvent(eventType));
  },

  ///////////////////////////////////////////
  // Native API
  ///////////////////////////////////////////
  configure: (settings: PrimerSettings | undefined): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      try {
        await NativePrimer.configure(JSON.stringify(settings) || '');
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

  showPaymentMethod: (paymentMethod: string, intent: string, clientToken: string): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      try {
        await NativePrimer.showPaymentMethod(paymentMethod, intent, clientToken);
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

  cleanUp: (): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      try {
        await NativePrimer.cleanUp();
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
        await NativePrimer.handleTokenizationFailure(errorMessage || '');
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
        await NativePrimer.handleTokenizationFailure(errorMessage || '');
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
        await NativePrimer.handlePaymentCreationAbort(errorMessage || '');
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

  showErrorMessage: (errorMessage: string | null): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      try {
        await NativePrimer.showErrorMessage(errorMessage || '');
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

  // HELPERS

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
