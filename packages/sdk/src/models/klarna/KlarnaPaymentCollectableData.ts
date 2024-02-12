import { KlarnaPaymentCategory } from "./KlarnaPaymentCategory";
import { KlarnaPaymentComponent } from "src/HeadlessUniversalCheckout/Managers/PaymentMethodManagers/KlarnaManager";

export type KlarnaPaymentOptions = IKlarnaPaymentOptions

export type KlarnaPaymentFinalization = { "name": "finalizePayment" }

/**
 * Interface representing Klarna payment options required for configuring the {@link KlarnaPaymentComponent}.
 */
interface IKlarnaPaymentOptions {
    /**
     * Url used by third-party apps to build the intent for returning to the app. // TODO TWS-94: this might not work on iOS
     */
    returnIntentUrl: string
    /**
     * Payment category required for session creation.
     */
    paymentCategory: KlarnaPaymentCategory
}