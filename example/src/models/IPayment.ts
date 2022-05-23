export interface IPayment {
  amount: number;
  currencyCode: string;
  customer: IPayment_Customer;
  date: string;
  id: string;
  order: IPayment_Order;
  orderId?: string | null;
  paymentMethod: IPayment_PaymentMethod;
  processor?: IPayment_Processor | null;
  requiredAction?: IPayment_RequiredAction;
  status: string;
  transactions?: any | null;
}

export interface IPayment_Processor {
  amountCaptured?: number | null;
  amountRefunded?: number | null;
}

export interface IPayment_Address {
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  countryCode?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  postalCode?: string | null;
  state?: string | null;
}

export interface IPayment_Customer {
  emailAddress?: string;
  billingAddress?: IPayment_Address | null;
  shippingAddress?: IPayment_Address | null;
  nationalDocumentId?: string;
}

export interface IPayment_LineItem {
  amount: number;
  description?: string | null;
  discountAmount?: number | null;
  itemId?: string | null;
  quantity?: string | null;
}

export interface IPayment_Order {
  countryCode: string;
  fees?: any[] | null;
  lineItems: IPayment_LineItem[];
}

export interface IPayment_RequiredAction {
  name: string;
  description: string;
  clientToken: string;
}

export interface IPayment_PaymentMethod {
  analyticsId?: string | null;
  paymentMethodData?: IPayment_PaymentMethod_PaymentMethodData | null;
  paymentMethodToken: string;
  paymentMethodType: string;
  threeDSecureAuthentication?: IPayment_PaymentMethod_ThreeDSecureAuthentication | null;
}

export interface IPayment_PaymentMethod_PaymentMethodData {
  cardholderName?: string;
  expirationMonth?: string;
  expirationYear?: string;
  isNetworkTokenized?: boolean;
  last4Digits?: string;
  network?: string;
}

export interface IPayment_PaymentMethod_ThreeDSecureAuthentication {
  responseCode: string;
}
