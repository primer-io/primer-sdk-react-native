import { NativeEventEmitter, NativeModules } from 'react-native';
import { notEmpty } from '../utils/helpers';
import { makePrimerInputElementTypeFromStringVal, PrimerInputElementType } from './PrimerInputElementType';

const { NativeHeadlessCheckoutCardComponentsManager } = NativeModules;

const eventEmitter = new NativeEventEmitter(NativeHeadlessCheckoutCardComponentsManager);

// type EventType =
//   | 'onHUCTokenizeStart'
//   | 'onHUCPrepareStart'
//   | 'onHUCAvailablePaymentMethodsLoaded'
//   | 'onHUCPaymentMethodShow'
//   | 'onTokenizeSuccess'
//   | 'onResumeSuccess'
//   | 'onBeforePaymentCreate'
//   | 'onBeforeClientSessionUpdate'
//   | 'onClientSessionUpdate'
//   | 'onCheckoutComplete'
//   | 'onError';

// const eventTypes: EventType[] = [
//   'onHUCTokenizeStart',
//   'onHUCPrepareStart',
//   'onHUCAvailablePaymentMethodsLoaded',
//   'onHUCPaymentMethodShow',
//   'onTokenizeSuccess',
//   'onResumeSuccess',
//   'onBeforePaymentCreate',
//   'onBeforeClientSessionUpdate',
//   'onClientSessionUpdate',
//   'onCheckoutComplete',
//   'onError'
// ];

const RNHeadlessCheckoutCardComponentsManager = {
  ///////////////////////////////////////////
  // Event Emitter
  ///////////////////////////////////////////
//   addListener: (eventType: EventType, listener: (...args: any[]) => any) => {
//     eventEmitter.addListener(eventType, listener);
//   },

//   removeListener: (eventType: EventType, listener: (...args: any[]) => any) => {
//     eventEmitter.removeListener(eventType, listener);
//   },

//   removeAllListenersForEvent(eventType: EventType) {
//     eventEmitter.removeAllListeners(eventType);
//   },

//   removeAllListeners() {
//     eventTypes.forEach((eventType) => RNPrimerHeadlessUniversalCheckout.removeAllListenersForEvent(eventType));
//   },

  ///////////////////////////////////////////
  // Native API
  ///////////////////////////////////////////

  listRequiredInputElementTypes: (): Promise<PrimerInputElementType[]> => {
    return new Promise(async (resolve, reject) => {
      try {
        const inputElementTypesStrArr: string[] = (await NativeHeadlessCheckoutCardComponentsManager.listRequiredInputElementTypes())['requiredInputElementTypes']
        const inputElementTypes = inputElementTypesStrArr.map(str => makePrimerInputElementTypeFromStringVal(str)).filter(notEmpty);
        resolve(inputElementTypes);
      } catch (err) {
        reject(err);
      }
    });
  },

  setInputElementsWithTags: (
    inputElementsTags: number[]
  ) => {
    NativeHeadlessCheckoutCardComponentsManager.setInputElementsWithTags(inputElementsTags);
  },

};

export default RNHeadlessCheckoutCardComponentsManager;
