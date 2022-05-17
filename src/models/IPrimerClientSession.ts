export interface IPrimerClientSession {
    customerId?: string;
    orderId?: string;
    currencyCode?: string;
    totalAmount?: number;
    lineItems?: IPrimerLineItem[];
    orderDetails?: IPrimerOrder;
    customer?: IPrimerCustomer;
}

export interface IPrimerLineItem {
    itemId?: string;
    itemDescription?: string;
    amount?: number;
    discountAmount?: number;
    quantity?: number;
    taxCode?: string;
    taxAmount?: number;
}

export interface IPrimerOrder {
    countryCode?: string;
}

export interface IPrimerCustomer {
    emailAddress?: string;
    mobileNumber?: string;
    firstName?: string;
    lastName?: string;
    billingAddress?: IPrimerAddress;
    shippingAddress?: IPrimerAddress;
}

export interface IPrimerAddress {
    firstName?: string;
    lastName?: string;
    addressLine1?: string;
    addressLine2?: string;
    postalCode?: string;
    city?: string;
    state?: string;
    countryCode?: string;
}