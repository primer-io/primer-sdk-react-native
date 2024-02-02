import { NativeModules } from 'react-native';
import { PrimerValidationError as ValidationError } from 'src/models/PrimerValidationError';
import { PrimerVaultedPaymentMethod as VaultedPaymentMethod } from 'src/models/PrimerVaultedPaymentMethod';
import { PrimerVaultedPaymentMethodAdditionalData as VaultedPaymentMethodAdditionalData } from 'src/models/PrimerVaultedPaymentMethodAdditionalData';
import { PrimerVaultedPaymentMethodResult } from 'src/models/PrimerVaultedPaymentMethodResult';
import { PrimerValidationErrorResult } from 'src/models/PrimerValidationErrorResult';

const { RNPrimerHeadlessUniversalCheckoutVaultManager } = NativeModules;

class PrimerHeadlessUniversalCheckoutVaultManager {

    ///////////////////////////////////////////
    // Init
    ///////////////////////////////////////////
    constructor() { }

    ///////////////////////////////////////////
    // Native API
    ///////////////////////////////////////////

    async configure(): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                await RNPrimerHeadlessUniversalCheckoutVaultManager.configure();
                resolve();
            } catch (err) {
                console.error(err);
                reject(err);
            }
        });
    }

    async fetchVaultedPaymentMethods(): Promise<VaultedPaymentMethod[]> {
        return new Promise(async (resolve, reject) => {
            try {
                const data: PrimerVaultedPaymentMethodResult =
                    await RNPrimerHeadlessUniversalCheckoutVaultManager.fetchVaultedPaymentMethods();
                const paymentMethods: VaultedPaymentMethod[] = data.paymentMethods;
                resolve(paymentMethods);
            } catch (err) {
                console.error(err);
                reject(err);
            }
        });
    }

    async deleteVaultedPaymentMethod(vaultedPaymentMethodId: string): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                await RNPrimerHeadlessUniversalCheckoutVaultManager.deleteVaultedPaymentMethod(vaultedPaymentMethodId);
                resolve();
            } catch (err) {
                console.error(err);
                reject(err);
            }
        });
    }

    async validate(vaultedPaymentMethodId: string, additionalData: VaultedPaymentMethodAdditionalData): Promise<ValidationError[]> {
        return new Promise(async (resolve, reject) => {
            try {
                const data: PrimerValidationErrorResult =
                    await RNPrimerHeadlessUniversalCheckoutVaultManager.validate(vaultedPaymentMethodId, JSON.stringify(additionalData));
                const errors: ValidationError[] = data.validationErrors;
                resolve(errors);
            } catch (err) {
                console.error(err);
                reject(err);
            }
        });
    }

    async startPaymentFlow(vaultedPaymentMethodId: string, additionalData?: VaultedPaymentMethodAdditionalData): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                if(additionalData) {
                    await RNPrimerHeadlessUniversalCheckoutVaultManager.startPaymentFlowWithAdditionalData(vaultedPaymentMethodId, JSON.stringify(additionalData));
                } else {
                    await RNPrimerHeadlessUniversalCheckoutVaultManager.startPaymentFlow(vaultedPaymentMethodId);
                }
                resolve();
            } catch (err) {
                console.error(err);
                reject(err);
            }
        });
    }
}

export default PrimerHeadlessUniversalCheckoutVaultManager;
