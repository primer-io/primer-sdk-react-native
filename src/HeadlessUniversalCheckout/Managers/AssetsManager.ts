import type { PrimerAsset } from '@primer-io/react-native';
import { NativeModules } from 'react-native';

const { RNTPrimerHeadlessUniversalCheckoutAssetsManager } = NativeModules;

class PrimerHeadlessUniversalCheckoutAssetsManager {

    ///////////////////////////////////////////
    // Init
    ///////////////////////////////////////////
    constructor() {}

    ///////////////////////////////////////////
    // Native API
    ///////////////////////////////////////////

    async getPaymentMethodAsset(paymentMethodType: string): Promise<PrimerAsset> {
        return new Promise(async (resolve, reject) => {
            try {
                const data = await RNTPrimerHeadlessUniversalCheckoutAssetsManager.getPaymentMethodAsset(paymentMethodType);
                const paymentMethodAsset: PrimerAsset = data.paymentMethodAsset;
                resolve(paymentMethodAsset);
            } catch (err) {
                console.error(err);
                reject(err);
            }
        });
    }

    async getPaymentMethodAssets(): Promise<PrimerAsset[]> {
        return new Promise(async (resolve, reject) => {
            try {
                const data = await RNTPrimerHeadlessUniversalCheckoutAssetsManager.getPaymentMethodAssets();
                const paymentMethodAssets: PrimerAsset[] = data.paymentMethodAssets;
                resolve(paymentMethodAssets);
            } catch (err) {
                console.error(err);
                reject(err);
            }
        });
    }
}

export default PrimerHeadlessUniversalCheckoutAssetsManager;