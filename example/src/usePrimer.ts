import { useEffect, useState } from 'react';
import { Primer } from '@primer-io/react-native';
import { fetchClientToken } from './fetch-client-token';
import type { IPrimerSettings } from 'src/models/primer-settings';
import type { IPrimerTheme } from 'src/models/primer-theme';
import type { PaymentInstrumentToken } from 'src/models/payment-instrument-token';

const settings: IPrimerSettings = {
  order: {
    amount: 8000,
    currency: 'GBP',
    countryCode: 'SE',
  },
  options: {
    hasDisabledSuccessScreen: false,
    isInitialLoadingHidden: false,
  },
};

const theme: IPrimerTheme = {
  colors: {
    background: {
      red: 255,
      green: 100,
      blue: 100,
      alpha: 255,
    },
  },
};

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
    Primer.showUniversalCheckout(token, {
      settings,
      theme,
      onTokenizeSuccess: (
        paymentInstrumentToken: PaymentInstrumentToken,
        callback: any
      ) => {
        setPaymentInstrument(paymentInstrumentToken);
        callback({ intent: 'showError' });
      },
      onTokenAddedToVault: (paymentInstrumentToken: PaymentInstrumentToken) => {
        setPaymentInstrument(paymentInstrumentToken);
      },
      onDismiss: () => {
        Primer.fetchSavedPaymentInstruments(token, (data) => {
          console.log('payment methods:', data);
        });
      },
    });
  };

  return {
    presentPrimer,
    loading,
    paymentInstrument,
  };
}
