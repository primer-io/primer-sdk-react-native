import { Routes } from '../constants/url';

export const createPayment = async (
  environment: 'dev' | 'staging' | 'sandbox' | 'production',
  paymentMethod: string
) => {
  const url = Routes.payments;

  const body = JSON.stringify({
    environment,
    paymentMethod,
    isV3: true,
  });

  console.log('create payment request body', body);

  const headers = { 'Content-Type': 'application/json' };

  const method = 'post';

  const reqOptions = { method, headers, body };

  const result = await fetch(url, reqOptions);

  const json = await result.json();

  console.log('create payment response:', json);

  return json;
};
