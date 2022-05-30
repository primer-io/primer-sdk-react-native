import type { PaymentInstrumentToken } from './models/payment-instrument-token';
import type { IPrimer } from './models/primer';
import type { IPrimerConfig } from './models/primer-config';
import type { PrimerPaymentMethodIntent } from './models/primer-intent';
import type { PrimerResumeHandler } from './models/primer-request';
import RNPrimer, { IPrimerError } from './RNPrimer';

const resumeHandler: PrimerResumeHandler = {
  handleNewClientToken: async (clientToken) => {
    try {
      await RNPrimer.handleNewClientToken(clientToken);
    } catch (err) {
      let primerError: IPrimerError;
      if (err instanceof Error) {
        primerError = {
          errorId: "react-native-bridge",
          errorDescription: err.message
        }
      } else {
        primerError = {
          errorId: "react-native-bridge",
          errorDescription: "unknown error"
        }
      }
      await RNPrimer.handleError(primerError);
    }
  },
  handleError: async (err) => {
    try {
      const primerError: IPrimerError = {
        errorId: "react-native",
        errorDescription: err.message
      }
      await RNPrimer.handleError(primerError);
    } catch (err) {
      let primerError: IPrimerError;
      if (err instanceof Error) {
        primerError = {
          errorId: "react-native-bridge",
          errorDescription: err.message
        }
      } else {
        primerError = {
          errorId: "react-native-bridge",
          errorDescription: "unknown error"
        }
      }
      await RNPrimer.handleError(primerError);
    }
  },
  handleSuccess: async () => {
    try {
      await RNPrimer.handleSuccess();
    } catch (err) {
      let primerError: IPrimerError;
      if (err instanceof Error) {
        primerError = {
          errorId: "react-native-bridge",
          errorDescription: err.message
        }
      } else {
        primerError = {
          errorId: "react-native-bridge",
          errorDescription: "unknown error"
        }
      }
      await RNPrimer.handleError(primerError);
    }
  }
}

export interface IClientSessionAction {
  type:
  | 'SELECT_PAYMENT_METHOD'
  | 'UNSELECT_PAYMENT_METHOD'
  | 'SET_BILLING_ADDRESS';
  params?: IActionParams;
}

interface IActionParams {
  billingAddress: Record<string, string | null>;
  paymentMethodType?: string;
  binData?: IBinData;
}

interface IBinData {
  network: string;
}

export const PrimerNativeMapping: IPrimer = {

  showUniversalCheckout(clientToken: string, config: IPrimerConfig): void {
    RNPrimer.removeAllListeners();

    RNPrimer.configure(config.settings || null, config.theme || null);

    let implementedRNCallbacks: any = {
      isTokenAddedToVaultImplemented: (config.onVaultSuccess !== undefined),
      isOnResumeSuccessImplemented: (config.onResumeSuccess !== undefined),
      isOnResumeErrorImplemented: (config.onError !== undefined),
      isOnCheckoutDismissedImplemented: (config.onDismiss !== undefined),
      isCheckoutFailedImplemented: (config.onError !== undefined),
      isClientSessionActionsImplemented: (config.onClientSessionActions !== undefined)
    };

    RNPrimer.setImplementedRNCallbacks(implementedRNCallbacks)
      .then(() => {
        RNPrimer.addListener('onClientSessionActions', data => {
          const clientSessionActions: IClientSessionAction[] = data;
          if (config.onClientSessionActions) {
            config.onClientSessionActions(clientSessionActions, resumeHandler);
          }
        });

        RNPrimer.addListener('onTokenizeSuccessCallback', data => {
          const paymentInstrumentToken: PaymentInstrumentToken = data;
          if (config.onTokenizeSuccess) {
            config.onTokenizeSuccess(paymentInstrumentToken, resumeHandler);
          }
        });

        RNPrimer.addListener('onResumeSuccess', data => {
          const resumeToken: string = data.resumeToken;
          if (config.onResumeSuccess) {
            config.onResumeSuccess(resumeToken, resumeHandler);
          }
        });

        RNPrimer.addListener('onCheckoutDismissed', _ => {
          if (config.onDismiss) {
            config.onDismiss();
          }

          RNPrimer.removeAllListeners();
        });

        RNPrimer.addListener('onError', data => {
          const err: IPrimerError = data.error;
          if (config.onError) {
            config.onError(err, resumeHandler);
          }
        });

        RNPrimer.showUniversalCheckout(clientToken);
      })
      .catch(err => {
        console.error(err);
      })
  },

  showVaultManager(clientToken: string, config: IPrimerConfig): void {
    RNPrimer.removeAllListeners();

    RNPrimer.configure(config.settings || null, config.theme || null);

    let implementedRNCallbacks: any = {
      isTokenAddedToVaultImplemented: (config.onVaultSuccess !== undefined),
      isOnResumeSuccessImplemented: (config.onResumeSuccess !== undefined),
      isOnResumeErrorImplemented: (config.onError !== undefined),
      isOnCheckoutDismissedImplemented: (config.onDismiss !== undefined),
      isCheckoutFailedImplemented: (config.onError !== undefined),
      isClientSessionActionsImplemented: (config.onClientSessionActions !== undefined)
    };

    RNPrimer.setImplementedRNCallbacks(implementedRNCallbacks)
      .then((() => {
        RNPrimer.addListener('onVaultSuccess', data => {
          const paymentInstrumentToken: PaymentInstrumentToken = data;
          if (config.onVaultSuccess) {
            config.onVaultSuccess(paymentInstrumentToken);
          }
        });

        RNPrimer.addListener('onClientSessionActions', data => {
          const clientSessionActions: IClientSessionAction[] = data;
          if (config.onClientSessionActions) {
            config.onClientSessionActions(clientSessionActions, resumeHandler);
          }
        });

        RNPrimer.addListener('onTokenizeSuccessCallback', data => {
          const paymentInstrumentToken: PaymentInstrumentToken = data;
          if (config.onTokenizeSuccess) {
            config.onTokenizeSuccess(paymentInstrumentToken, resumeHandler);
          }
        });

        RNPrimer.addListener('onResumeSuccess', data => {
          const resumeToken: string = data.resumeToken;
          if (config.onResumeSuccess) {
            config.onResumeSuccess(resumeToken, resumeHandler);
          }
        });

        RNPrimer.addListener('onCheckoutDismissed', _ => {
          if (config.onDismiss) {
            config.onDismiss();
          }

          RNPrimer.removeAllListeners();
        });

        RNPrimer.addListener('onError', data => {
          const err: IPrimerError = data.error;
          if (config.onError) {
            config.onError(err, resumeHandler);
          }
        });

        RNPrimer.showVaultManager(clientToken);
      }))
      .catch(err => {
        console.error(err);
      })
  },

  showPaymentMethod(
    clientToken: string,
    intent: PrimerPaymentMethodIntent,
    config: IPrimerConfig
  ): void {
    RNPrimer.removeAllListeners();

    if (config.settings || config.theme) {
      RNPrimer.configure(config.settings || null, config.theme || null);
    }

    let implementedRNCallbacks: any = {
      isTokenAddedToVaultImplemented: (config.onVaultSuccess !== undefined),
      isOnResumeSuccessImplemented: (config.onResumeSuccess !== undefined),
      isOnResumeErrorImplemented: (config.onError !== undefined),
      isOnCheckoutDismissedImplemented: (config.onDismiss !== undefined),
      isCheckoutFailedImplemented: (config.onError !== undefined),
      isClientSessionActionsImplemented: (config.onClientSessionActions !== undefined)
    };

    RNPrimer.setImplementedRNCallbacks(implementedRNCallbacks)
      .then(() => {
        RNPrimer.addListener('onVaultSuccess', data => {
          const paymentInstrumentToken: PaymentInstrumentToken = data;
          if (config.onVaultSuccess) {
            config.onVaultSuccess(paymentInstrumentToken);
          }
        });

        RNPrimer.addListener('onClientSessionActions', data => {
          const clientSessionActions: IClientSessionAction[] = data;
          if (config.onClientSessionActions) {
            config.onClientSessionActions(clientSessionActions, resumeHandler);
          }
        });

        RNPrimer.addListener('onTokenizeSuccessCallback', data => {
          const paymentInstrumentToken: PaymentInstrumentToken = data;
          if (config.onTokenizeSuccess) {
            config.onTokenizeSuccess(paymentInstrumentToken, resumeHandler);
          }
        });

        RNPrimer.addListener('onResumeSuccess', data => {
          const resumeToken: string = data.resumeToken;
          if (config.onResumeSuccess) {
            config.onResumeSuccess(resumeToken, resumeHandler);
          }
        });

        RNPrimer.addListener('onCheckoutDismissed', _ => {
          if (config.onDismiss) {
            config.onDismiss();
          }

          RNPrimer.removeAllListeners();
        });

        RNPrimer.addListener('onError', data => {
          const err: IPrimerError = data.error;
          if (config.onError) {
            config.onError(err, resumeHandler);
          }
        });

        RNPrimer.showPaymentMethod(clientToken, intent.paymentMethod, intent.vault === true ? "vault" : "checkout");
      })
      .catch(err => {
        console.error(err);
      })
  },

  dispose(): void {
    RNPrimer.removeAllListeners();
    RNPrimer.dispose();
  },

};
