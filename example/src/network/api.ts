import axios from 'axios';
import { environment } from '../screens/SettingsScreen';
import { getEnvironmentStringVal } from '../models/Environment';
import type { IClientSessionActionsRequestBody, IClientSessionRequestBody } from '../models/IClientSessionRequestBody';
import type { IPayment } from '../models/IPayment';
import { makeRandomString } from '../helpers/helpers';

const baseUrl = 'https://us-central1-primerdemo-8741b.cloudfunctions.net/api';

let staticHeaders = {
    'Content-Type': 'application/json',
    'environment': getEnvironmentStringVal(environment),
}

export function createClientSessionRequestBody(
    amount: number | null,
    currencyCode: string,
    countryCode: string,
    customerId: string | null,
    phoneNumber: string | null,
    isSurchargeEnabled: boolean
): IClientSessionRequestBody {
    let clientSessionRequestBody: IClientSessionRequestBody = {
        customerId: customerId || undefined,
        orderId: 'rn-test-' + makeRandomString(8),
        currencyCode: currencyCode,
        customer: {
            emailAddress: 'test@mail.com',
            mobileNumber: phoneNumber || undefined,
            firstName: 'John',
            lastName: 'Doe',
            billingAddress: {
                firstName: 'John',
                lastName: 'Doe',
                postalCode: '12345',
                addressLine1: '1 test',
                addressLine2: undefined,
                countryCode: countryCode,
                city: 'test',
                state: 'test',
            },
            shippingAddress: {
                firstName: 'John',
                lastName: 'Doe',
                addressLine1: '1 test',
                postalCode: '12345',
                city: 'test',
                state: 'test',
                countryCode: countryCode,
            },
            nationalDocumentId: '9011211234567',
        },
        paymentMethod: {
            vaultOnSuccess: false
        },
    };

    if (amount) {
        clientSessionRequestBody.order = {
            countryCode: countryCode,
            lineItems: [
                {
                    amount: amount,
                    quantity: 1,
                    itemId: 'item-123',
                    description: 'this item',
                    discountAmount: 0,
                },
            ],
        }

        if (clientSessionRequestBody.customerId === undefined) {
            // If there's an amount, it's the checkout flow.
            // A customerId is needed
            clientSessionRequestBody.customerId = `rn-customer-${makeRandomString(8)}`;
        }
    }

    if (isSurchargeEnabled) {
        clientSessionRequestBody.paymentMethod = {
            vaultOnSuccess: false,
            options: {
                GOOGLE_PAY: {
                    surcharge: {
                        amount: 50,
                    },
                },
                ADYEN_IDEAL: {
                    surcharge: {
                        amount: 50,
                    },
                },
                ADYEN_SOFORT: {
                    surcharge: {
                        amount: 50,
                    },
                },
                APPLE_PAY: {
                    surcharge: {
                        amount: 150,
                    },
                },
                PAYMENT_CARD: {
                    networks: {
                        VISA: {
                            surcharge: {
                                amount: 100,
                            },
                        },
                        MASTERCARD: {
                            surcharge: {
                                amount: 200,
                            },
                        },
                    },
                },
            },
        }
    }

    return clientSessionRequestBody;
}

export const createClientSession = async (body: IClientSessionRequestBody) => {
    const url = baseUrl + '/client-session';
    const headers = { ...staticHeaders, 'X-Api-Version': '2021-10-19' };

    try {
        console.log(`\nREQUEST:`);
        console.log(url);
        console.log(`\nHEADERS:`)
        console.log(headers);
        console.log(`\nBODY:`);
        console.log(body);
        console.log(`\n`);
        const response = await axios.post(url, body, { headers: headers });

        console.log(`\nRESPONSE [${response.status}]:`);
        console.log(response.data);

        if (response.status >= 200 && response.status < 300) {
            return response.data;
        } else {
            const err = new Error(`Request failed with status ${response.status}.\nBody: ${JSON.stringify(response.data)}`);
            console.error(err);
            throw err;
        }
    } catch (err: any) {
        console.log(err.response.data);
        console.error(err);
        throw err;
    }
}

export const setClientSessionActions = async (body: IClientSessionActionsRequestBody) => {
    const url = baseUrl + '/client-session/actions';
    const headers = { ...staticHeaders, 'X-Api-Version': '2021-10-19' };

    try {
        console.log(`\nREQUEST:`);
        console.log(url);
        console.log(`\nHEADERS:`)
        console.log(headers);
        console.log(`\nBODY:`);
        console.log(body);
        console.log(`\n`);
        const response = await axios.post(url, body, { headers: headers });

        console.log(`\nRESPONSE [${response.status}]:`);
        console.log(response.data);

        if (response.status >= 200 && response.status < 300) {
            const clientSession = response.data;
            return clientSession;
        } else {
            const err = new Error(`Request failed with status ${response.status}.\nBody: ${JSON.stringify(response.data)}`);
            console.error(err);
            throw err;
        }
    } catch (err: any) {
        console.log(err.response.data);
        console.error(err);
        throw err;
    }
}

export const createPayment = async (paymentMethodToken: string) => {
    const url = baseUrl + '/payments';
    const headers = { ...staticHeaders, 'X-Api-Version': '2021-09-27' };

    const body = { paymentMethodToken: paymentMethodToken };
    try {
        console.log(`\nREQUEST:`);
        console.log(url);
        console.log(`\nHEADERS:`)
        console.log(headers);
        console.log(`\nBODY:`);
        console.log(body);
        console.log(`\n`);
        const response = await axios.post(url, body, { headers: headers });

        console.log(`\nRESPONSE [${response.status}]:`);
        console.log(response.data);

        if (response.status >= 200 && response.status < 300) {
            const payment: IPayment = response.data;
            return payment;
        } else {
            const err = new Error(`Request failed with status ${response.status}.\nBody: ${JSON.stringify(response.data)}`);
            console.error(err);
            throw err;
        }
    } catch (err: any) {
        console.log(err.response.data);
        console.error(err);
        throw err;
    }
};

export const resumePayment = async (paymentId: string, resumeToken: string) => {
    const url = baseUrl + `/payments/${paymentId}/resume`;
    const headers = { ...staticHeaders, 'X-Api-Version': '2021-09-27' };

    const body = { resumeToken: resumeToken };

    try {
        console.log(`\nREQUEST:`);
        console.log(url);
        console.log(`\nHEADERS:`)
        console.log(headers);
        console.log(`\nBODY:`);
        console.log(body);
        console.log(`\n`);
        const response = await axios.post(url, body, { headers: headers });

        console.log(`\nRESPONSE [${response.status}]:`);
        console.log(response.data);

        if (response.status >= 200 && response.status < 300) {
            return response.data;
        } else {
            const err = new Error(`Request failed with status ${response.status}.\nBody: ${JSON.stringify(response.data)}`);
            console.error(err);
            throw err;
        }
    } catch (err: any) {
        console.log(err.response.data);
        console.error(err);
        throw err;
    }
}
