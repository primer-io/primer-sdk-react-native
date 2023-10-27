import { NativeModules } from 'react-native';
import { PrimerValidationError } from 'src/models/PrimerValidationError';
import { PrimerVaultedPaymentMethod } from 'src/models/PrimerVaultedPaymentMethod';
import { PrimerVaultedPaymentMethodAdditionalData } from 'src/models/PrimerVaultedPaymentMethodAdditionalData';

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

    async fetchVaultedPaymentMethods(): Promise<PrimerVaultedPaymentMethod[]> {
        return new Promise(async (resolve, reject) => {
            try {
                const paymentMethods: PrimerVaultedPaymentMethod[] =
                    await RNPrimerHeadlessUniversalCheckoutVaultManager.fetchVaultedPaymentMethods();
                resolve(paymentMethods);
            } catch (err) {
                console.error(err);
                reject(err);
            }
        });
    }

    async deleteVaultedPaymentMethod(vaultedPaymentMethodId: String): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                await RNPrimerHeadlessUniversalCheckoutVaultManager.deleteVaultedPaymentMethod(vaultedPaymentMethodId);
                resolve();
            } catch (err) {
                console.error(err);
                reject(err);
            }
        })
    }

    async validate(vaultedPaymentMethodId: String, additionalData: PrimerVaultedPaymentMethodAdditionalData): Promise<PrimerValidationError[]> {
        return new Promise(async (resolve, reject) => {
            try {
                const errors: PrimerValidationError[] =
                    await RNPrimerHeadlessUniversalCheckoutVaultManager.validate(vaultedPaymentMethodId, JSON.stringify(additionalData));
                resolve(errors);
            } catch (err) {
                console.error(err);
                reject(err);
            }
        })
    }

    async startPaymentFlow(vaultedPaymentMethodId: String): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                await RNPrimerHeadlessUniversalCheckoutVaultManager.startPaymentFlow(vaultedPaymentMethodId);
                resolve();
            } catch (err) {
                console.error(err);
                reject(err);
            }
        })
    }

    async startPaymentFlowWithAdditionalData(vaultedPaymentMethodId: String, additionalData: PrimerVaultedPaymentMethodAdditionalData): Promise<void> {
        return new Promise(async (resolve, reject) => {
            try {
                await RNPrimerHeadlessUniversalCheckoutVaultManager.startPaymentFlow(vaultedPaymentMethodId, JSON.stringify(additionalData));
                resolve();
            } catch (err) {
                console.error(err);
                reject(err);
            }
        })
    }
}
