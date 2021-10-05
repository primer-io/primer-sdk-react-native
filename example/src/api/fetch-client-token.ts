export const fetchClientToken = async (
  environment: 'dev' | 'staging' | 'sandbox' | 'production',
  customerId: string,
  country: string
) => {
  const root = 'https://us-central1-primerdemo-8741b.cloudfunctions.net';

  const url = root + '/clientToken';

  const body = JSON.stringify({
    environment,
    customerId,
    customerCountryCode: country,
  });

  const headers = { 'Content-Type': 'application/json' };

  const method = 'post';

  const reqOptions = { method, headers, body };

  const result = await fetch(url, reqOptions);

  const json = await result.json();

  console.log('client token:', json);

  return json.clientToken;
};
