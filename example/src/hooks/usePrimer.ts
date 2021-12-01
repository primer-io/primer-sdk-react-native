import { useEffect, useState } from 'react';
import { Primer } from '@primer-io/react-native';
import { fetchClientToken } from '../api/fetch-client-token';
import type { PrimerSettings } from 'src/models/primer-settings';
import type { PaymentInstrumentToken } from 'src/models/payment-instrument-token';
import type {
  OnSavedPaymentInstrumentsFetchedCallback,
  OnTokenizeSuccessCallback,
} from 'src/models/primer-callbacks';
import { createPayment } from '../api/create-payment';

export const usePrimer = (
  settings: PrimerSettings,
  environment: 'dev' | 'staging' | 'sandbox' | 'production',
  customerId: string,
  mode: string
) => {
  const [token, setToken] = useState<String | null>(null);
  const [paymentToken, setPaymentToken] = useState<String | null>(null);

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
    let isSubscribed = true;
    fetchClientToken(
      environment,
      customerId,
      settings.order!.countryCode!
    ).then((t) => {
      if (isSubscribed) {
        setToken(t);
        const config = {
          settings,
          onSavedPaymentInstrumentsFetched,
        };
        Primer.fetchSavedPaymentInstruments(t, config);
        setLoading(false);
      }
    });

    return () => {
      isSubscribed = false;
    };
  }, [settings, environment, customerId]);

  const showAlert = (t: PaymentInstrumentToken) =>
    setPaymentToken(`Got token!\n${JSON.stringify(t)}`);

  const presentPrimer = () => {
    if (!token) return;

    const onTokenizeSuccess: OnTokenizeSuccessCallback = async (t, handler) => {
      showAlert(t);

      const newClientToken: string = await createPayment(
        'sandbox',
        t.token,
        settings.customer!.id!,
        settings.order!.countryCode!,
        settings.order!.amount!,
        settings.order!.currency!
      );

      handler.resumeWithSuccess(newClientToken);
    };

    const onResumeSuccess: OnTokenizeSuccessCallback = async (t, handler) => {
      console.log('new token: ', t.token);
      handler.resumeWithSuccess(t.token);
    };

    const config = { settings, onTokenizeSuccess, onResumeSuccess };

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
    paymentToken,
  };
};
