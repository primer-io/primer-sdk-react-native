import { NativeEventEmitter, NativeModules } from 'react-native';
import { notEmpty } from '../utils/helpers';
import { makePrimerInputElementTypeFromStringVal, PrimerInputElementType } from './PrimerInputElementType';

const { NativeHeadlessCheckoutCardComponentsManager } = NativeModules;

const eventEmitter = new NativeEventEmitter(NativeHeadlessCheckoutCardComponentsManager);

type HUCCardFormManagerEventType = 'onCardFormIsValidValueChange';

const eventTypes: HUCCardFormManagerEventType[] = [
  'onCardFormIsValidValueChange'
];

const RNHeadlessCheckoutCardComponentsManager = {

  ///////////////////////////////////////////
  // Event Emitter
  ///////////////////////////////////////////
  addListener: (eventType: HUCCardFormManagerEventType, listener: (...args: any[]) => any) => {
    eventEmitter.addListener(eventType, listener);
  },

  removeListener: (eventType: HUCCardFormManagerEventType, listener: (...args: any[]) => any) => {
    eventEmitter.removeListener(eventType, listener);
  },

  removeAllListenersForEvent(eventType: HUCCardFormManagerEventType) {
    eventEmitter.removeAllListeners(eventType);
  },

  removeAllListeners() {
    eventTypes.forEach((eventType) => RNHeadlessCheckoutCardComponentsManager.removeAllListenersForEvent(eventType));
  },

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

  tokenize() {
    NativeHeadlessCheckoutCardComponentsManager.tokenize();
  }
};

export default RNHeadlessCheckoutCardComponentsManager;
