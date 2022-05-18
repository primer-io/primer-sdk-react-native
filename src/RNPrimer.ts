import { NativeEventEmitter, NativeModules } from 'react-native';
import type { PrimerSessionIntent } from './models/PrimerSessionIntent';
import type { PrimerSettings } from './models/PrimerSettings';

const { NativePrimer } = NativeModules;
const eventEmitter = new NativeEventEmitter(NativePrimer);

type EventType =
  | 'primerDidCompleteCheckoutWithData'
  | 'primerClientSessionWillUpdate'
  | 'primerClientSessionDidUpdate'
  | 'primerWillCreatePaymentWithData'
  | 'primerDidFailWithError'
  | 'primerDidDismiss'
  | 'primerDidTokenizePaymentMethod'
  | 'primerDidResumeWith'
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
    eventEmitter.removeAllListeners('primerDidCompleteCheckoutWithData');
    eventEmitter.removeAllListeners('primerClientSessionWillUpdate');
    eventEmitter.removeAllListeners('primerClientSessionDidUpdate');
    eventEmitter.removeAllListeners('primerWillCreatePaymentWithData');
    eventEmitter.removeAllListeners('primerDidFailWithError');
    eventEmitter.removeAllListeners('primerDidDismiss');
    eventEmitter.removeAllListeners('primerDidTokenizePaymentMethod');
    eventEmitter.removeAllListeners('primerDidResumeWith');
    eventEmitter.removeAllListeners('detectImplementedRNCallbacks');
  },

  ///////////////////////////////////////////
  // Native API
  ///////////////////////////////////////////
  configure: (settings: PrimerSettings | undefined): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      try {
        await NativePrimer.configureSettings(JSON.stringify(settings) || "");
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
        await NativePrimer.showUniversalCheckoutWithClientToken(clientToken);
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
