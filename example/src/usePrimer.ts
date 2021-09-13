import { useEffect, useState } from 'react';
import { Primer } from '@primer-io/react-native';
import { fetchClientToken } from './fetch-client-token';
import type { PrimerSettings } from 'src/models/primer-settings';
// import type { IPrimerTheme } from 'src/models/primer-theme';
import type { PaymentInstrumentToken } from 'src/models/payment-instrument-token';
import type { OnTokenizeSuccessCallback } from 'src/models/primer-callbacks';
import type { PrimerPaymentMethodIntent } from 'src/models/primer-intent';

// const theme: IPrimerTheme = {
//   colors: {
//     background: {
//       red: 255,
//       green: 100,
//       blue: 100,
//       alpha: 255,
//     },
//   },
// };

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

    const settings: PrimerSettings = {
      order: {
        amount: 8000,
        currency: 'SEK',
        countryCode: 'SE',
        items: [],
      },
      options: {
        isResultScreenEnabled: false,
        isLoadingScreenEnabled: true,
        isFullScreenEnabled: true,
        locale: 'sv-SE',
        ios: {
          merchantIdentifier: '',
        },
      },
    };

    const onTokenizeSuccess: OnTokenizeSuccessCallback = (t, handler) => {
      setPaymentInstrument(t);
      handler.resumeWithSuccess();
    };

    const config = { settings, onTokenizeSuccess };
    const intent: PrimerPaymentMethodIntent = {
      vault: false,
      paymentMethod: 'Klarna',
    };

    Primer.showPaymentMethod(token, intent, config);
    // Primer.showUniversalCheckout(token, config);
  };

  return {
    presentPrimer,
    loading,
    paymentInstrument,
  };
}
