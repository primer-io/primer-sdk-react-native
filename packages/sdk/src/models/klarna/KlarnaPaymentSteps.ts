import { KlarnaPaymentCategory } from "./KlarnaPaymentCategory"

/**
 * A type representing the created payment session.
 */
export type PaymentSessionCreated = IPaymentSessionCreated;

/**
 * A type representing the authorized payment session.
 */
export type PaymentSessionAuthorized = IPaymentSessionAuthorized;

/**
 * A type representing the finalized payment session.
 */
export type PaymentSessionFinalized = { "name": "paymentSessionFinalized" };

/**
 * A type that indicates that the payment view is loaded and ready to be displayed.
 */
export type PaymentViewLoaded = { "name": "paymentViewLoaded" };

interface IPaymentSessionCreated {
    paymentCategories: KlarnaPaymentCategory[];
}

interface IPaymentSessionAuthorized {
    isFinalized: boolean;
}