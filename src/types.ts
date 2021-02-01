export enum PaymentMethodType {
  PAYMENT_CARD = 'PAYMENT_CARD',
  GOOGLE_PAY = 'GOOGLE_PAY',
  APPLE_PAY = 'APPLE_PAY',
  PAYPAL = 'PAYPAL',
  GO_CARDLESS = 'GOCARDLESS',
}

export enum UXMode {
  CHECKOUT = 0,
  MANAGE_PAYMENT_METHODS = 1,
  STANDALONE_PAYMENT_METHOD = 2,
}

export enum CheckoutEventType {
  EXIT = 'EXIT',
  TOKEN_ADDED_TO_VAULT = 'TOKEN_ADDED_TO_VAULT',
  TOKEN_REMOVED_FROM_VAULT = 'TOKEN_REMOVED_FROM_VAULT',
  TOKENIZE_SUCCESS = 'TOKENIZE_SUCCESS',
  TOKENIZE_ERROR = 'TOKENIZE_ERROR',
}

export interface PaymentMethodToken {
  token: string;
  analyticsId: string;
  paymentInstrumentType: string;
  paymentInstrumentData: { [x: string]: string };
}

interface ICheckoutEvent<T extends CheckoutEventType, U> {
  type: T;
  data: U;
}

interface TokenizeError {
  errorId: string;
  diagnosticsId: string;
  message: string;
}

interface ExitInfo {
  reason: string;
}

export type CheckoutEvent =
  | ICheckoutEvent<CheckoutEventType.EXIT, ExitInfo>
  | ICheckoutEvent<CheckoutEventType.TOKEN_ADDED_TO_VAULT, PaymentMethodToken>
  | ICheckoutEvent<
      CheckoutEventType.TOKEN_REMOVED_FROM_VAULT,
      PaymentMethodToken
    >
  | ICheckoutEvent<CheckoutEventType.TOKENIZE_SUCCESS, PaymentMethodToken>
  | ICheckoutEvent<CheckoutEventType.TOKENIZE_ERROR, TokenizeError>;

interface CheckoutTheme {
  backgroundColor?: string;
}

export interface InitOptions {
  clientToken: string;
  paymentMethods: PaymentMethodConfig[];
  uxMode: UXMode;
  onEvent: (e: CheckoutEvent) => void;
  amount?: number;
  currency?: string;
  theme?: CheckoutTheme;
}

export interface IUniversalCheckout {
  initialize(options: InitOptions): void;
  show(): void;
  dismiss(): void;
  showSuccess(): void;
  showProgressIndicator(visible: boolean): void;
  destroy(): void;
}

type IPaymentMethod<T extends PaymentMethodType, U = {}> = U & {
  type: T;
};

export interface GoCardlessOptions {
  companyName: string;
  companyAddress: string;
  customerName: string;
  customerEmail: string;
  customerAddressLine1: string;
  customerAddressLine2?: string;
  customerAddressCity: string;
  customerAddressState?: string;
  customerAddressPostalCode: string;
  customerAddressCountryCode: string;
}

export type PaymentCard = IPaymentMethod<PaymentMethodType.PAYMENT_CARD>;
export type GooglePay = IPaymentMethod<PaymentMethodType.GOOGLE_PAY>;
export type ApplePay = IPaymentMethod<PaymentMethodType.APPLE_PAY>;
export type PayPal = IPaymentMethod<PaymentMethodType.PAYPAL>;
export type GoCardless = IPaymentMethod<
  PaymentMethodType.GO_CARDLESS,
  GoCardlessOptions
>;

export type PaymentMethodConfig =
  | PaymentCard
  | GooglePay
  | ApplePay
  | PayPal
  | GoCardless;

export interface CheckoutEventListener {
  (e: unknown): void;
}

export interface ShowCheckoutOptions {
  uxMode?: UXMode;
  currency?: string;
  amount?: number;
}
