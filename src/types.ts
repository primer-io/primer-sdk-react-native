export enum PaymentMethodType {
  PAYMENT_CARD = 'PAYMENT_CARD',
  GOOGLE_PAY = 'GOOGLE_PAY',
  APPLE_PAY = 'APPLE_PAY',
  PAYPAL = 'PAYPAL',
}

export enum UXMode {
  CHECKOUT = 0,
  MANAGE_PAYMENT_METHODS = 1,
}

interface IPaymentMethod<T extends PaymentMethodType> {
  type: T;
}

type PaymentCard = IPaymentMethod<PaymentMethodType.PAYMENT_CARD>;
type GooglePay = IPaymentMethod<PaymentMethodType.GOOGLE_PAY>;
type ApplePay = IPaymentMethod<PaymentMethodType.APPLE_PAY>;
type PayPal = IPaymentMethod<PaymentMethodType.PAYPAL>;

export type PaymentMethod = PaymentCard | GooglePay | ApplePay | PayPal;

export interface CheckoutEventListener {
  (e: unknown): void;
}

export interface ShowCheckoutOptions {
  uxMode?: UXMode;
  currency?: string;
  amount?: number;
}
