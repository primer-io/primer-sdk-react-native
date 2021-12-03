import { Routes } from '../constants/url';

export const resumePayment = async (req: any) => {
  const url = Routes.resume;
  const body = JSON.stringify(req);

  console.log('create payment request body', body);

  const headers = { 'Content-Type': 'application/json' };
  const method = 'post';
  const reqOptions = { method, headers, body };

  const response = await fetch(url, reqOptions);

  if (response.status >= 200 && response.status < 300) {
    const parsedResponse = await response.json();
    console.log('create payment response:', parsedResponse);
    return parsedResponse;
  } else {
    throw 'resume payment failed!';
  }
};
