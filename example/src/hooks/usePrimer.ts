import { useEffect, useState } from 'react';
import { Primer } from '@primer-io/react-native';
import { createClientSession } from '../api/client-session';
import type { PrimerSettings } from 'src/models/primer-settings';
import type { PaymentInstrumentToken } from 'src/models/payment-instrument-token';
import type {
  OnClientSessionActionsCallback,
  OnSavedPaymentInstrumentsFetchedCallback,
  OnTokenizeSuccessCallback,
} from 'src/models/primer-callbacks';
import { createPayment } from '../api/create-payment';
import { postAction } from '../api/actions';

export const usePrimer = (
  settings: PrimerSettings,
  environment: 'dev' | 'staging' | 'sandbox' | 'production',
  customerId: string,
  mode: string
) => {
  const [token, setToken] = useState<string | null>(null);

  const [paymentSavedInstruments, setSavedPaymentInstruments] = useState<
    PaymentInstrumentToken[]
  >([]);

  const [loading, setLoading] = useState(true);

  const onSavedPaymentInstrumentsFetched: OnSavedPaymentInstrumentsFetchedCallback = (
    data
  ) => {
    setSavedPaymentInstruments(data);
  };

  useEffect(() => {
    let isSubscribed = true;
    createClientSession(
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

  const presentPrimer = () => {
    if (!token) throw Error('client token is null!');

    const onTokenizeSuccess: OnTokenizeSuccessCallback = async (req, res) => {
      const newClientToken: string = await createPayment(
        environment,
        req.token
      );
      res.resumeWithSuccess(newClientToken);
    };

    const onResumeSuccess: OnTokenizeSuccessCallback = async (req, res) => {
      const newClientToken: string = await createPayment(
        environment,
        req.token
      );
      res.resumeWithSuccess(newClientToken);
    };

    const onClientSessionActions: OnClientSessionActionsCallback = async (
      clientSessionActionsRequest,
      handler
    ) => {
      try {
        const newClientToken: string = await postAction(
          environment,
          clientSessionActionsRequest,
          token
        );
        console.log('calling resume success');
        handler.resumeWithSuccess(newClientToken);
      } catch (error) {
        handler.resumeWithError('checkout failed, please close and retry.'); // this can be any message
      }
    };

    const config = {
      settings,
      onTokenizeSuccess,
      onClientSessionActions,
      onResumeSuccess,
    };

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
