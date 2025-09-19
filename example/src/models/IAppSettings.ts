export interface IClientSessionParams {
  currencyCode: string;
  customerId?: string;
  order?: IOrder;
  orderId?: string;
  merchantName?: string;
  customer?: ICustomer;
}

export interface IOrder {
  countryCode: string;
  lineItems: ILineItem[];
}

export interface ILineItem {
  amount: number;
  quantity: number;
  itemId: string;
  description: string;
  discountAmount?: number;
}

export interface IAddress {
  firstName?: string;
  lastName?: string;
  postalCode?: string;
  addressLine1: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  countryCode?: string;
}

export interface ICustomer {
  emailAddress?: string;
  mobileNumber?: string;
  firstName?: string;
  lastName?: string;
  billingAddress?: IAddress;
  shippingAddress?: IAddress;
  nationalDocumentId?: string;
}
