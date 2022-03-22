import type { IClientSessionAction } from 'src/Primer';
import { primer_environment } from '../constants/environment';
import { root } from '../constants/url';

export const postAction = async (
  clientSessionActions: IClientSessionAction[],
  clientToken: string
) => {
  const url = root + `/client-session/actions`;

  const headers = {
    'Content-Type': 'application/json',
    'environment': primer_environment,
  };

  const action = clientSessionActions[0];
  const type = action.type;

  let requestBody: any = {};

  switch (type) {
    case 'SELECT_PAYMENT_METHOD':
      requestBody = {
        clientToken,
        actions: [
          {
            type: 'SELECT_PAYMENT_METHOD',
            params: {
              paymentMethodType: action.params?.paymentMethodType,
            },
          },
        ],
      };

      if (action.params?.paymentMethodType == 'PAYMENT_CARD') {
        requestBody.actions[0].params.binData = action.params?.binData
      }
      break;

    case 'UNSELECT_PAYMENT_METHOD':
      requestBody = {
        clientToken,
        actions: [
          {
            type: 'UNSELECT_PAYMENT_METHOD',
          },
        ],
      };
      break;

    case 'SET_BILLING_ADDRESS':
      requestBody = {
        clientToken,
        actions: [
          {
            type: 'SET_BILLING_ADDRESS',
            params: action.params,
          },
        ],
      };
      break;

    default:
      throw new Error('unrecognised action sent from SDK!');
  }

  console.log('sending actions request:', requestBody);

  const body = JSON.stringify({
    ...requestBody,
  });

  console.log('action request:', body);

  const reqOptions = { method: 'post', headers, body };
  const result = await fetch(url, reqOptions);
  const json = await result.json();
  console.log('action response:', json);

  return json.clientToken;
};
