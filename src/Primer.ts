import type { PrimerCheckoutData } from './models/PrimerCheckoutData';
import type { Primer as IPrimer, PrimerErrorHandler, PrimerPaymentCreationHandler, PrimerResumeHandler, PrimerTokenizationHandler } from './models/Primer';
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
  }
}

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
  }
}

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
  }
}

// Error Handler

const errorHandler: PrimerErrorHandler = {
  showErrorMessage: async (errorMessage: string) => {
    try {
      RNPrimer.showErrorMessage(errorMessage || "");
    } catch (err) {
      console.error(err);
    }
  }
}

let primerSettings: PrimerSettings | undefined = undefined;

async function configureListeners(): Promise<void> {
  return new Promise(async (resolve, reject) => {
    try {
      RNPrimer.removeAllListeners();

      let implementedRNCallbacks: any = {
        onCheckoutComplete: (primerSettings?.onCheckoutComplete !== undefined),
        onBeforePaymentCreate: (primerSettings?.onBeforePaymentCreate !== undefined),
        onBeforeClientSessionUpdate: (primerSettings?.onBeforeClientSessionUpdate !== undefined),
        onClientSessionUpdate: (primerSettings?.onClientSessionUpdate !== undefined),
        onTokenizeSuccess: (primerSettings?.onTokenizeSuccess !== undefined),
        onResumeSuccess: (primerSettings?.onResumeSuccess !== undefined),
        onDismiss: (primerSettings?.onDismiss !== undefined),
        onError: (primerSettings?.onError !== undefined),
      };

      await RNPrimer.setImplementedRNCallbacks(implementedRNCallbacks);

      if (implementedRNCallbacks.onCheckoutComplete) {
        RNPrimer.addListener('onCheckoutComplete', data => {
          if (primerSettings && primerSettings.onCheckoutComplete) {
            const checkoutData: PrimerCheckoutData = data;
            primerSettings.onCheckoutComplete(checkoutData);
          }
        });
      }

      if (implementedRNCallbacks.onBeforePaymentCreate) {
        RNPrimer.addListener('onBeforePaymentCreate', data => {
          if (primerSettings && primerSettings.onBeforePaymentCreate) {
            const checkoutPaymentMethodData: PrimerCheckoutPaymentMethodData = data;
            primerSettings.onBeforePaymentCreate(checkoutPaymentMethodData, paymentCreationHandler);
          }
        });
      }

      if (implementedRNCallbacks.onBeforeClientSessionUpdate) {
        RNPrimer.addListener('onBeforeClientSessionUpdate', _ => {
          if (primerSettings && primerSettings.onBeforeClientSessionUpdate) {
            primerSettings.onBeforeClientSessionUpdate();
          }
        });
      }

      if (implementedRNCallbacks.onClientSessionUpdate) {
        RNPrimer.addListener('onClientSessionUpdate', data => {
          if (primerSettings && primerSettings.onClientSessionUpdate) {
            const clientSession: PrimerClientSession = data;
            primerSettings.onClientSessionUpdate(clientSession);
          }
        });
      }

      if (implementedRNCallbacks.onTokenizeSuccess) {
        RNPrimer.addListener('onTokenizeSuccess', data => {
          if (primerSettings && primerSettings.onTokenizeSuccess) {
            const paymentMethodTokenData: PrimerPaymentMethodTokenData = data;
            primerSettings.onTokenizeSuccess(paymentMethodTokenData, tokenizationHandler);
          }
        });
      }

      if (implementedRNCallbacks.onResumeSuccess) {
        RNPrimer.addListener('onResumeSuccess', resumeToken => {
          if (primerSettings && primerSettings.onResumeSuccess) {
            primerSettings.onResumeSuccess(resumeToken, resumeHandler);
          }
        });
      }

      if (implementedRNCallbacks.onDismiss) {
        RNPrimer.addListener('onDismiss', _ => {
          if (primerSettings && primerSettings.onDismiss) {
            primerSettings.onDismiss();
          }
        });
      }

      if (implementedRNCallbacks.onError) {
        RNPrimer.addListener('onError', data => {
          if (data && data.error && data.error.errorId && primerSettings && primerSettings.onError) {
            const errorId: string = data.error.errorId;
            const description: string | undefined = data.error.description;
            const recoverySuggestion: string | undefined = data.error.recoverySuggestion;
            const primerError = new PrimerError(errorId, description || 'Unknown error', recoverySuggestion);

            if (data.checkoutData) {
              primerSettings.onError(primerError, data.checkoutData, errorHandler);
            } else {
              primerSettings.onError(primerError, null, errorHandler);
            }
          }
        });
      }

      resolve();

    } catch (err) {
      reject(err);
    }
  });
}

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
        await configureListeners();
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
        await configureListeners();
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
        await configureListeners();
        await RNPrimer.showPaymentMethod(paymentMethodType, intent, clientToken);
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  },

  dismiss(): void {
    RNPrimer.removeAllListeners();
    RNPrimer.dismiss();
  },
};
