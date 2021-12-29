import { root, baseHeaders } from '../constants/url';

export const resumePayment = async (id: string, req: any) => {
  const url = root + `/payments/${id}/resume`;

  const body = JSON.stringify(req);

  console.log('🚀🚀  create resume request body', body);

  const headers = baseHeaders;
  headers['X-Api-Version'] = '2021-09-27';

  const method = 'post';
  const reqOptions = { method, headers, body };

  console.log(`REQUEST\n[${method.toUpperCase()}] URL: ${url}\nHeaders: ${JSON.stringify(headers)}\nBody: ${JSON.stringify(body)}\n\n`);
  const response = await fetch(url, reqOptions);
  console.log(`RESPONSE\n${JSON.stringify(response)}`);

  if (response.status >= 200 && response.status < 300) {
    const parsedResponse = await response.json();
    console.log('🚀🚀  create resume response body', parsedResponse);
    return parsedResponse;
  } else {
    console.log('❌❌ error resume response', JSON.stringify(response));
    throw 'resume payment failed!';
  }
};
