import { KlarnaPaymentCategory } from "./KlarnaPaymentCategory"

export type PaymentSessionCreated = IPaymentSessionCreated;
export type PaymentSessionAuthorized = IPaymentSessionAuthorized;

export type PaymentSessionFinalized = { "name": "paymentSessionFinalized" };

interface IPaymentSessionCreated {
    paymentCategories: KlarnaPaymentCategory[];
}

interface IPaymentSessionAuthorized {
    isFinalized: boolean;
}

// TODO TWS-94: need new step for PaymentViewLoaded