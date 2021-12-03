import type { ClientSessionActionsRequest } from 'src/models/client-session-actions-request';
import { Routes } from '../constants/url';
import { buildActionRequest } from '../models/action-request';

export const postAction = async (
  environment: 'dev' | 'staging' | 'sandbox' | 'production',
  clientSessionActionsRequest: ClientSessionActionsRequest,
  clientToken: string
) => {
  const headers = { 'Content-Type': 'application/json' };

  const request = buildActionRequest(clientSessionActionsRequest, clientToken);

  console.log('sending actions request:', request);

  const body = JSON.stringify({
    environment,
    ...request,
  });

  console.log('action request:', body);

  const reqOptions = { method: 'post', headers, body };

  const result = await fetch(Routes.actions, reqOptions);

  const json = await result.json();

  console.log('action response:', json);

  return json.clientToken;
};
