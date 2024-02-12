import { KlarnaPaymentCategory } from "./KlarnaPaymentCategory"

export type PaymentSessionCreated = IPaymentSessionCreated;
export type PaymentSessionAuthorized = IPaymentSessionAuthorized;
export type PaymentSessionFinalized = { "name": "paymentSessionFinalized" };
export type PaymentViewLoaded = { "name": "paymentViewLoaded" };

interface IPaymentSessionCreated {
    paymentCategories: KlarnaPaymentCategory[];
}

interface IPaymentSessionAuthorized {
    isFinalized: boolean;
}