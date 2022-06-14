import { NativeEventEmitter, NativeModules } from 'react-native';

const { PrimerHeadlessUniversalCheckout } = NativeModules;

const eventEmitter = new NativeEventEmitter(PrimerHeadlessUniversalCheckout);

type EventType =
  | 'onHUCTokenizeStart'
  | 'onHUCPrepareStart'
  | 'onHUCAvailablePaymentMethodsLoaded'
  | 'onHUCPaymentMethodShow'
  | 'onTokenizeSuccess'
  | 'onResumeSuccess'
  | 'onBeforePaymentCreate'
  | 'onBeforeClientSessionUpdate'
  | 'onClientSessionUpdate'
  | 'onCheckoutComplete'
  | 'onError';

const eventTypes: EventType[] = [
  'onHUCTokenizeStart',
  'onHUCPrepareStart',
  'onHUCAvailablePaymentMethodsLoaded',
  'onHUCPaymentMethodShow',
  'onTokenizeSuccess',
  'onResumeSuccess',
  'onBeforePaymentCreate',
  'onBeforeClientSessionUpdate',
  'onClientSessionUpdate',
  'onCheckoutComplete',
  'onError'
];

const RNPrimerHeadlessUniversalCheckout = {
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
    eventTypes.forEach((eventType) => RNPrimerHeadlessUniversalCheckout.removeAllListenersForEvent(eventType));
  },

  ///////////////////////////////////////////
  // Native API
  ///////////////////////////////////////////
  getAssetForPaymentMethod: (
    paymentMethodType: string,
    assetType: 'logo' | 'icon'
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      try {
        PrimerHeadlessUniversalCheckout.getAssetForPaymentMethodType(
          paymentMethodType,
          assetType,
          (err: Error) => {
            reject(err);
          },
          (url: string) => {
            resolve(url);
          }
        );
      } catch (e) {
        reject(e);
      }
    });
  },

  getAssetForCardNetwork: (
    cardNetwork: string,
    assetType: 'logo' | 'icon'
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      try {
        PrimerHeadlessUniversalCheckout.getAssetForPaymentMethodType(
          cardNetwork,
          assetType,
          (err: Error) => {
            reject(err);
          },
          (url: string) => {
            resolve(url);
          }
        );
      } catch (e) {
        reject(e);
      }
    });
  },

  startWithClientToken(clientToken: string, settings: any): Promise<any> {
    return new Promise((resolve, reject) => {
      PrimerHeadlessUniversalCheckout.startWithClientToken(
        clientToken,
        JSON.stringify(settings),
        (err: Error) => {
          console.error(err);
          reject(err);
        },
        (paymentMethodTypes: string[]) => {
          resolve({ paymentMethodTypes });
        }
      );
    });
  },

  showPaymentMethod: (paymentMethod: string): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      try {
        await PrimerHeadlessUniversalCheckout.showPaymentMethod(paymentMethod);
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
        await PrimerHeadlessUniversalCheckout.handleTokenizationNewClientToken(newClientToken);
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  },

  handleTokenizationSuccess: (): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      try {
        await PrimerHeadlessUniversalCheckout.handleTokenizationSuccess();
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  },

  handleTokenizationFailure: (errorMessage: string | null): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      try {
        await PrimerHeadlessUniversalCheckout.handleTokenizationFailure(errorMessage || "");
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
        await PrimerHeadlessUniversalCheckout.handleResumeWithNewClientToken(newClientToken);
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  },

  handleResumeSuccess: (): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      try {
        await PrimerHeadlessUniversalCheckout.handleResumeSuccess();
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  },

  handleResumeFailure: (errorMessage: string | null): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      try {
        await PrimerHeadlessUniversalCheckout.handleTokenizationFailure(errorMessage || "");
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
        await PrimerHeadlessUniversalCheckout.handlePaymentCreationAbort(errorMessage || "");
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  },

  handlePaymentCreationContinue: (): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      try {
        await PrimerHeadlessUniversalCheckout.handlePaymentCreationContinue();
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
        await PrimerHeadlessUniversalCheckout.setImplementedRNCallbacks(JSON.stringify(implementedRNCallbacks));
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  },
};

export default RNPrimerHeadlessUniversalCheckout;
