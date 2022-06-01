import axios from 'axios';
import { getEnvironmentStringVal } from '../models/Environment';
import { environment } from '../screens/SettingsScreen';

const rootUrl = "https://us-central1-primerdemo-8741b.cloudfunctions.net";

export const createClientSession = async () => {
    const url = rootUrl + '/client-session';

    const headers = {
        'Content-Type': 'application/json',
        'X-Api-Version': '2021-10-19',
        'environment': getEnvironmentStringVal(environment),
      };

      const body = JSON.stringify({
        customerId: "rn_customer_id",
        orderId: 'rn-test-10001',
        currencyCode: 'EUR',
        order: {
            countryCode: 'NL',
            lineItems: [
                {
                    amount: 10,
                    quantity: 1,
                    itemId: 'shoes-321',
                    description: 'Fancy shoes',
                    discountAmount: 0,
                },
                {
                    amount: 20,
                    quantity: 2,
                    itemId: 'hoodie-738921',
                    description: 'Cool hoodie',
                    discountAmount: 0,
                },
                {
                    amount: 30,
                    quantity: 3,
                    itemId: 'tshirt-3721',
                    description: 'T-shirt',
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
    const url = rootUrl + '/payments';

    const headers = {
        'Content-Type': 'application/json',
        'X-API-Version': '2021-09-27',
        'environment': getEnvironmentStringVal(environment),
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
    const url = rootUrl + `/payments/${id}/resume`;

    const headers = {
        'Content-Type': 'application/json',
        'X-API-Version': '2021-09-27',
        'environment': getEnvironmentStringVal(environment),
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
