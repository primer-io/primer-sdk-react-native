import { root } from '../constants/url';

export const resumePayment = async (id: string, req: any) => {
  const url = root + `/payments/${id}/resume`;

  const body = JSON.stringify(req);

  console.log('🚀🚀  create resume request body', body);

  const headers = {
    'Content-Type': 'application/json',
    'environment': 'sandbox',
  };

  const method = 'post';

  const reqOptions = { method, headers, body };

  const response = await fetch(url, reqOptions);

  if (response.status >= 200 && response.status < 300) {
    const parsedResponse = await response.json();
    console.log('create resume response:', parsedResponse);
    console.log('🚀🚀  create resume response body', parsedResponse);
    return parsedResponse;
  } else {
    console.log('❌❌ error resume response', JSON.stringify(response));
    throw 'resume payment failed!';
  }
};
