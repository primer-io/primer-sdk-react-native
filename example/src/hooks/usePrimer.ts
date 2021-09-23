import { useEffect, useState } from 'react';
import { Primer } from '@primer-io/react-native';
import { fetchClientToken } from '../api/fetch-client-token';
import type { PrimerSettings } from 'src/models/primer-settings';
import type { PaymentInstrumentToken } from 'src/models/payment-instrument-token';
import type {
  OnSavedPaymentInstrumentsFetchedCallback,
  OnTokenizeSuccessCallback,
} from 'src/models/primer-callbacks';
import { Alert } from 'react-native';

export const usePrimer = (
  settings: PrimerSettings,
  environment: string,
  customerId: string,
  mode: string
) => {
  const [token, setToken] = useState<String | null>(null);

  const [paymentSavedInstruments, setSavedPaymentInstruments] = useState<
    PaymentInstrumentToken[]
  >([]);

  const [loading, setLoading] = useState(true);

  const onSavedPaymentInstrumentsFetched: OnSavedPaymentInstrumentsFetchedCallback = (
    data
  ) => {
    console.log('🔥🔥');
    console.log(data);
    console.log(JSON.stringify(data[1].paymentInstrumentData));
    setSavedPaymentInstruments(data);
  };

  useEffect(() => {
    fetchClientToken(
      environment,
      customerId,
      settings.order!.countryCode!
    ).then((t) => {
      setToken(t);

      const config = {
        settings,
        onSavedPaymentInstrumentsFetched,
      };

      Primer.fetchSavedPaymentInstruments(t, config);
      setLoading(false);
    });

    return () => {};
  }, [settings, environment, customerId]);

  const showAlert = (t: PaymentInstrumentToken) =>
    Alert.alert('Got token!', `${JSON.stringify(t)}`, [{ text: 'OK' }]);

  const presentPrimer = () => {
    if (!token) return;

    const onTokenizeSuccess: OnTokenizeSuccessCallback = (t, handler) => {
      showAlert(t);

      handler.resumeWithSuccess();
    };

    const config = { settings, onTokenizeSuccess };

    switch (mode) {
      case 'checkout':
        console.log('launching checkout');
        Primer.showUniversalCheckout(token, config);
        break;
      case 'vault':
        Primer.showVaultManager(token, config);
        break;
      case 'card':
        Primer.showPaymentMethod(
          token,
          { vault: false, paymentMethod: 'Card' },
          config
        );
        break;
      default:
        Primer.showUniversalCheckout(token, config);
        break;
    }
  };

  return {
    presentPrimer,
    loading,
    paymentSavedInstruments,
  };
};
