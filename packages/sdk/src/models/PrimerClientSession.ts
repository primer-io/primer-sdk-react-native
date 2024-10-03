export type PrimerClientSession = IPrimerClientSession;

interface IPrimerClientSession {
    customerId?: string;
    orderId?: string;
    currencyCode?: string;
    totalAmount?: number;
    lineItems?: IPrimerLineItem[];
    orderDetails?: IPrimerOrder;
    customer?: IPrimerCustomer;
}

export type PrimerLineItem = IPrimerLineItem;

interface IPrimerLineItem {
    itemId?: string;
    itemDescription?: string;
    amount?: number;
    discountAmount?: number;
    quantity?: number;
    taxCode?: string;
    taxAmount?: number;
}

export type PrimerOrder = IPrimerOrder;

interface IPrimerOrder {
    countryCode?: string;
    shipping?: IPrimerShipping;
}

interface IPrimerShipping {
    amount?: number;
    methodId?: string;
    methodName?: string;
    methodDescription?: string;
}

export type PrimerCustomer = IPrimerCustomer;

interface IPrimerCustomer {
    emailAddress?: string;
    mobileNumber?: string;
    firstName?: string;
    lastName?: string;
    billingAddress?: IPrimerAddress;
    shippingAddress?: IPrimerAddress;
}

export type PrimerAddress = IPrimerAddress;

interface IPrimerAddress {
    firstName?: string;
    lastName?: string;
    addressLine1?: string;
    addressLine2?: string;
    postalCode?: string;
    city?: string;
    state?: string;
    countryCode?: string;
}
