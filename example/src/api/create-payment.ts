import { Routes } from '../constants/url';

export const createPayment = async (
  environment: 'dev' | 'staging' | 'sandbox' | 'production',
  paymentMethod: string,
  customerId: string,
  countryCode: string,
  amount: number,
  currencyCode: string
) => {
  const url = Routes.payments;

  const body = JSON.stringify({
    environment,
    paymentMethod,
    amount,
    customerId,
    currencyCode,
    countryCode,
  });

  const headers = { 'Content-Type': 'application/json' };

  const method = 'post';

  const reqOptions = { method, headers, body };

  const result = await fetch(url, reqOptions);

  const json = await result.json();

  console.log('create payment response:', json.requiredAction);

  return json.requiredAction.clientToken;
};
