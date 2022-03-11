import { NativeEventEmitter, NativeModules } from 'react-native';

const { PrimerHeadlessUniversalCheckout } = NativeModules;

const eventEmitter = new NativeEventEmitter(PrimerHeadlessUniversalCheckout);

type EventType =
  | 'preparationStarted'
  | 'paymentMethodPresented'
  | 'tokenizationStarted'
  | 'tokenizationSucceeded'
  | 'resume'
  | 'error';

const NativePrimerHeadlessUniversalCheckout = {
  ///////////////////////////////////////////
  // Event Emitter
  ///////////////////////////////////////////
  addListener: (eventType: EventType, listener: (...args: any[]) => any) => {
    eventEmitter.addListener(eventType, listener);
  },

  ///////////////////////////////////////////
  // Native API
  ///////////////////////////////////////////
  getAssetForPaymentMethod: (
    paymentMethodType: string,
    assetType: string
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      try {
        PrimerHeadlessUniversalCheckout.getAssetFor(
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

  listAvailableAssets: (): Promise<string[]> => {
    return new Promise((resolve, reject) => {
      try {
        PrimerHeadlessUniversalCheckout.listAvailableAssets(
          (assets: string[]) => {
            resolve(assets);
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

  showPaymentMethod: (paymentMethod: string) =>
    PrimerHeadlessUniversalCheckout.showPaymentMethod(paymentMethod),

  resumeWithClientToken(resumeToken: string) {
    PrimerHeadlessUniversalCheckout.resumeWithClientToken(resumeToken);
  },
};

export default NativePrimerHeadlessUniversalCheckout;
