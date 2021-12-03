export const createClientSession = async (
  environment: 'dev' | 'staging' | 'sandbox' | 'production',
  customerId: string,
  country: string
) => {
  const root = 'https://us-central1-primerdemo-8741b.cloudfunctions.net';

  const url = root + '/clientSession';

  console.log('ignore:', country); // todo: refactor test app settings form

  const body = JSON.stringify({
    environment,
    customerId,
    orderId: 'rn-test-10001',
    currencyCode: 'EUR',
    order: {
      countryCode: 'NL',
      lineItems: [
        {
          amount: 1000,
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
      shippingAddress: {
        addressLine1: '1 test',
        postalCode: '12345',
        city: 'test',
        state: 'test',
        countryCode: 'NL',
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

  const headers = { 'Content-Type': 'application/json' };

  const method = 'post';

  const reqOptions = { method, headers, body };

  const result = await fetch(url, reqOptions);

  const json = await result.json();

  console.log('client token:', json);

  return json.clientToken;
};
