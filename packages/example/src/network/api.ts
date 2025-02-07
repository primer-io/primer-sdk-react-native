import axios from 'axios';
import { getEnvironmentStringVal } from './Environment';
import { appPaymentParameters, IClientSessionActionsRequestBody } from '../models/IClientSessionRequestBody';
import type { IPayment } from '../models/IPayment';
import { APIVersion, getAPIVersionStringVal } from './APIVersion';
import { customApiKey, customClientToken } from '../screens/SettingsScreen';

const baseUrl = 'https://us-central1-primerdemo-8741b.cloudfunctions.net/api';

const staticHeaders: { [key: string]: string } = {
  'Content-Type': 'application/json',
  //@ts-ignore
  'environment': getEnvironmentStringVal(appPaymentParameters.environment),
};

export const createClientSession = async () => {
  const url = baseUrl + '/client-session';
  const headers: { [key: string]: string } = {
    ...staticHeaders,
    //@ts-ignore
    'X-Api-Version': getAPIVersionStringVal(APIVersion.v7),
    'Legacy-Workflows': 'false',
  };

  if (customApiKey) {
    headers['X-Api-Key'] = customApiKey;
  }

  if (customClientToken) {
    return { clientToken: customClientToken };
  }

  try {
    console.log('\n\n');
    console.log(`REQUEST:\n ${url}`);
    console.log('HEADERS:');
    console.log(headers);
    console.log('BODY:');
    console.log(appPaymentParameters.clientSessionRequestBody);
    //@ts-ignore
    const response = await axios.post(url, appPaymentParameters.clientSessionRequestBody, { headers: headers });
    console.log('\n\n');
    console.log(`RESPONSE:\n [${response.status}] ${url}`);
    console.log('BODY:');
    console.log(response.data);
    console.log('\n\n');

    if (response.status >= 200 && response.status < 300) {
      return response.data;
    } else {
      const err = new Error(`Request failed with status ${response.status}.\nBody: ${JSON.stringify(response.data)}`);
      console.error(err);
      throw err;
    }
  } catch (err: any) {
    console.log(err.response.data);
    console.error(err);
    throw err;
  }
};

export const setClientSessionActions = async (body: IClientSessionActionsRequestBody) => {
  const url = baseUrl + '/client-session/actions';
  const headers: { [key: string]: string } = {
    ...staticHeaders,
    'X-Api-Version': '2.2',
  };

  if (customApiKey) {
    headers['X-Api-Key'] = customApiKey;
  }

  try {
    console.log('\n\n');
    console.log(`REQUEST:\n ${url}`);
    console.log('HEADERS:');
    console.log(headers);
    console.log('BODY:');
    console.log(body);
    //@ts-ignore
    const response = await axios.post(url, body, { headers: headers });
    console.log('\n\n');
    console.log(`RESPONSE:\n [${response.status}] ${url}`);
    console.log('BODY:');
    console.log(body);
    console.log('\n\n');

    if (response.status >= 200 && response.status < 300) {
      const clientSession = response.data;
      return clientSession;
    } else {
      const err = new Error(`Request failed with status ${response.status}.\nBody: ${JSON.stringify(response.data)}`);
      console.error(err);
      throw err;
    }
  } catch (err: any) {
    console.log(err.response.data);
    console.error(err);
    throw err;
  }
};

export const createPayment = async (paymentMethodToken: string) => {
  const url = baseUrl + '/payments';
  const headers: { [key: string]: string } = {
    ...staticHeaders,
    'X-Api-Version': '2021-09-27',
  };

  if (customApiKey) {
    headers['X-Api-Key'] = customApiKey;
  }

  const body = { paymentMethodToken: paymentMethodToken };
  try {
    console.log('\n\n');
    console.log(`REQUEST:\n ${url}`);
    console.log('HEADERS:');
    console.log(headers);
    console.log('BODY:');
    console.log(body);
    //@ts-ignore
    const response = await axios.post(url, body, { headers: headers });
    console.log('\n\n');
    console.log(`RESPONSE:\n [${response.status}] ${url}`);
    console.log('BODY:');
    console.log(body);
    console.log('\n\n');

    if (response.status >= 200 && response.status < 300) {
      const payment: IPayment = response.data;
      return payment;
    } else {
      const err = new Error(`Request failed with status ${response.status}.\nBody: ${JSON.stringify(response.data)}`);
      console.error(err);
      throw err;
    }
  } catch (err: any) {
    console.log(err.response.data);
    console.error(err);
    throw err;
  }
};

export const resumePayment = async (paymentId: string, resumeToken: string) => {
  const url = baseUrl + `/payments/${paymentId}/resume`;
  const headers: { [key: string]: string } = {
    ...staticHeaders,
    'X-Api-Version': '2021-09-27',
  };

  if (customApiKey) {
    headers['X-Api-Key'] = customApiKey;
  }

  const body = { resumeToken: resumeToken };

  try {
    console.log('\n\n');
    console.log(`REQUEST:\n ${url}`);
    console.log('HEADERS:');
    console.log(headers);
    console.log('BODY:');
    console.log(body);
    //@ts-ignore
    const response = await axios.post(url, body, { headers: headers });
    console.log('\n\n');
    console.log(`RESPONSE:\n [${response.status}] ${url}`);
    console.log('BODY:');
    console.log(body);
    console.log('\n\n');

    if (response.status >= 200 && response.status < 300) {
      return response.data;
    } else {
      const err = new Error(`Request failed with status ${response.status}.\nBody: ${JSON.stringify(response.data)}`);
      console.error(err);
      throw err;
    }
  } catch (err: any) {
    console.log(err.response.data);
    console.error(err);
    throw err;
  }
};
