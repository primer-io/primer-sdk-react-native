import { KlarnaPaymentCategory } from "./KlarnaPaymentCategory";
import { KlarnaComponent } from "src/HeadlessUniversalCheckout/Managers/PaymentMethodManagers/KlarnaManager";

export type KlarnaPaymentOptions = IKlarnaPaymentOptions

export type KlarnaPaymentFinalization = { "name": "finalizePayment" }

/**
 * Interface representing Klarna payment options required for configuring the {@link KlarnaComponent}.
 */
interface IKlarnaPaymentOptions {
    /**
     * Url used by third-party Android apps to build the intent for returning to the app.
     */
    returnIntentUrl?: string
    /**
     * Payment category required for session creation.
     */
    paymentCategory: KlarnaPaymentCategory
}