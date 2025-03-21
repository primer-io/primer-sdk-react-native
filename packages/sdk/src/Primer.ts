import type { PrimerCheckoutData } from './models/PrimerCheckoutData';
import type { PrimerSettings } from './models/PrimerSettings';
import RNPrimer from './RNPrimer';
import type { PrimerCheckoutPaymentMethodData } from './models/PrimerCheckoutPaymentMethodData';
import type { PrimerClientSession } from './models/PrimerClientSession';
import type { PrimerPaymentMethodTokenData } from './models/PrimerPaymentMethodTokenData';
import { PrimerError } from './models/PrimerError';
import type { PrimerCheckoutAdditionalInfo } from './models/PrimerCheckoutAdditionalInfo';
import type {
  PrimerErrorHandler,
  PrimerPaymentCreationHandler,
  PrimerResumeHandler,
  PrimerTokenizationHandler,
} from './models/PrimerHandlers';
import type { IPrimer } from './models/PrimerInterfaces';
import type { PrimerImplementedRNCallbacks } from './models/PrimerImplementedRNCallbacks';

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
  showErrorMessage: async (errorMessage: string) => {
    try {
      RNPrimer.showErrorMessage(errorMessage || '');
    } catch (err) {
      console.error(err);
    }
  },
};

let primerSettings: PrimerSettings | undefined;

async function configureListeners(): Promise<void> {
  return new Promise(async (resolve, reject) => {
    try {
      RNPrimer.removeAllListeners();

      let implementedRNCallbacks: PrimerImplementedRNCallbacks = {
        onAvailablePaymentMethodsLoad: false,
        onTokenizationStart: false,
        onTokenizationSuccess: primerSettings?.onTokenizeSuccess !== undefined || false,

        onCheckoutResume: primerSettings?.onResumeSuccess !== undefined || false,
        onCheckoutPending: primerSettings?.onResumePending !== undefined || false,
        onCheckoutAdditionalInfo: primerSettings?.onCheckoutReceivedAdditionalInfo !== undefined || false,

        onError: primerSettings?.onError !== undefined || false,
        onCheckoutComplete: primerSettings?.onCheckoutComplete !== undefined || false,
        onBeforeClientSessionUpdate: primerSettings?.onBeforeClientSessionUpdate !== undefined || false,

        onClientSessionUpdate: primerSettings?.onClientSessionUpdate !== undefined || false,
        onBeforePaymentCreate: primerSettings?.onBeforePaymentCreate !== undefined || false,
        onPreparationStart: false,

        onPaymentMethodShow: false,
        onDismiss: primerSettings?.onDismiss !== undefined || false,
      };

      await RNPrimer.setImplementedRNCallbacks(implementedRNCallbacks);

      if (implementedRNCallbacks.onCheckoutComplete) {
        RNPrimer.addListener('onCheckoutComplete', (data) => {
          if (primerSettings && primerSettings.onCheckoutComplete) {
            const checkoutData: PrimerCheckoutData = data;
            primerSettings.onCheckoutComplete(checkoutData);
          }
        });
      }

      if (implementedRNCallbacks.onBeforePaymentCreate) {
        RNPrimer.addListener('onBeforePaymentCreate', (data) => {
          if (primerSettings && primerSettings.onBeforePaymentCreate) {
            const checkoutPaymentMethodData: PrimerCheckoutPaymentMethodData = data;
            primerSettings.onBeforePaymentCreate(checkoutPaymentMethodData, paymentCreationHandler);
          }
        });
      }

      if (implementedRNCallbacks.onBeforeClientSessionUpdate) {
        RNPrimer.addListener('onBeforeClientSessionUpdate', (_) => {
          if (primerSettings && primerSettings.onBeforeClientSessionUpdate) {
            primerSettings.onBeforeClientSessionUpdate();
          }
        });
      }

      if (implementedRNCallbacks.onClientSessionUpdate) {
        RNPrimer.addListener('onClientSessionUpdate', (data) => {
          if (primerSettings && primerSettings.onClientSessionUpdate) {
            const clientSession: PrimerClientSession = data;
            primerSettings.onClientSessionUpdate(clientSession);
          }
        });
      }

      if (implementedRNCallbacks.onTokenizationSuccess) {
        RNPrimer.addListener('onTokenizeSuccess', (data) => {
          if (primerSettings && primerSettings.onTokenizeSuccess) {
            const paymentMethodTokenData: PrimerPaymentMethodTokenData = data;
            primerSettings.onTokenizeSuccess(paymentMethodTokenData, tokenizationHandler);
          }
        });
      }

      if (implementedRNCallbacks.onCheckoutResume) {
        RNPrimer.addListener('onResumeSuccess', (data) => {
          if (primerSettings && primerSettings.onResumeSuccess && data.resumeToken) {
            primerSettings.onResumeSuccess(data.resumeToken, resumeHandler);
          }
        });
      }

      if (implementedRNCallbacks.onCheckoutPending) {
        RNPrimer.addListener('onResumePending', (additionalInfo) => {
          if (primerSettings && primerSettings.onResumePending) {
            const checkoutAdditionalInfo: PrimerCheckoutAdditionalInfo = additionalInfo;
            primerSettings.onResumePending(checkoutAdditionalInfo);
          } else {
            // Ignore!
          }
        });
      }

      if (implementedRNCallbacks.onCheckoutAdditionalInfo) {
        RNPrimer.addListener('onCheckoutReceivedAdditionalInfo', (additionalInfo) => {
          if (primerSettings && primerSettings.onCheckoutReceivedAdditionalInfo) {
            const checkoutAdditionalInfo: PrimerCheckoutAdditionalInfo = additionalInfo;
            primerSettings.onCheckoutReceivedAdditionalInfo(checkoutAdditionalInfo);
          } else {
            // Ignore!
          }
        });
      }

      if (implementedRNCallbacks.onDismiss) {
        RNPrimer.addListener('onDismiss', (_) => {
          if (primerSettings && primerSettings.onDismiss) {
            primerSettings.onDismiss();
          }
        });
      }

      if (implementedRNCallbacks.onError) {
        RNPrimer.addListener('onError', (data) => {
          if (data && data.error && data.error.errorId && primerSettings && primerSettings.onError) {
            const errorId: string = data.error.errorId;
            const errorCode: string | undefined = data.error.errorCode;
            const description: string | undefined = data.error.description;
            const recoverySuggestion: string | undefined = data.error.recoverySuggestion;
            const diagnosticsId: string | undefined = data.error.diagnosticsId;
            const primerError = new PrimerError(
              errorId,
              errorCode,
              description || 'Unknown error',
              recoverySuggestion,
              diagnosticsId
            );
            primerSettings.onError(primerError, data.checkoutData || null, errorHandler);
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

  async showPaymentMethod(paymentMethod: string, intent: string, clientToken: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        await configureListeners();
        await RNPrimer.showPaymentMethod(paymentMethod, intent, clientToken);
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  },

  cleanUp(): void {
    RNPrimer.removeAllListeners();
    RNPrimer.dismiss();
  },

  dismiss(): void {
    RNPrimer.removeAllListeners();
    RNPrimer.dismiss();
  },
};
