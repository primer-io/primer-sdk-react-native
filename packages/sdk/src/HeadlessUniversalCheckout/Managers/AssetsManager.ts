import { Resource } from 'src';
import { IPrimerAsset as Asset } from '../../models/PrimerPaymentMethodResource';
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

    async getCardNetworkImageURL(cardNetwork: string): Promise<string> {
        return new Promise(async (resolve, reject) => {
            try {
                const data = await RNTPrimerHeadlessUniversalCheckoutAssetsManager.getCardNetworkImage(cardNetwork);
                resolve(data.cardNetworkImageURL);
            } catch (err) {
                console.error(err);
                reject(err);
            }
        });
    }

    async getPaymentMethodAsset(paymentMethodType: string): Promise<Asset> {
        return new Promise(async (resolve, reject) => {
            try {
                const data = await RNTPrimerHeadlessUniversalCheckoutAssetsManager.getPaymentMethodAsset(paymentMethodType);
                const paymentMethodAsset: Asset = data.paymentMethodAsset;
                resolve(paymentMethodAsset);
            } catch (err) {
                console.error(err);
                reject(err);
            }
        });
    }

    async getPaymentMethodAssets(): Promise<Asset[]> {
        return new Promise(async (resolve, reject) => {
            try {
                const data = await RNTPrimerHeadlessUniversalCheckoutAssetsManager.getPaymentMethodAssets();
                const paymentMethodAssets: Asset[] = data.paymentMethodAssets;
                resolve(paymentMethodAssets);
            } catch (err) {
                console.error(err);
                reject(err);
            }
        });
    }

    async getPaymentMethodResources(): Promise<Resource[]> {
        return new Promise(async (resolve, reject) => {
            try {
                const data = await RNTPrimerHeadlessUniversalCheckoutAssetsManager.getPaymentMethodResources();
                const paymentMethodResources: Resource[] = data.paymentMethodResources;
                resolve(paymentMethodResources);
            } catch (err) {
                console.error(err);
                reject(err);
            }
        });
    }
}

export default PrimerHeadlessUniversalCheckoutAssetsManager;
