import { NativeModules } from 'react-native';
import type {
  IPrimerAsset as Asset,
  PrimerPaymentMethodAsset,
  PrimerPaymentMethodNativeView,
} from '../../models/PrimerPaymentMethodResource';

type Resource = PrimerPaymentMethodAsset | PrimerPaymentMethodNativeView;

/**
 * Raw bridge shape emitted by native `getCardNetworkTraits`.
 * iOS resolves `null` for networks without validation (bancontact, cartesBancaires, eftpos, unknown);
 * Android always resolves a dict (Type.OTHER fallback) — consumers coalesce both to a default descriptor.
 */
export interface CardNetworkTraits {
  cardNetwork: string;
  displayName: string;
  panLengths: number[];
  gapPattern: number[];
  cvvLength: number;
  cvvLabel: string;
}

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

  async getCardNetworkTraits(cardNetwork: string): Promise<CardNetworkTraits | null> {
    return new Promise(async (resolve, reject) => {
      try {
        const data = await RNTPrimerHeadlessUniversalCheckoutAssetsManager.getCardNetworkTraits(cardNetwork);
        resolve(data ?? null);
      } catch (err) {
        console.error(err);
        reject(err);
      }
    });
  }

  /**
   * @deprecated Use getPaymentMethodResource instead
   */
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

  /**
   * @deprecated Use getPaymentMethodResources instead
   */
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

  async getPaymentMethodResource(paymentMethodType: string): Promise<Resource> {
    return new Promise(async (resolve, reject) => {
      try {
        const data = await RNTPrimerHeadlessUniversalCheckoutAssetsManager.getPaymentMethodResource(paymentMethodType);
        const paymentMethodResource: Resource = data.paymentMethodResource;
        resolve(paymentMethodResource);
      } catch (err) {
        console.error(err);
        reject(err);
      }
    });
  }
}

export default PrimerHeadlessUniversalCheckoutAssetsManager;
