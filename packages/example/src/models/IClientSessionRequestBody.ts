import { makeRandomString } from "../helpers/helpers";
import { PaymentHandling } from "../network/Environment";
import type { AppPaymentParameters } from "../screens/SettingsScreen";
import { Environment } from "./Environment";

export interface IClientSessionRequestBody {
    customerId?: string;
    orderId?: string;
    currencyCode?: string;
    order?: IClientSessionOrder;
    customer?: IClientSessionCustomer;
    paymentMethod?: IClientSessionPaymentMethod;
}

export interface IClientSessionOrder {
    countryCode?: string;
    lineItems?: Array<IClientSessionLineItem>
}

export interface IClientSessionCustomer {
    emailAddress?: string;
    mobileNumber?: string;
    firstName?: string;
    lastName?: string;
    billingAddress?: IClientSessionAddress;
    shippingAddress?: IClientSessionAddress;
    nationalDocumentId?: string;
}

export interface IClientSessionAddress {
    firstName?: string;
    lastName?: string;
    postalCode?: string;
    addressLine1?: string;
    addressLine2?: string;
    countryCode?: string;
    city?: string;
    state?: string;
}

export interface IClientSessionLineItem {
    amount: number;
    quantity: number;
    itemId: string;
    description: string;
    discountAmount?: number;
}

export interface IClientSessionActionsRequestBody {
    clientToken: string;
    actions: IClientSession_Action[];
}

export interface IClientSession_Action {
    type: string;
    params?: any;
}

export interface IClientSessionPaymentMethod {
    vaultOnSuccess?: boolean;
    paymentType?: string;
    options?: IClientSessionPaymentMethodOptions;
}

export interface IClientSessionPaymentMethodOptionsSurcharge {
    surcharge: {
        amount: number;
    }
}

export interface IClientSessionPaymentMethodOptions {
    GOOGLE_PAY?: IClientSessionPaymentMethodOptionsSurcharge;
    ADYEN_IDEAL?: IClientSessionPaymentMethodOptionsSurcharge;
    ADYEN_SOFORT?: IClientSessionPaymentMethodOptionsSurcharge;
    APPLE_PAY?: IClientSessionPaymentMethodOptionsSurcharge;
    ADYEN_GIROPAY?: IClientSessionPaymentMethodOptionsSurcharge;
    PAYMENT_CARD?: {
        networks: {
            VISA?: IClientSessionPaymentMethodOptionsSurcharge;
            MASTERCARD?: IClientSessionPaymentMethodOptionsSurcharge;
        },
        captureVaultedCardCvv: boolean;
    },
}

export let appPaymentParameters: AppPaymentParameters = {
    environment: Environment.Sandbox,
    paymentHandling: PaymentHandling.Auto,
    clientSessionRequestBody: {
        customerId: `rn-customer-${makeRandomString(8)}`,
        orderId: `rn-order-${makeRandomString(8)}`,
        currencyCode: 'GBP',
        order: {
            countryCode: 'GB',
            lineItems: [
                {
                    amount: 15100,
                    quantity: 1,
                    itemId: 'shoes-3213',
                    description: 'Fancy Shoes',
                    discountAmount: 0
                },
                // {
                //     amount: 1000,
                //     quantity: 1,
                //     itemId: 'hats-3213',
                //     description: 'Cool Hat',
                //     discountAmount: 0
                // }
            ]
        },
        customer: {
            emailAddress: 'rn-tester@primer.io',
            mobileNumber: '+447821721778',
            firstName: 'John',
            lastName: 'Smith',
            billingAddress: {
                firstName: 'John',
                lastName: 'Smith',
                postalCode: 'SW1H 9HP',
                addressLine1: '24 Old Queen St',
                addressLine2: undefined,
                countryCode: 'GB',
                city: 'London',
                state: undefined
            },
            shippingAddress: {
                firstName: 'John',
                lastName: 'Smith',
                postalCode: 'SW1H 9HP',
                addressLine1: '24 Old Queen St',
                countryCode: 'GB',
                city: 'London',
                state: undefined
            },
            nationalDocumentId: '78731798237'
        },
        paymentMethod: {
            vaultOnSuccess: false,
            paymentType: 'FIRST_PAYMENT',
        }
    },
    merchantName: 'Primer Merchant'
}
