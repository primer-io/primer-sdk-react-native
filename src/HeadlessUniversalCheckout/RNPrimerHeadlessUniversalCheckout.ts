import { NativeEventEmitter, NativeModules } from 'react-native';
import type { PrimerSettings } from '../models/PrimerSettings';

const { PrimerHeadlessUniversalCheckout } = NativeModules;

const eventEmitter = new NativeEventEmitter(PrimerHeadlessUniversalCheckout);

type EventType =
  | 'onAvailablePaymentMethodsLoad'
  | 'onTokenizationStart'
  | 'onTokenizationSuccess'

  | 'onCheckoutResume'
  | 'onCheckoutPending'
  | 'onCheckoutAdditionalInfo'

  | 'onError'
  | 'onCheckoutComplete'
  | 'onBeforeClientSessionUpdate'

  | 'onClientSessionUpdate'
  | 'onBeforePaymentCreate'
  | 'onPreparationStart'

  | 'onPaymentMethodShow';

const eventTypes: EventType[] = [
  'onAvailablePaymentMethodsLoad',
  'onTokenizationStart',
  'onTokenizationSuccess',

  'onCheckoutResume',
  'onCheckoutPending',
  'onCheckoutAdditionalInfo',

  'onError',
  'onCheckoutComplete',
  'onBeforeClientSessionUpdate',

  'onClientSessionUpdate',
  'onBeforePaymentCreate',
  'onPreparationStart',

  'onPaymentMethodShow'
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

  startWithClientToken(clientToken: string, settings: PrimerSettings): Promise<any> {
    return PrimerHeadlessUniversalCheckout.startWithClientToken(clientToken, JSON.stringify(settings));
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

  handleCompleteFlow: (): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      try {
        await PrimerHeadlessUniversalCheckout.handleCompleteFlow();
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

  disposePrimerHeadlessUniversalCheckout: (): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      try {
        await PrimerHeadlessUniversalCheckout.disposePrimerHeadlessUniversalCheckout();
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  },
};

export default RNPrimerHeadlessUniversalCheckout;
