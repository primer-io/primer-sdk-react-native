import type { ClientSessionActionsRequest } from 'src/models/client-session-actions-request';
import { root } from '../constants/url';
import { buildActionRequest } from '../models/action-request';

export const postAction = async (
  clientSessionActionsRequest: ClientSessionActionsRequest,
  clientToken: string
) => {
  const url = root + `/client-session/actions`;

  const headers = {
    'Content-Type': 'application/json',
    'environment': 'sandbox',
  };

  const request = buildActionRequest(clientSessionActionsRequest, clientToken);

  console.log('sending actions request:', request);

  const body = JSON.stringify({
    ...request,
  });

  console.log('action request:', body);

  const reqOptions = { method: 'post', headers, body };

  const result = await fetch(url, reqOptions);

  const json = await result.json();

  console.log('action response:', json);

  return json.clientToken;
};
