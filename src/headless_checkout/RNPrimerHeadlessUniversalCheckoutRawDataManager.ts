import { NativeEventEmitter, NativeModules } from 'react-native';

const { PrimerHeadlessUniversalCheckoutRawDatamanager } = NativeModules;

const eventEmitter = new NativeEventEmitter(PrimerHeadlessUniversalCheckoutRawDatamanager);

type EventType =
    | 'onMetadataChange'
    | 'onValidation'
    | 'onNativeError';

const eventTypes: EventType[] = [
    'onMetadataChange',
    'onValidation',
    'onNativeError'
];

const RNPrimerHeadlessUniversalCheckoutRawDatamanager = {

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
        eventTypes.forEach((eventType) => RNPrimerHeadlessUniversalCheckoutRawDatamanager.removeAllListenersForEvent(eventType));
    },

    ///////////////////////////////////////////
    // Native API
    ///////////////////////////////////////////

    initialize: (paymentMethodType: string): Promise<void> => {
        return new Promise(async (resolve, reject) => {
            try {
                await PrimerHeadlessUniversalCheckoutRawDatamanager.initialize(paymentMethodType);
                resolve();
            } catch (e) {
                reject(e);
            }
        });
    },

    listRequiredInputElementTypesForPaymentMethodType: (paymentMethodType: string): Promise<string[]> => {
        return new Promise(async (resolve, reject) => {
            try {
                const inputElementTypes = await PrimerHeadlessUniversalCheckoutRawDatamanager.listRequiredInputElementTypesForPaymentMethodType(paymentMethodType);
                resolve(inputElementTypes);
            } catch (e) {
                reject(e);
            }
        });
    },

    setRawData: (rawData: string): Promise<void> => {
        return new Promise(async (resolve, reject) => {
            try {
                await PrimerHeadlessUniversalCheckoutRawDatamanager.setRawData(rawData);
                resolve();
            } catch (e) {
                reject(e);
            }
        });
    },

    submit: (): Promise<void> => {
        return new Promise(async (resolve, reject) => {
            try {
                await PrimerHeadlessUniversalCheckoutRawDatamanager.submit();
                resolve();
            } catch (e) {
                reject(e);
            }
        });
    },
}

export default RNPrimerHeadlessUniversalCheckoutRawDatamanager;
