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

interface PaymentMethodToken {
  token: string;
}

interface ICheckoutEvent<T extends CheckoutEventType, U> {
  type: T;
  data: U;
}

interface TokenizeError {
  code: string;
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
  paymentMethods: PaymentMethod[];
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

export type PaymentMethod =
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

export interface IOSInitOptions {
  clientTokenData: IOSClientTokenData;
  amount: number;
  currency: string;
  customerId: string;
  countryCode: string;
  theme?: IOSPrimerTheme;
}

export interface IOSClientTokenData {
  clientToken: String;
  expirationDate: String;
}

export interface IOSPrimerTheme {
  colorTheme: IOSPrimerColorTheme;
  textFieldTheme: IOSPrimerTextFieldTheme;
}

export interface IOSPrimerColorTheme {
  text1?: IOSRgbColor;
  text2?: IOSRgbColor;
  text3?: IOSRgbColor;
  secondaryText1?: IOSRgbColor;
  main1?: IOSRgbColor;
  main2?: IOSRgbColor;
  tint1?: IOSRgbColor;
  disabled1?: IOSRgbColor;
  error1?: IOSRgbColor;
}

export interface IOSRgbColor {
  red: number;
  green: number;
  blue: number;
}

export enum IOSPrimerTextFieldTheme {
  doublelined,
  underlined,
  outlined,
}

export interface IOSUniversalCheckout {
  initialize(
    options: IOSInitOptions,
    onTokenizeSuccess: (any: any) => void
  ): void;

  loadDirectDebitView(): void;

  loadPaymentMethods(completion: (any: any) => {}): void;

  dismissCheckout(): void;
}
