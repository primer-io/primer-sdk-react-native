import { root } from '../constants/url';

export const createPayment = async (paymentMethod: string) => {
  const url = root + '/payments';

  const body = JSON.stringify({
    paymentMethodToken: paymentMethod,
  });

  console.log('🚀 create payment request body', body);

  const headers = {
    'Content-Type': 'application/json',
    'X-API-Version': '2021-09-27',
    'environment': 'staging',
  };

  const method = 'post';

  const reqOptions = { method, headers, body };

  const result = await fetch(url, reqOptions);

  const json = await result.json();

  console.log('🚀 create payment response:', json);

  return json;
};
