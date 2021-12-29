import { root, baseHeaders } from '../constants/url';

export const resumePayment = async (id: string, req: any) => {
  const url = root + `/payments/${id}/resume`;

  const body = JSON.stringify(req);

  console.log('🚀🚀  create resume request body', body);

  const headers = baseHeaders;
  headers['X-Api-Version'] = '2021-09-27';

  const method = 'post';

  const reqOptions = { method, headers, body };

  const response = await fetch(url, reqOptions);

  if (response.status >= 200 && response.status < 300) {
    const parsedResponse = await response.json();
    console.log('🚀🚀  create resume response body', parsedResponse);
    return parsedResponse;
  } else {
    console.log('❌❌ error resume response', JSON.stringify(response));
    throw 'resume payment failed!';
  }
};
