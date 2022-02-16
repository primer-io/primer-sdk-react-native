import { useEffect, useState } from 'react';
import { Primer } from '@primer-io/react-native';
import { createClientSession } from '../api/client-session';
import type { PrimerSettings } from 'src/models/primer-settings';
import type {
  OnClientSessionActionsCallback,
  OnTokenizeSuccessCallback,
} from 'src/models/primer-callbacks';
import { createPayment } from '../api/create-payment';
import { postAction } from '../api/actions';
import { resumePayment } from '../api/resume-payment';

const ERROR_MESSAGE = 'payment failed, please try again!';

let paymentId: string | null = null;

export const usePrimer = (
  settings: PrimerSettings,
  customerId: string,
  mode: string
) => {
  const [token, setToken] = useState<string | null>(null);

  // const [paymentSavedInstruments, setSavedPaymentInstruments] = useState<
  //   PaymentInstrumentToken[]
  // >([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🐠 mount usePrimer');
    let isSubscribed = true;
    createClientSession(customerId, settings).then((session) => {
      if (isSubscribed) {
        setToken(session.clientToken);
        setLoading(false);
      }
    });

    return () => {
      isSubscribed = false;
      console.log('🐠 unmount usePrimer');
    };
  }, [settings, customerId, mode]);

  const presentPrimer = () => {
    if (!token) throw Error('client token is null!');

    const onTokenizeSuccess: OnTokenizeSuccessCallback = (req, res) =>
      createPayment(req.token)
        .then((payment) => {
          // https://primer.io/docs/api/#section/API-Usage-Guide/Payment-Status
          if (payment.status in ['FAILED', 'DECLINED', 'CANCELLED']) {
            console.log('❌ payment error');
            res.handleError(ERROR_MESSAGE);
          } else if (payment.requiredAction?.name != null) {
            console.log('paymentId:', payment.id);
            paymentId = payment.id;
            res.handleNewClientToken(payment.requiredAction.clientToken);
          } else {
            res.handleSuccess();
          }
        })
        .catch((_) => res.handleError(ERROR_MESSAGE));

    const onResumeSuccess: OnTokenizeSuccessCallback = (req, res) => {
      console.log('✈️ paymentId', paymentId);
      resumePayment(paymentId!, {
        resumeToken: req,
      })
        .then((payment) => {
          if (
            payment.status in ['FAILED', 'DECLINED', 'CANCELLED', 'PENDING']
          ) {
            console.error('❌ resume payment error');
            res.handleError(ERROR_MESSAGE);
          } else {
            console.log('🔥 resume payment success');
            res.handleSuccess();
          }
        })
        .catch((_) => {
          console.error('❌ resume payment error thrown');
          res.handleError(ERROR_MESSAGE);
        });
    };

    // const onClientSessionActions: OnClientSessionActionsCallback = async (
    //   clientSessionActionsRequest,
    //   handler
    // ) => {
    //   try {
    //     const newClientToken: string = await postAction(
    //       clientSessionActionsRequest,
    //       token
    //     );
    //     console.log(
    //       'calling handleNewClientToken from action:',
    //       newClientToken
    //     );
    //     handler.handleNewClientToken(newClientToken);
    //   } catch (error) {
    //     handler.handleError(ERROR_MESSAGE);
    //   }
    // };

    const config = {
      settings,
      onTokenizeSuccess,
      // onClientSessionActions,
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
          { vault: false, paymentMethod: 'PAYMENT_CARD' },
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
  };
};
