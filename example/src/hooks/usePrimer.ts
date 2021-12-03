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
import { resumePayment } from '../api/resume-payment';

const ERROR_MESSAGE = 'payment failed, please try again!';

export const usePrimer = (
  settings: PrimerSettings,
  environment: 'dev' | 'staging' | 'sandbox' | 'production',
  customerId: string,
  mode: string
) => {
  const [token, setToken] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);

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

  const presentPrimer = () => {
    if (!token) return;

    const onTokenizeSuccess: OnTokenizeSuccessCallback = (req, res) =>
      createPayment(environment, req.token)
        .then((payment) => {
          // https://primer.io/docs/api/#section/API-Usage-Guide/Payment-Status
          if (payment.status in ['FAILED', 'DECLINED', 'CANCELLED']) {
            res.handleError(ERROR_MESSAGE);
          } else if (payment.requiredAction?.name != null) {
            console.log('paymentId:', payment.id);
            setPaymentId(payment.id);
            res.handleNewClientToken(payment.requiredAction.clientToken);
          } else {
            res.handleSuccess();
          }
        })
        .catch((_) => res.handleError(ERROR_MESSAGE));

    const onResumeSuccess: OnTokenizeSuccessCallback = (req, res) =>
      resumePayment({
        id: paymentId,
        resumeToken: req,
        environment: environment,
      })
        .then((payment) => {
          if (
            payment.status in ['FAILED', 'DECLINED', 'CANCELLED', 'PENDING']
          ) {
            res.handleError(ERROR_MESSAGE);
          } else {
            res.handleSuccess();
          }
        })
        .catch((_) => res.handleError(ERROR_MESSAGE));

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
  };
};
