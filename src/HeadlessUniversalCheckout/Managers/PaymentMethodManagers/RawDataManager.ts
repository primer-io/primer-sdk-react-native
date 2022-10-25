import type { RawData } from '@primer-io/react-native';
import { NativeEventEmitter, NativeModules, EmitterSubscription } from 'react-native';
import { PrimerError } from '../../../models/PrimerError';
import type { PrimerInputElementType } from '../../../models/PrimerInputElementType';

const { RNTPrimerHeadlessUniversalCheckoutRawDataManager } = NativeModules;
const eventEmitter = new NativeEventEmitter(RNTPrimerHeadlessUniversalCheckoutRawDataManager);

type EventType =
    | 'onMetadataChange'
    | 'onValidation';

const eventTypes: EventType[] = [
    'onMetadataChange',
    'onValidation'
];

export interface RawDataManagerProps {
    paymentMethodType: string;
    onMetadataChange?: (metadata: any) => void;
    onValidation?: (isValid: boolean, errors: PrimerError[] | undefined) => void;
}

class PrimerHeadlessUniversalCheckoutRawDataManager {

    options?: RawDataManagerProps

    ///////////////////////////////////////////
    // Init
    ///////////////////////////////////////////
    constructor() {}

    ///////////////////////////////////////////
    // API
    ///////////////////////////////////////////

    async initialize(options: RawDataManagerProps): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                this.options = options;
                await this.configureListeners();
                await RNTPrimerHeadlessUniversalCheckoutRawDataManager.initialize(options.paymentMethodType);
                resolve();

            } catch (err) {
                reject(err);
            }
        });
    }

    async configureListeners(): Promise<void> {
        return new Promise(async (resolve, reject) => {
            if (this.options?.onMetadataChange) {
                this.addListener("onMetadataChange", (data) => {
                    if (this.options?.onMetadataChange) {
                        this.options.onMetadataChange(data);
                    }
                });
            }
    
            if (this.options?.onValidation) {
                this.addListener("onValidation", (data) => {
                    if (this.options?.onValidation) {
                        this.options.onValidation(data.isValid, data.errors);
                    }
                });
            }

            resolve();
        });
    }

    async getRequiredInputElementTypes(): Promise<PrimerInputElementType[]> {
        return new Promise(async (resolve, reject) => {
            if (this.options?.paymentMethodType) {
                try {
                    const data = await RNTPrimerHeadlessUniversalCheckoutRawDataManager.listRequiredInputElementTypesForPaymentMethodType(this.options.paymentMethodType);
                    const inputElementTypes: PrimerInputElementType[] = data.inputElementTypes;
                    resolve(inputElementTypes);
                } catch (err) {
                    reject(err);
                }
            } else {
                const err = new PrimerError("manager-not-configured", "HeadlessUniversalCheckoutRawDataManager has not been configured", "Call HeadlessUniversalCheckoutRawDataManager.configure before calling this function.");
                reject(err);
            }
        });
    }

    setRawData(rawData: RawData): Promise<void> {
        return new Promise(async (resolve, reject) => {
            if (this.options?.paymentMethodType) {
                try {
                    await RNTPrimerHeadlessUniversalCheckoutRawDataManager.setRawData(JSON.stringify(rawData));
                    resolve();
                } catch (err) {
                    reject(err);
                }
            } else {
                const err = new PrimerError("manager-not-configured", "HeadlessUniversalCheckoutRawDataManager has not been configured", "Call HeadlessUniversalCheckoutRawDataManager.configure before calling this function.");
                reject(err);
            }
        });
    }

    submit(): Promise<void> {
        return new Promise(async (resolve, reject) => {
            if (this.options?.paymentMethodType) {
                try {
                    await RNTPrimerHeadlessUniversalCheckoutRawDataManager.submit();
                    resolve();
                } catch (err) {
                    reject(err);
                }
            } else {
                const err = new PrimerError("manager-not-configured", "HeadlessUniversalCheckoutRawDataManager has not been configured", "Call HeadlessUniversalCheckoutRawDataManager.configure before calling this function.");
                reject(err);
            }
        });
    }

    dispose(): Promise<void> {
        return new Promise(async (resolve, reject) => {
            if (this.options?.paymentMethodType) {
                try {
                    await RNTPrimerHeadlessUniversalCheckoutRawDataManager.dispose();
                    resolve();
                } catch (err) {
                    reject(err);
                }
            } else {
                const err = new PrimerError("manager-not-configured", "HeadlessUniversalCheckoutRawDataManager has not been configured", "Call HeadlessUniversalCheckoutRawDataManager.configure before calling this function.");
                reject(err);
            }
        });
    }



    ///////////////////////////////////////////
    // HELPERS
    ///////////////////////////////////////////

    async addListener(eventType: EventType, listener: (...args: any[]) => any): Promise<EmitterSubscription> {
        return eventEmitter.addListener(eventType, listener);
    }
    
    removeListener(eventType: EventType, listener: (...args: any[]) => any): void {
        return eventEmitter.removeListener(eventType, listener);
    }
}

export default PrimerHeadlessUniversalCheckoutRawDataManager;
