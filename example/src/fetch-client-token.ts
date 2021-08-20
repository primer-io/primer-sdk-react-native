export const fetchClientToken = async () => {
  const root = 'https://us-central1-primerdemo-8741b.cloudfunctions.net';

  const url = root + '/clientToken';

  const body = JSON.stringify({
    environment: 'staging',
    customerId: 'customer1',
    customerCountryCode: 'SE',
  });

  const headers = { 'Content-Type': 'application/json' };

  const method = 'post';

  const reqOptions = { method, headers, body };

  const result = await fetch(url, reqOptions);

  const json = await result.json();

  console.log('client token:', json);

  return json.clientToken;
};
