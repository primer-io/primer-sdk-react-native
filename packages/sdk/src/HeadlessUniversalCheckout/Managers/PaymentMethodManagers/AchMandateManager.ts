import {
    NativeModules
} from 'react-native';

const { RNAchMandateManager } = NativeModules;

export class PrimerHeadlessUniversalCheckoutAchMandateManager {
    ///////////////////////////////////////////
    // Init
    ///////////////////////////////////////////
    constructor() { }

    ///////////////////////////////////////////
    // API
    ///////////////////////////////////////////

    /**
     * Accepts the ACH mandate, completing the payment.
     */
    async acceptMandate(): Promise<void> {
        console.log("Accepting mandate");
        await RNAchMandateManager.acceptMandate();
    }

    /**
     * Declines the ACH mandate, cancelling the payment.
     */
    async declineMandate(): Promise<void> {
        console.log("Declining mandate");
        await RNAchMandateManager.declineMandate();
    }
}