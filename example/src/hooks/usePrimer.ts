import { useEffect, useState } from 'react';
import { createClientSession } from '../api/client-session';
import type { PrimerSettings } from 'src/models/primer-settings';
import type {
  OnClientSessionActionsCallback,
  OnClientTokenCallback,
  OnPrimerErrorCallback,
  OnTokenizeSuccessCallback,
} from 'src/models/primer-callbacks';
import { postAction } from '../api/actions';
import { resumePayment } from '../api/resume-payment';
import { Primer, PrimerConfig } from '@primer-io/react-native';
import type { PrimerResumeHandler } from 'src/models/primer-request';

let paymentId: string | null = null;

export const usePrimer = (
  settings: PrimerSettings,
  customerId: string,
  mode: string
) => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🐠 mount usePrimer');
    let isSubscribed = true;
    createClientSession(customerId).then((session) => {
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

    const onClientTokenCallback: OnClientTokenCallback = async (resumeHandler) => {
      try {
        const clientSession = await createClientSession(customerId, settings);

        if (clientSession.clientToken) {
          resumeHandler.handleNewClientToken(clientSession.clientToken);
        } else {
          resumeHandler.handleError(new Error("Failed to create client session."))
        }
      } catch (err) {
        if (err instanceof Error) {
          resumeHandler.handleError(err);
        } else {
          resumeHandler.handleError(new Error("Unknown error when "));
        }
      }
    }

    const onClientSessionActions: OnClientSessionActionsCallback = async (clientSessionActions, handler) => {
      try {
        const newClientToken: string = await postAction(
          clientSessionActions,
          token
        );

        if (handler) {
          handler.handleNewClientToken(newClientToken);
        }
        
      } catch (err) {
        if (handler) {
          if (err instanceof Error) {
            handler.handleError(err);
          } else {
            handler.handleError(new Error("Unknown Error"));
          }
        }
      }
    };

    const onTokenizeSuccess: OnTokenizeSuccessCallback = async (paymentInstrument, resumeHandler) => {
      try {
        const paymentResponse = await createPayment(paymentInstrument.token);

        // https://primer.io/docs/api/#section/API-Usage-Guide/Payment-Status
        if (['FAILED', 'DECLINED', 'CANCELLED'].includes(paymentResponse.status)) {
          console.log('❌ payment error');
          const err = new Error(`Payment failed with status: ${paymentResponse.status}`)
          resumeHandler.handleError(err);
        } else if (paymentResponse.requiredAction?.name != null) {
          console.log('paymentId:', paymentResponse.id);
          paymentId = paymentResponse.id;
          resumeHandler.handleNewClientToken(paymentResponse.requiredAction.clientToken);
        } else {
          resumeHandler.handleSuccess();
        }
      } catch (err) {
        if (err instanceof Error) {
          resumeHandler.handleError(err);
        } else {
          resumeHandler.handleError(new Error("Unknown Error"));
        }
      }
    }
      
    const onResumeSuccess = async (resumeToken: string, resumeHandler: PrimerResumeHandler) => {
      console.log('✈️ paymentId', paymentId);
      try {
        const resumePaymentResponse = await resumePayment(paymentId!, {resumeToken: resumeToken});
        if (['FAILED', 'DECLINED', 'CANCELLED'].includes(resumePaymentResponse.status)) {
          console.log('❌ payment error');
          const err = new Error(`Payment failed with status: ${resumePaymentResponse.status}`)
          resumeHandler.handleError(err);
        } else {
          console.log('🔥 resume payment success');
          resumeHandler.handleSuccess();
        }
      } catch (err) {
        if (err instanceof Error) {
          resumeHandler.handleError(err);
        } else {
          resumeHandler.handleError(new Error("Unknown Error"));
        }
      }
    };

    const onError: OnPrimerErrorCallback = async (err, handler) => {
      console.error(`Primer SDK failed with error: ${err.errorId} ${err.errorDescription || 'No description'}`);
      handler.handleError(new Error("rn test error"))
    };

    const config = {
      settings,
      onClientTokenCallback,
      onTokenizeSuccess,
      onClientSessionActions,
      onResumeSuccess,
      onError
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
