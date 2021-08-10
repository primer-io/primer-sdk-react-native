import { useEffect, useState } from 'react';
import { Primer } from '@primer-io/react-native';
import type { IPrimerTheme } from 'lib/typescript/models/primer-theme';
import type { IPrimerSettings } from 'lib/typescript/models/primer-settings';

const fetchClientToken = async () => {
  const root = 'https://us-central1-primerdemo-8741b.cloudfunctions.net';

  const url = root + '/clientToken';

  const body = JSON.stringify({
    environment: 'sandbox',
    customerId: 'customer1',
    customerCountryCode: 'GB',
  });

  const headers = { 'Content-Type': 'application/json' };

  const method = 'post';

  const reqOptions = { method, headers, body };

  const result = await fetch(url, reqOptions);

  const json = await result.json();

  console.log(json);

  return json.clientToken;
};

export function usePrimer(theme: IPrimerTheme, settings: IPrimerSettings) {
  const [token, setToken] = useState<String | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClientToken().then((t) => {
      setToken(t);
      setLoading(false);
    });
    return () => {};
  }, []);

  const presentPrimer = () => {
    if (!token) return;
    Primer.configureTheme(theme);
    Primer.configureSettings(settings);
    Primer.configureOnTokenizeSuccessCallback((data) => {
      console.log('payment instrument token:', data);
      Primer.resumeWith({
        intent: 'showSuccess',
        token: token,
        metadata: {
          message: 'Successfully completed payment.',
        },
      });
    });
    Primer.configureOnDismissCallback(() => {
      console.log('dismissed!');
    });
    Primer.configureOnPrimerErrorCallback((data) => {
      console.log('error:', data);
    });
    Primer.initWith({
      intent: 'payWithAny',
      token: token,
    });
    Primer.fetchSavedPaymentInstruments((data) => {
      console.log('payment methods:', data);
    });
  };

  return {
    presentPrimer,
    loading,
  };
}
