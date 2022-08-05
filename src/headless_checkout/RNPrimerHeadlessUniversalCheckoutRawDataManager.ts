import { NativeEventEmitter, NativeModules } from 'react-native';

const { PrimerHeadlessUniversalCheckoutRawDataManager } = NativeModules;
const eventEmitter = new NativeEventEmitter(PrimerHeadlessUniversalCheckoutRawDataManager);

type EventType =
    | 'onMetadataChange'
    | 'onValidation'
    | 'onNativeError';

const eventTypes: EventType[] = [
    'onMetadataChange',
    'onValidation',
    'onNativeError'
];

const RNPrimerHeadlessUniversalCheckoutRawDataManager = {

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
        eventTypes.forEach((eventType) => RNPrimerHeadlessUniversalCheckoutRawDataManager.removeAllListenersForEvent(eventType));
    },

    ///////////////////////////////////////////
    // Native API
    ///////////////////////////////////////////

    initialize: (paymentMethodType: string): Promise<void> => {
        return new Promise(async (resolve, reject) => {
            try {
                await PrimerHeadlessUniversalCheckoutRawDataManager.initialize(paymentMethodType);
                resolve();
            } catch (e) {
                reject(e);
            }
        });
    },

    listRequiredInputElementTypesForPaymentMethodType: (paymentMethodType: string): Promise<string[]> => {
        return new Promise(async (resolve, reject) => {
            try {
                const inputElementTypes = await PrimerHeadlessUniversalCheckoutRawDataManager.listRequiredInputElementTypesForPaymentMethodType(paymentMethodType);
                resolve(inputElementTypes);
            } catch (e) {
                reject(e);
            }
        });
    },

    setRawData: (rawData: string): Promise<void> => {
        return new Promise(async (resolve, reject) => {
            try {
                await PrimerHeadlessUniversalCheckoutRawDataManager.setRawData(rawData);
                resolve();
            } catch (e) {
                reject(e);
            }
        });
    },

    submit: (): Promise<void> => {
        return new Promise(async (resolve, reject) => {
            try {
                await PrimerHeadlessUniversalCheckoutRawDataManager.submit();
                resolve();
            } catch (e) {
                reject(e);
            }
        });
    },
}

export default RNPrimerHeadlessUniversalCheckoutRawDataManager;
