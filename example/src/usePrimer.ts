import { useEffect, useState } from 'react';
import { Primer } from '@primer-io/react-native';
import type { IPrimerTheme } from 'src/models/primer-theme';
import type { IPrimerSettings } from 'src/models/primer-settings';

const fetchClientToken = async () => {
  const root = 'https://us-central1-primerdemo-8741b.cloudfunctions.net';

  const url = root + '/clientToken';

  const body = JSON.stringify({
    environment: 'staging',
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
    Primer.init(token, {
      settings,
      theme,
      onTokenizeSuccess: (data, callback) => {
        console.log('payment instrument token:', data);
        callback({ intent: 'showError', token });
      },
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
