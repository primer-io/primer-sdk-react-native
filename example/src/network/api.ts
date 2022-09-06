import axios from 'axios';
import { getEnvironmentStringVal } from './Environment';
import { appPaymentParameters, IClientSessionActionsRequestBody, IClientSessionRequestBody } from '../models/IClientSessionRequestBody';
import type { IPayment } from '../models/IPayment';
import { APIVersion, getAPIVersionStringVal } from './APIVersion';

const baseUrl = 'https://us-central1-primerdemo-8741b.cloudfunctions.net/api';

let staticHeaders = {
    'Content-Type': 'application/json',
    'environment': getEnvironmentStringVal(appPaymentParameters.environment),
    'X-Api-Key': 'e1c595f6-83fe-4646-9830-85c92b467488'
}

export const createClientSession = async () => {
    const url = baseUrl + '/client-session';
    const headers = {
        ...staticHeaders,
        'X-Api-Version': getAPIVersionStringVal(APIVersion.v3),
    };

    try {
        console.log('\n\n');
        console.log(`REQUEST:\n ${url}`);
        console.log(`HEADERS:`);
        console.log(headers);
        console.log(`BODY:`);
        console.log(appPaymentParameters.clientSessionRequestBody);
        //@ts-ignore
        const response = await axios.post(url, appPaymentParameters.clientSessionRequestBody, { headers: headers });
        console.log('\n\n');
        console.log(`RESPONSE:\n [${response.status}] ${url}`);
        console.log(`BODY:`);
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
}

export const setClientSessionActions = async (body: IClientSessionActionsRequestBody) => {
    const url = baseUrl + '/client-session/actions';
    const headers = { ...staticHeaders, 'X-Api-Version': '2021-10-19' };

    try {
        console.log('\n\n');
        console.log(`REQUEST:\n ${url}`);
        console.log(`HEADERS:`);
        console.log(headers);
        console.log(`BODY:`);
        console.log(body);
        //@ts-ignore
        const response = await axios.post(url, body, { headers: headers });
        console.log('\n\n');
        console.log(`RESPONSE:\n [${response.status}] ${url}`);
        console.log(`BODY:`);
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
}

export const createPayment = async (paymentMethodToken: string) => {
    const url = baseUrl + '/payments';
    const headers = { ...staticHeaders, 'X-Api-Version': '2021-09-27' };

    const body = { paymentMethodToken: paymentMethodToken };
    try {
        console.log('\n\n');
        console.log(`REQUEST:\n ${url}`);
        console.log(`HEADERS:`);
        console.log(headers);
        console.log(`BODY:`);
        console.log(body);
        //@ts-ignore
        const response = await axios.post(url, body, { headers: headers });
        console.log('\n\n');
        console.log(`RESPONSE:\n [${response.status}] ${url}`);
        console.log(`BODY:`);
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
    const headers = { ...staticHeaders, 'X-Api-Version': '2021-09-27' };

    const body = { resumeToken: resumeToken };

    try {
        console.log('\n\n');
        console.log(`REQUEST:\n ${url}`);
        console.log(`HEADERS:`);
        console.log(headers);
        console.log(`BODY:`);
        console.log(body);
        //@ts-ignore
        const response = await axios.post(url, body, { headers: headers });
        console.log('\n\n');
        console.log(`RESPONSE:\n [${response.status}] ${url}`);
        console.log(`BODY:`);
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
}
