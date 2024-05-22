import { NamedComponentValidatableData } from "../NamedComponentValidatableData";
import { KlarnaPaymentCategory } from "./KlarnaPaymentCategory";
import { KlarnaComponent } from "src/HeadlessUniversalCheckout/Managers/PaymentMethodManagers/KlarnaManager";

export type KlarnaPaymentValidatableData = KlarnaPaymentOptions | KlarnaPaymentFinalization

/**
 * A type representing Klarna payment options required for configuring the {@link KlarnaComponent}.
 */
export type KlarnaPaymentOptions = {
    validatableDataName: "klarnaPaymentOptions",

    /**
     * Url used by third-party Android apps to build the intent for returning to the app.
     */
    returnIntentUrl?: string,
    /**
     * Payment category required for session creation.
     */
    paymentCategory: KlarnaPaymentCategory,
} & NamedComponentValidatableData

/**
 * A type representing the finalized Klarna payment session.
 */
export type KlarnaPaymentFinalization = { validatableDataName: "klarnaPaymentFinalization" } & NamedComponentValidatableData