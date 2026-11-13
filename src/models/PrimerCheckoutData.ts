import type { PrimerCheckoutAdditionalInfo } from './PrimerCheckoutAdditionalInfo';

export type PrimerCheckoutData = IPrimerCheckoutData;

interface IPrimerCheckoutData {
  payment?: IPrimerCheckoutDataPayment;
  additionalInfo?: PrimerCheckoutAdditionalInfo;
}

export type PrimerCheckoutDataPayment = IPrimerCheckoutDataPayment;

interface IPrimerCheckoutDataPayment {
  id?: string;
  orderId?: string;
  status?: PrimerPaymentStatus;
  paymentFailureReason?: PrimerPaymentErrorCode;
}

export type PrimerPaymentStatus = 'SUCCESS' | 'FAILED' | 'PENDING';

enum PrimerPaymentErrorCode {
  FAILED = 'payment-failed',
  CANCELLED_BY_CUSTOMER = 'cancelled-by-customer',
}
