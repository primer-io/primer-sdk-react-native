import type { PrimerCheckoutData } from './models/PrimerCheckoutData';
import type {
  Primer as IPrimer,
  PrimerErrorHandler,
  PrimerPaymentCreationHandler,
  PrimerResumeHandler,
  PrimerTokenizationHandler,
} from './models/Primer';
import type { PrimerSessionIntent } from './models/PrimerSessionIntent';
import type { PrimerSettings } from './models/PrimerSettings';
import RNPrimer from './RNPrimer';
import type { PrimerCheckoutPaymentMethodData } from './models/PrimerCheckoutPaymentMethodData';
import type { PrimerClientSession } from './models/PrimerClientSession';
import type { PrimerPaymentMethodTokenData } from './models/PrimerPaymentMethodTokenData';
import { PrimerError } from './models/PrimerError';

///////////////////////////////////////////
// DECISION HANDLERS
///////////////////////////////////////////

// Tokenization Handler

const tokenizationHandler: PrimerTokenizationHandler = {
  handleFailure: async (errorMessage: string) => {
    try {
      RNPrimer.handleTokenizationFailure(errorMessage);
    } catch (err) {
      console.error(err);
    }
  },

  handleSuccess: async () => {
    try {
      RNPrimer.handleTokenizationSuccess();
    } catch (err) {
      console.error(err);
    }
  },

  continueWithNewClientToken: async (newClientToken: string) => {
    try {
      RNPrimer.handleTokenizationNewClientToken(newClientToken);
    } catch (err) {
      console.error(err);
    }
  },
};

// Resume Handler

const resumeHandler: PrimerResumeHandler = {
  handleFailure: async (errorMessage: string) => {
    try {
      RNPrimer.handleResumeFailure(errorMessage);
    } catch (err) {
      console.error(err);
    }
  },

  handleSuccess: async () => {
    try {
      RNPrimer.handleResumeSuccess();
    } catch (err) {
      console.error(err);
    }
  },

  continueWithNewClientToken: async (newClientToken: string) => {
    try {
      RNPrimer.handleResumeWithNewClientToken(newClientToken);
    } catch (err) {
      console.error(err);
    }
  },
};

// Payment Creation Handler

const paymentCreationHandler: PrimerPaymentCreationHandler = {
  abortPaymentCreation: async (errorMessage: string) => {
    try {
      RNPrimer.handlePaymentCreationAbort(errorMessage);
    } catch (err) {
      console.error(err);
    }
  },

  continuePaymentCreation: async () => {
    try {
      RNPrimer.handlePaymentCreationContinue();
    } catch (err) {
      console.error(err);
    }
  },
};

// Error Handler

const errorHandler: PrimerErrorHandler = {
  handleFailure: async (errorMessage: string) => {
    try {
      RNPrimer.handleErrorMessage(errorMessage || '');
    } catch (err) {
      console.error(err);
    }
  },
};

let primerSettings: PrimerSettings | undefined = undefined;

export const Primer: IPrimer = {
  ///////////////////////////////////////////
  // SDK API
  ///////////////////////////////////////////

  async configure(settings?: PrimerSettings): Promise<void> {
    primerSettings = settings;
    return new Promise(async (resolve, reject) => {
      try {
        await RNPrimer.configure(settings);
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  },

  async showUniversalCheckout(clientToken: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        RNPrimer.removeAllListeners();

        let implementedRNCallbacks: any = {
          primerDidCompleteCheckoutWithData:
            primerSettings?.onCheckoutComplete !== undefined,
          primerWillCreatePaymentWithData:
            primerSettings?.onBeforePaymentCreate !== undefined,
          primerClientSessionWillUpdate:
            primerSettings?.onBeforeClientSessionUpdate !== undefined,
          primerClientSessionDidUpdate:
            primerSettings?.onClientSessionUpdate !== undefined,
          primerDidTokenizePaymentMethod:
            primerSettings?.onTokenizeSuccess !== undefined,
          primerDidResumeWith: primerSettings?.onResumeSuccess !== undefined,
          primerDidDismiss: primerSettings?.onDismiss !== undefined,
          primerDidFailWithError: primerSettings?.onCheckoutFail !== undefined,
        };

        await RNPrimer.setImplementedRNCallbacks(implementedRNCallbacks);

        if (implementedRNCallbacks.primerDidCompleteCheckoutWithData) {
          RNPrimer.addListener('primerDidCompleteCheckoutWithData', (data) => {
            if (primerSettings && primerSettings.onCheckoutComplete) {
              const checkoutData: PrimerCheckoutData = data;
              primerSettings.onCheckoutComplete(checkoutData);
            }
          });
        }

        if (implementedRNCallbacks.primerWillCreatePaymentWithData) {
          RNPrimer.addListener('primerWillCreatePaymentWithData', (data) => {
            if (primerSettings && primerSettings.onBeforePaymentCreate) {
              const checkoutPaymentMethodData: PrimerCheckoutPaymentMethodData =
                data;
              primerSettings.onBeforePaymentCreate(
                checkoutPaymentMethodData,
                paymentCreationHandler
              );
            }
          });
        }

        if (implementedRNCallbacks.primerClientSessionWillUpdate) {
          RNPrimer.addListener('primerClientSessionWillUpdate', (_) => {
            if (primerSettings && primerSettings.onBeforeClientSessionUpdate) {
              primerSettings.onBeforeClientSessionUpdate();
            }
          });
        }

        if (implementedRNCallbacks.primerClientSessionDidUpdate) {
          RNPrimer.addListener('primerClientSessionDidUpdate', (data) => {
            if (primerSettings && primerSettings.onClientSessionUpdate) {
              const clientSession: PrimerClientSession = data;
              primerSettings.onClientSessionUpdate(clientSession);
            }
          });
        }

        if (implementedRNCallbacks.primerDidTokenizePaymentMethod) {
          RNPrimer.addListener('primerDidTokenizePaymentMethod', (data) => {
            if (primerSettings && primerSettings.onTokenizeSuccess) {
              const paymentMethodTokenData: PrimerPaymentMethodTokenData = data;
              primerSettings.onTokenizeSuccess(
                paymentMethodTokenData,
                tokenizationHandler
              );
            }
          });
        }

        if (implementedRNCallbacks.primerDidResumeWith) {
          RNPrimer.addListener('primerDidResumeWith', (resumeToken) => {
            if (primerSettings && primerSettings.onResumeSuccess) {
              primerSettings.onResumeSuccess(resumeToken, resumeHandler);
            }
          });
        }

        if (implementedRNCallbacks.primerDidDismiss) {
          RNPrimer.addListener('primerDidDismiss', (_) => {
            if (primerSettings && primerSettings.onDismiss) {
              primerSettings.onDismiss();
            }
          });
        }

        if (implementedRNCallbacks.primerDidFailWithError) {
          RNPrimer.addListener('primerDidFailWithError', (data) => {
            let recoverySuggestion: string | undefined = undefined;
            if (data.recoverySuggestion) {
              recoverySuggestion = data.recoverySuggestion;
            }
            const primerError = new PrimerError(
              data.errorId,
              data.description,
              recoverySuggestion
            );
            if (primerSettings && primerSettings.onCheckoutFail) {
              primerSettings.onCheckoutFail(primerError, errorHandler);
            }
          });
        }

        await RNPrimer.showUniversalCheckout(clientToken);
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  },

  async showVaultManager(clientToken: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        RNPrimer.removeAllListeners();

        let implementedRNCallbacks: any = {
          primerDidCompleteCheckoutWithData:
            primerSettings?.onCheckoutComplete !== undefined,
          primerWillCreatePaymentWithData:
            primerSettings?.onBeforePaymentCreate !== undefined,
          primerClientSessionWillUpdate:
            primerSettings?.onBeforeClientSessionUpdate !== undefined,
          primerClientSessionDidUpdate:
            primerSettings?.onClientSessionUpdate !== undefined,
          primerDidTokenizePaymentMethod:
            primerSettings?.onTokenizeSuccess !== undefined,
          primerDidResumeWith: primerSettings?.onResumeSuccess !== undefined,
          primerDidDismiss: primerSettings?.onDismiss !== undefined,
          primerDidFailWithError: primerSettings?.onCheckoutFail !== undefined,
        };

        await RNPrimer.setImplementedRNCallbacks(implementedRNCallbacks);

        if (implementedRNCallbacks.primerClientSessionWillUpdate) {
          RNPrimer.addListener('primerClientSessionWillUpdate', (_) => {
            if (primerSettings && primerSettings.onBeforeClientSessionUpdate) {
              primerSettings.onBeforeClientSessionUpdate();
            }
          });
        }

        if (implementedRNCallbacks.primerClientSessionDidUpdate) {
          RNPrimer.addListener('primerClientSessionDidUpdate', (data) => {
            if (primerSettings && primerSettings.onClientSessionUpdate) {
              const clientSession: PrimerClientSession = data;
              primerSettings.onClientSessionUpdate(clientSession);
            }
          });
        }

        if (implementedRNCallbacks.primerDidTokenizePaymentMethod) {
          RNPrimer.addListener('primerDidTokenizePaymentMethod', (data) => {
            if (primerSettings && primerSettings.onTokenizeSuccess) {
              const paymentMethodTokenData: PrimerPaymentMethodTokenData = data;
              primerSettings.onTokenizeSuccess(
                paymentMethodTokenData,
                tokenizationHandler
              );
            }
          });
        }

        if (implementedRNCallbacks.primerDidResumeWith) {
          RNPrimer.addListener('primerDidResumeWith', (resumeToken) => {
            if (primerSettings && primerSettings.onResumeSuccess) {
              primerSettings.onResumeSuccess(resumeToken, resumeHandler);
            }
          });
        }

        if (implementedRNCallbacks.primerDidDismiss) {
          RNPrimer.addListener('primerDidDismiss', (_) => {
            if (primerSettings && primerSettings.onDismiss) {
              primerSettings.onDismiss();
            }
          });
        }

        if (implementedRNCallbacks.primerDidFailWithError) {
          RNPrimer.addListener('primerDidFailWithError', (data) => {
            let recoverySuggestion: string | undefined;
            if (data.recoverySuggestion) {
              recoverySuggestion = data.recoverySuggestion;
            }
            const primerError = new PrimerError(
              data.errorId,
              data.description,
              recoverySuggestion
            );
            if (primerSettings && primerSettings.onCheckoutFail) {
              primerSettings.onCheckoutFail(primerError, errorHandler);
            }
          });
        }

        await RNPrimer.showVaultManager(clientToken);
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  },

  async showPaymentMethod(
    paymentMethodType: string,
    intent: PrimerSessionIntent,
    clientToken: string
  ): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        RNPrimer.removeAllListeners();

        let implementedRNCallbacks: any = {
          primerDidCompleteCheckoutWithData:
            primerSettings?.onCheckoutComplete !== undefined,
          primerWillCreatePaymentWithData:
            primerSettings?.onBeforePaymentCreate !== undefined,
          primerClientSessionWillUpdate:
            primerSettings?.onBeforeClientSessionUpdate !== undefined,
          primerClientSessionDidUpdate:
            primerSettings?.onClientSessionUpdate !== undefined,
          primerDidTokenizePaymentMethod:
            primerSettings?.onTokenizeSuccess !== undefined,
          primerDidResumeWith: primerSettings?.onResumeSuccess !== undefined,
          primerDidDismiss: primerSettings?.onDismiss !== undefined,
          primerDidFailWithError: primerSettings?.onCheckoutFail !== undefined,
        };

        await RNPrimer.setImplementedRNCallbacks(implementedRNCallbacks);

        if (implementedRNCallbacks.primerDidCompleteCheckoutWithData) {
          RNPrimer.addListener('primerDidCompleteCheckoutWithData', (data) => {
            if (primerSettings && primerSettings.onCheckoutComplete) {
              const checkoutData: PrimerCheckoutData = data;
              primerSettings.onCheckoutComplete(checkoutData);
            }
          });
        }

        if (implementedRNCallbacks.primerWillCreatePaymentWithData) {
          RNPrimer.addListener('primerWillCreatePaymentWithData', (data) => {
            if (primerSettings && primerSettings.onBeforePaymentCreate) {
              const checkoutPaymentMethodData: PrimerCheckoutPaymentMethodData =
                data;
              primerSettings.onBeforePaymentCreate(
                checkoutPaymentMethodData,
                paymentCreationHandler
              );
            }
          });
        }

        if (implementedRNCallbacks.primerClientSessionWillUpdate) {
          RNPrimer.addListener('primerClientSessionWillUpdate', (_) => {
            if (primerSettings && primerSettings.onBeforeClientSessionUpdate) {
              primerSettings.onBeforeClientSessionUpdate();
            }
          });
        }

        if (implementedRNCallbacks.primerClientSessionDidUpdate) {
          RNPrimer.addListener('primerClientSessionDidUpdate', (data) => {
            if (primerSettings && primerSettings.onClientSessionUpdate) {
              const clientSession: PrimerClientSession = data;
              primerSettings.onClientSessionUpdate(clientSession);
            }
          });
        }

        if (implementedRNCallbacks.primerDidTokenizePaymentMethod) {
          RNPrimer.addListener('primerDidTokenizePaymentMethod', (data) => {
            if (primerSettings && primerSettings.onTokenizeSuccess) {
              const paymentMethodTokenData: PrimerPaymentMethodTokenData = data;
              primerSettings.onTokenizeSuccess(
                paymentMethodTokenData,
                tokenizationHandler
              );
            }
          });
        }

        if (implementedRNCallbacks.primerDidResumeWith) {
          RNPrimer.addListener('primerDidResumeWith', (resumeToken) => {
            if (primerSettings && primerSettings.onResumeSuccess) {
              primerSettings.onResumeSuccess(resumeToken, resumeHandler);
            }
          });
        }

        if (implementedRNCallbacks.primerDidDismiss) {
          RNPrimer.addListener('primerDidDismiss', (_) => {
            if (primerSettings && primerSettings.onDismiss) {
              primerSettings.onDismiss();
            }
          });
        }

        if (implementedRNCallbacks.primerDidFailWithError) {
          RNPrimer.addListener('primerDidFailWithError', (data) => {
            let recoverySuggestion: string | undefined = undefined;
            if (data.recoverySuggestion) {
              recoverySuggestion = data.recoverySuggestion;
            }
            const primerError = new PrimerError(
              data.errorId,
              data.description,
              recoverySuggestion
            );
            if (primerSettings && primerSettings.onCheckoutFail) {
              primerSettings.onCheckoutFail(primerError, errorHandler);
            }
          });
        }

        await RNPrimer.showPaymentMethod(
          paymentMethodType,
          intent,
          clientToken
        );
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  },

  dismiss(): void {
    RNPrimer.dismiss();
  },
};
