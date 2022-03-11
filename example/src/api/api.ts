import axios from 'axios';
import { primer_environment } from '../constants/environment';
import { root } from '../constants/url';

export const createClientSession = async () => {
    const url = root + '/client-session';

    const headers = {
        'Content-Type': 'application/json',
        'X-Api-Version': '2021-10-19',
        'environment': primer_environment,
      };

      const body = JSON.stringify({
        customerId: "rn_customer_id",
        orderId: 'rn-test-10001',
        currencyCode: 'EUR',
        order: {
            countryCode: 'FR',
            lineItems: [
            {
                amount: 30,
                quantity: 1,
                itemId: 'item-123',
                description: 'this item',
                discountAmount: 0,
            },
            ],
        },
        customer: {
            emailAddress: 'test@mail.com',
            mobileNumber: '0841234567',
            firstName: 'John',
            lastName: 'Doe',
            billingAddress: {
            firstName: 'John',
            lastName: 'Doe',
            postalCode: '12345',
            addressLine1: '1 test',
            addressLine2: null,
            countryCode: 'GB',
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
            countryCode: 'GB',
            },
            nationalDocumentId: '9011211234567',
        },
        paymentMethod: {
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
        },
    });

    try {
        const response = await axios.post(url, body, {headers: headers});

        if (response.status >= 200 && response.status < 300) {
            return response.data;
        } else {
            const err = new Error(`Request failed with status ${response.status}.\nBody: ${JSON.stringify(response.data)}`);
            throw err;
        }
    } catch (err) {
        console.error(err);
        throw err;
    }
}

export const createPayment = async (paymentMethod: string) => {
    const url = root + '/payments';

    const headers = {
        'Content-Type': 'application/json',
        'X-API-Version': '2021-09-27',
        'environment': primer_environment,
      };

    const body = {paymentMethodToken: paymentMethod};
    try {
        const response = await axios.post(url, body, {headers: headers});

        if (response.status >= 200 && response.status < 300) {
            return response.data;
        } else {
            const err = new Error(`Request failed with status ${response.status}.\nBody: ${JSON.stringify(response.data)}`);
            throw err;
        }
    } catch (err) {
        console.error(err);
        throw err;
    }
};

export const resumePayment = async (id: string, resumeToken: string) => {
    const url = root + `/payments/${id}/resume`;

    const headers = {
        'Content-Type': 'application/json',
        'X-API-Version': '2021-09-27',
        'environment': primer_environment,
    };

    const body = {resumeToken: resumeToken};

    try {
        const response = await axios.post(url, body, {headers: headers});

        if (response.status >= 200 && response.status < 300) {
            return response.data;
        } else {
            const err = new Error(`Request failed with status ${response.status}.\nBody: ${JSON.stringify(response.data)}`);
            throw err;
        }
    } catch (err) {
        console.error(err);
        throw err;
    }
}
