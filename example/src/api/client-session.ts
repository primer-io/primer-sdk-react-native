import type { PrimerSettings } from 'src/models/primer-settings';
import { primer_environment } from '../constants/environment';
import { root } from '../constants/url';

export const createClientSession = async (
  customerId: string,
  settings: PrimerSettings
) => {
  const url = root + '/client-session';

  const headers = {
    'Content-Type': 'application/json',
    'X-Api-Version': '2021-10-19',
    'environment': primer_environment,
  };

  const body = JSON.stringify({
    customerId,
    orderId: 'rn-test-10001',
    currencyCode: settings.order?.currency,
    order: {
      countryCode: settings.order?.countryCode,
      lineItems: [
        {
          amount: 10001,
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
        countryCode: "NL",
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
        countryCode: settings.order?.countryCode,
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
        BUCKAROO_IDEAL: {
          surcharge: {
            amount: 299,
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

  const method = 'post';

  const reqOptions = { method, headers, body };

  const result = await fetch(url, reqOptions);

  const json = await result.json();

  console.log('client token:', json);

  return json;
};
