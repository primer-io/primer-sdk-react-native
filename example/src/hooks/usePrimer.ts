import { useEffect, useState } from 'react';
import { Primer } from '@primer-io/react-native';
import { createClientSession } from '../api/client-session';
import type { PrimerSettings } from 'src/models/primer-settings';
import type {
  OnTokenizeSuccessCallback,
  OnResumeSuccessCallback
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

    const onTokenizeSuccess: OnTokenizeSuccessCallback = (paymentInstrument, resumeHandler) =>
      createPayment(paymentInstrument.token)
        .then((payment) => {
          // https://primer.io/docs/api/#section/API-Usage-Guide/Payment-Status
          if (payment.status in ['FAILED', 'DECLINED', 'CANCELLED']) {
            const err = new Error('❌ payment error');
            console.error(err);
            resumeHandler.handleError(err.message);
          } else if (payment.requiredAction?.name != null) {
            console.log('paymentId:', payment.id);
            paymentId = payment.id;
            resumeHandler.handleNewClientToken(payment.requiredAction.clientToken);
          } else {
            resumeHandler.handleSuccess();
          }
        })
        .catch(error => {
          console.error(error);
          const err = new Error('❌ payment error');
          console.error(err);
          resumeHandler.handleError(err.message);
        });

    const onResumeSuccess: OnResumeSuccessCallback = (resumeToken, resumeHandler) => {
      console.log('✈️ paymentId', paymentId);
      resumePayment(paymentId!, {
        resumeToken: resumeToken,
      })
        .then((payment) => {
          if (
            payment.status in ['FAILED', 'DECLINED', 'CANCELLED', 'PENDING']
          ) {
            const err = new Error('❌ resume payment error');
            console.error(err);
            resumeHandler.handleError(err.message);
          } else {
            console.log('🔥 resume payment success');
            resumeHandler.handleSuccess();
          }
        })
        .catch(error => {
          console.error(error);
          const err = new Error('❌ resume payment error');
          console.error(err);
          resumeHandler.handleError(err.message);
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
