import type { ClientSessionActionsRequest } from 'src/models/client-session-actions-request';
import { root, baseHeaders } from '../constants/url';
import { buildActionRequest } from '../models/action-request';

export const postAction = async (
  clientSessionActionsRequest: ClientSessionActionsRequest,
  clientToken: string
) => {
  const url = root + `/client-session/actions`;

  const headers = baseHeaders;

  const request = buildActionRequest(clientSessionActionsRequest, clientToken);

  console.log('sending actions request:', request);

  const body = JSON.stringify({
    ...request,
  });

  const method = 'post';
  const reqOptions = { method, headers, body };

  console.log(`REQUEST\n[${method.toUpperCase()}] URL: ${url}\nHeaders: ${JSON.stringify(headers)}\nBody: ${JSON.stringify(body)}\n\n`);
  const result = await fetch(url, reqOptions);

  const json = await result.json();
  console.log(`RESPONSE\n${JSON.stringify(json)}`);

  return json.clientToken;
};
