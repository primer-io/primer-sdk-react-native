import axios from 'axios';
import { environment } from '../screens/SettingsScreen';
import { getEnvironmentStringVal } from '../models/Environment';
import { IClientSessionRequestBody } from '../models/IClientSessionRequestBody';

const baseUrl = 'https://us-central1-primerdemo-8741b.cloudfunctions.net/api';

let staticHeaders = {
    'Content-Type': 'application/json',
    'environment': getEnvironmentStringVal(environment),
}

export const createClientSession = async (body: IClientSessionRequestBody) => {
    const url = baseUrl + '/client-session';
    const headers = { ...staticHeaders, 'X-Api-Version': '2021-10-19' };

    try {
        console.log(`\nREQUEST:`);
        console.log(url);
        console.log(`\nHEADERS:`)
        console.log(headers);
        console.log(`\nBODY:`);
        console.log(body);
        console.log(`\n`);
        const response = await axios.post(url, body, { headers: headers });

        console.log(`\nRESPONSE [${response.status}]:`);
        console.log(response.data);

        if (response.status >= 200 && response.status < 300) {
            return response.data;
        } else {
            const err = new Error(`Request failed with status ${response.status}.\nBody: ${JSON.stringify(response.data)}`);
            console.error(err);
            throw err;
        }
    } catch (err) {
        console.log(err.response.data);
        console.error(err);
        throw err;
    }
}

export const createPayment = async (paymentMethodToken: string) => {
    const url = baseUrl + '/payments';
    const headers = { ...staticHeaders, 'X-Api-Version': '2021-10-19' };

    const body = { paymentMethodToken: paymentMethodToken };
    try {
        const response = await axios.post(url, body, { headers: headers });

        if (response.status >= 200 && response.status < 300) {
            return response.data;
        } else {
            const err = new Error(`Request failed with status ${response.status}.\nBody: ${JSON.stringify(response.data)}`);
            console.error(err);
            throw err;
        }
    } catch (err) {
        console.error(err);
        throw err;
    }
};

export const resumePayment = async (paymentId: string, resumeToken: string) => {
    const url = baseUrl + `/payments/${paymentId}/resume`;
    const headers = { ...staticHeaders, 'X-Api-Version': '2021-10-19' };

    const body = { resumeToken: resumeToken };

    try {
        const response = await axios.post(url, body, { headers: headers });

        if (response.status >= 200 && response.status < 300) {
            return response.data;
        } else {
            const err = new Error(`Request failed with status ${response.status}.\nBody: ${JSON.stringify(response.data)}`);
            console.error(err);
            throw err;
        }
    } catch (err) {
        console.error(err);
        throw err;
    }
}
