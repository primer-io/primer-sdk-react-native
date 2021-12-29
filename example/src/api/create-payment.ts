import { root, baseHeaders } from '../constants/url';

export const createPayment = async (paymentMethod: string) => {
  const url = root + '/payments';

  const body = JSON.stringify({
    paymentMethodToken: paymentMethod,
  });

  console.log('🚀 create payment request body', body);

  const headers = baseHeaders;
  headers['X-Api-Version'] = '2021-09-27';

  const method = 'post';
  const reqOptions = { method, headers, body };

  console.log(`REQUEST\n[${method.toUpperCase()}] URL: ${url}\nHeaders: ${JSON.stringify(headers)}\nBody: ${JSON.stringify(body)}\n\n`);
  const result = await fetch(url, reqOptions);

  const json = await result.json();
  console.log(`RESPONSE\n${JSON.stringify(json)}`);

  return json;
};
