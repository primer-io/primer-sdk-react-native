export type PaymentMethodType =
  | 'PAYMENT_CARD'
  | 'GOOGLE_PAY'
  | 'APPLE_PAY'
  | 'PAYPAL'
  | 'GOCARDLESS';

export enum UXMode {
  CHECKOUT = 0,
  MANAGE_PAYMENT_METHODS = 1,
  STANDALONE_PAYMENT_METHOD = 2,
}

export type CheckoutEventType =
  | 'EXIT'
  | 'TOKEN_ADDED_TO_VAULT'
  | 'TOKEN_REMOVED_FROM_VAULT'
  | 'TOKENIZE_SUCCESS'
  | 'TOKENIZE_ERROR';

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
  | ICheckoutEvent<'EXIT', ExitInfo>
  | ICheckoutEvent<'TOKEN_ADDED_TO_VAULT', PaymentMethodToken>
  | ICheckoutEvent<'TOKEN_REMOVED_FROM_VAULT', PaymentMethodToken>
  | ICheckoutEvent<'TOKENIZE_SUCCESS', PaymentMethodToken>
  | ICheckoutEvent<'TOKENIZE_ERROR', TokenizeError>;

interface AndroidCheckoutTheme {
  buttonCornerRadius?: number;
  inputCornerRadius?: number;

  // Surface colors
  backgroundColor?: string;

  // Button Colors
  buttonPrimaryColor?: string;
  buttonPrimaryColorDisabled?: string;
  buttonDefaultColor?: string;
  buttonDefaultColorDisabled?: string;
  buttonDefaultBorderColor?: string;

  // Text Colors
  textDefaultColor?: string;
  textDangerColor?: string;
  textMutedColor?: string;

  // General theme
  primaryColor?: string;
  inputBackgroundColor?: string;

  windowMode?: 'BOTTOM_SHEET' | 'FULL_SCREEN';
}

export interface InitOptions {
  clientToken: string;
  paymentMethods: PaymentMethodConfig[];
  uxMode: UXMode;
  onEvent: (e: CheckoutEvent) => void;
  amount?: number;
  currency?: string;
  theme?: { ios?: IOSCheckoutTheme; android?: AndroidCheckoutTheme };
}

export interface IUniversalCheckout {
  initialize(options: InitOptions): void;
  show(): void;
  dismiss(): void;
  showSuccess(): void;
  showProgressIndicator(visible: boolean): void;
  destroy(): void;
  getSavedPaymentMethods(): Promise<PaymentMethodToken[]>;
}

type IPaymentMethod<T, U = {}> = U & {
  type: T;
};

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  countryCode: string;
  postalCode: string;
}

export interface GoCardlessOptions {
  companyName: string;
  companyAddress: Address;
  customerName?: string;
  customerEmail?: string;
  customerAddress?: Address;
}

export type PaymentCard = IPaymentMethod<'PAYMENT_CARD'>;
export type GooglePay = IPaymentMethod<'GOOGLE_PAY'>;
export type ApplePay = IPaymentMethod<'APPLE_PAY'>;
export type PayPal = IPaymentMethod<'PAYPAL'>;
export type GoCardless = IPaymentMethod<'GOCARDLESS', GoCardlessOptions>;

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

export interface IOSInitOptions {
  clientTokenData: IOSClientTokenData;
  amount: number;
  currency: string;
  customerId: string;
  countryCode: string;
  theme?: IOSCheckoutTheme<IOSRgbColor>;
  businessDetails: IOSBusinessDetails;
  isFullScreenOnly?: boolean;
}

export interface IOSClientTokenData {
  clientToken: String;
  expirationDate: String;
}

export interface IOSCheckoutTheme<T = string> {
  colorTheme: IOSPrimerColorTheme<T>;
  textFieldTheme: 'doublelined' | 'underlined' | 'outlined';
}

export interface IOSPrimerColorTheme<T> {
  text1?: T;
  text2?: T;
  text3?: T;
  secondaryText1?: T;
  main1?: T;
  main2?: T;
  tint1?: T;
  disabled1?: T;
  error1?: T;
}

export interface IOSRgbColor {
  red: number;
  green: number;
  blue: number;
}

export interface IOSBusinessDetails {
  name: string;
  address: IOSBusinessAddress;
}

export interface IOSBusinessAddress {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  countryCode: string;
  postalCode: string;
}
