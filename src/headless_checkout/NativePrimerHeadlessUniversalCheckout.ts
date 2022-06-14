import { NativeEventEmitter, NativeModules } from 'react-native';
import type { PrimerSettings } from 'src/models/primer-settings';
import RNPrimer from '../RNPrimer';
import type { PrimerHeadlessUniversalCheckoutCallbacks } from './types';

const { PrimerHeadlessUniversalCheckout } = NativeModules;

const eventEmitter = new NativeEventEmitter(PrimerHeadlessUniversalCheckout);

type EventType =
  | 'preparationStarted'
  | 'paymentMethodPresented'
  | 'tokenizationStarted'
  | 'tokenizationSucceeded'
  | 'resume'
  | 'error';

let primerSettings: (PrimerSettings & PrimerHeadlessUniversalCheckoutCallbacks) | null = null;

const NativePrimerHeadlessUniversalCheckout = {
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
    eventEmitter.removeAllListeners('preparationStarted');
    eventEmitter.removeAllListeners('paymentMethodPresented');
    eventEmitter.removeAllListeners('tokenizationStarted');
    eventEmitter.removeAllListeners('tokenizationSucceeded');
    eventEmitter.removeAllListeners('resume');
    eventEmitter.removeAllListeners('error');
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
    primerSettings = settings;

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

  showPaymentMethod: async (paymentMethod: string) => {
    if (primerSettings) {
      let implementedRNCallbacks: any = {
        isTokenAddedToVaultImplemented: false,
        isOnResumeSuccessImplemented: (primerSettings.onResumeSuccess !== undefined),
        isOnResumeErrorImplemented: (primerSettings.onFailure !== undefined),
        isOnCheckoutDismissedImplemented: false,
        isCheckoutFailedImplemented: (primerSettings.onFailure !== undefined),
        isClientSessionActionsImplemented: false
      };
  
      await RNPrimer.setImplementedRNCallbacks(implementedRNCallbacks);
    }
    
    PrimerHeadlessUniversalCheckout.showPaymentMethod(paymentMethod);
  },

  resumeWithClientToken(resumeToken: string) {
    PrimerHeadlessUniversalCheckout.resumeWithClientToken(resumeToken);
  }
};

export default NativePrimerHeadlessUniversalCheckout;
