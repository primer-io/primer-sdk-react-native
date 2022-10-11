import { NativeModules } from 'react-native';
import type { PrimerSessionIntent } from 'src/models/PrimerSessionIntent';

const { RNTPrimerHeadlessUniversalPaymentMethodNativeUIManager } = NativeModules;

class PrimerHeadlessUniversalCheckoutPaymentMethodNativeUIManager {

    ///////////////////////////////////////////
    // Init
    ///////////////////////////////////////////
    constructor() {}

    ///////////////////////////////////////////
    // Native API
    ///////////////////////////////////////////

    async initialize(paymentMethodType: string): Promise<void> {
        try {
            await RNTPrimerHeadlessUniversalPaymentMethodNativeUIManager.initialize(paymentMethodType);
        } catch (err) {
            console.error(err);
            throw err;
        }
    }

    async showPaymentMethod(intent: PrimerSessionIntent): Promise<void> {
        return RNTPrimerHeadlessUniversalPaymentMethodNativeUIManager.showPaymentMethod(intent);
    }
}

export default PrimerHeadlessUniversalCheckoutPaymentMethodNativeUIManager;