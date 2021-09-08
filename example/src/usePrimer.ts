import { useEffect, useState } from 'react';
import { Primer } from '@primer-io/react-native';
import { fetchClientToken } from './fetch-client-token';
import type { IPrimerSettings } from 'src/models/primer-settings';
import type { IPrimerTheme } from 'src/models/primer-theme';
import type { PaymentInstrumentToken } from 'src/models/payment-instrument-token';

export function usePrimer() {
  const [token, setToken] = useState<String | null>(null);
  const [
    paymentInstrument,
    setPaymentInstrument,
  ] = useState<PaymentInstrumentToken | null>();
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

    const settings: IPrimerSettings = {
      order: {
        amount: 8000,
        currency: 'GBP',
        countryCode: 'SE',
      },
    };

    const theme: IPrimerTheme = {
      // colors: {
      //   background: {
      //     red: 255,
      //     green: 100,
      //     blue: 100,
      //     alpha: 255,
      //   },
      // },
    };

    Primer.configure({
      settings,
      theme,
      onTokenizeSuccess: async (i) => {
        setPaymentInstrument(i);
        return { intent: 'showSuccess' };
      },
      onTokenAddedToVault: (i) => setPaymentInstrument(i),
      onDismiss: () => {
        Primer.fetchSavedPaymentInstruments(token, (data) => {
          console.log('payment methods:', data);
        });
      },
    });

    Primer.showUniversalCheckout(token);
  };

  return {
    presentPrimer,
    loading,
    paymentInstrument,
  };
}
