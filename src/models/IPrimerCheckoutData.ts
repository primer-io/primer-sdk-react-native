export interface IPrimerCheckoutData {
    payment: IPrimerCheckoutDataPayment;
}

export interface IPrimerCheckoutDataPayment {
    id?: string;
    orderId?: string;
    paymentFailureReason?: IPrimerPaymentErrorCode;
}

export enum IPrimerPaymentErrorCode {
    FAILED = 'payment-failed',
    CANCELLED_BY_CUSTOMER = 'cancelled-by-customer',
}