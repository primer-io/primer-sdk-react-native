import type { PrimerRawData } from "..";
import RNPrimerHeadlessUniversalCheckoutRawDataManager from "./RNPrimerHeadlessUniversalCheckoutRawDataManager";
import { primerSettings } from "./PrimerHeadlessUniversalCheckout"
import { PrimerError } from '../models/PrimerError';

let primerHeadlessUniversalCheckoutRawDataManagerOptions: PrimerHeadlessUniversalCheckoutRawDataManagerOptions | undefined;

async function configureListeners(): Promise<void> {
    return new Promise(async (resolve, reject) => {
        try {
            RNPrimerHeadlessUniversalCheckoutRawDataManager.removeAllListeners();

            RNPrimerHeadlessUniversalCheckoutRawDataManager.addListener('onMetadataChange', data => {
                if (primerHeadlessUniversalCheckoutRawDataManagerOptions && primerHeadlessUniversalCheckoutRawDataManagerOptions.onMetadataChange) {
                    primerHeadlessUniversalCheckoutRawDataManagerOptions.onMetadataChange(data);
                }
            });

            RNPrimerHeadlessUniversalCheckoutRawDataManager.addListener('onValidation', data => {
                if (primerHeadlessUniversalCheckoutRawDataManagerOptions && primerHeadlessUniversalCheckoutRawDataManagerOptions.onValidation) {
                    let errors: PrimerError[] = [];
                    for (const errData of (data.errors || [])) {
                        const errorId: string = errData.errorId;
                        const description: string | undefined = errData.description;
                        const recoverySuggestion: string | undefined = errData.recoverySuggestion;
                        const primerError = new PrimerError(errorId, description || 'Unknown error', recoverySuggestion);
                        errors.push(primerError);
                    }

                    primerHeadlessUniversalCheckoutRawDataManagerOptions.onValidation(data.isValid, errors.length === 0 ? undefined : errors);
                }
            });

            RNPrimerHeadlessUniversalCheckoutRawDataManager.addListener('onNativeError', data => {
                if (primerSettings && primerSettings.onError) {
                    const errorId: string = data.error.errorId;
                    const description: string | undefined = data.error.description;
                    const recoverySuggestion: string | undefined = data.error.recoverySuggestion;
                    const primerError = new PrimerError(errorId, description || 'Unknown error', recoverySuggestion);
                    primerSettings.onError(primerError, null, undefined);
                }
            });
            resolve();

        } catch (err) {
            reject(err);
        }
    });
}

export interface PrimerHeadlessUniversalCheckoutRawDataManagerOptions {
    paymentMethodType: string;
    onMetadataChange?: (metadata: any) => void;
    onValidation?: (isValid: boolean, errors: PrimerError[] | undefined) => void;
}

class PrimerHeadlessUniversalCheckoutRawDataManagerClass {

    ///////////////////////////////////////////
    // Init
    ///////////////////////////////////////////
    constructor() {

    }

    ///////////////////////////////////////////
    // API
    ///////////////////////////////////////////

    configure(options: PrimerHeadlessUniversalCheckoutRawDataManagerOptions): Promise<void> {
        primerHeadlessUniversalCheckoutRawDataManagerOptions = options;
        configureListeners();
        return RNPrimerHeadlessUniversalCheckoutRawDataManager.initialize(primerHeadlessUniversalCheckoutRawDataManagerOptions.paymentMethodType);
    }

    async getRequiredInputElementTypes(): Promise<string[]> {
        return new Promise(async (resolve, reject) => {
            if (
                primerHeadlessUniversalCheckoutRawDataManagerOptions &&
                primerHeadlessUniversalCheckoutRawDataManagerOptions.paymentMethodType
            ) {
                try {
                    const inputElementTypes = await RNPrimerHeadlessUniversalCheckoutRawDataManager.listRequiredInputElementTypesForPaymentMethodType(primerHeadlessUniversalCheckoutRawDataManagerOptions.paymentMethodType);
                    resolve(inputElementTypes);
                } catch (err) {
                    reject(err);
                }
            } else {
                const err = new PrimerError("manager-not-configured", "HeadlessUniversalCheckoutRawDataManager has not been configured", "Call HeadlessUniversalCheckoutRawDataManager.configure before calling this function.");
                reject(err);
            }
        })
    }

    setRawData(rawData: PrimerRawData): Promise<void> {
        return RNPrimerHeadlessUniversalCheckoutRawDataManager.setRawData(JSON.stringify(rawData));
    }

    submit(): Promise<void> {
        return RNPrimerHeadlessUniversalCheckoutRawDataManager.submit();
    }
}

export const PrimerHeadlessUniversalCheckoutRawDataManager = new PrimerHeadlessUniversalCheckoutRawDataManagerClass();
