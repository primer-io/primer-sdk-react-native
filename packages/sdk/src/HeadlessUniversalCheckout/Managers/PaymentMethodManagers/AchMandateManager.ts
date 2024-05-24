import {
    NativeModules
} from 'react-native';

const { RNStripeAchMandateManager } = NativeModules;

export class PrimerHeadlessUniversalCheckoutAchMandateManager {
    ///////////////////////////////////////////
    // Init
    ///////////////////////////////////////////
    constructor() { }

    ///////////////////////////////////////////
    // API
    ///////////////////////////////////////////

    /**
     * Accepts the Stripe ACH mandate, completing the payment.
     */
    async acceptMandate(): Promise<void> {
        console.log("Accepting mandate");
        await RNStripeAchMandateManager.acceptMandate();
    }

    /**
     * Declines the Stripe ACH mandate, cancelling the payment.
     */
    async declineMandate(): Promise<void> {
        console.log("Declining mandate");
        await RNStripeAchMandateManager.declineMandate();
    }
}