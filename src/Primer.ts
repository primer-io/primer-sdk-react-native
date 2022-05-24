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

let primerSettings: PrimerSettings | undefined;

const configureCallbackListeners = async (): Promise<void> => {
  try {
    RNPrimer.removeAllListeners();

    let implementedRNCallbacks: any = {
      onCheckoutComplete: primerSettings?.onCheckoutComplete !== undefined,
      onBeforePaymentCreate:
        primerSettings?.onBeforePaymentCreate !== undefined,
      onBeforeClientSessionUpdate:
        primerSettings?.onBeforeClientSessionUpdate !== undefined,
      onClientSessionUpdate:
        primerSettings?.onClientSessionUpdate !== undefined,
      onTokenizeSuccess: primerSettings?.onTokenizeSuccess !== undefined,
      onResumeSuccess: primerSettings?.onResumeSuccess !== undefined,
      onDismiss: primerSettings?.onDismiss !== undefined,
      onCheckoutFail: primerSettings?.onCheckoutFail !== undefined,
    };

    await RNPrimer.setImplementedRNCallbacks(implementedRNCallbacks);

    if (implementedRNCallbacks.primerDidCompleteCheckoutWithData) {
      RNPrimer.addListener('onCheckoutComplete', (data) => {
        if (primerSettings && primerSettings.onCheckoutComplete) {
          const checkoutData: PrimerCheckoutData = data;
          primerSettings.onCheckoutComplete(checkoutData);
        }
      });
    }

    if (implementedRNCallbacks.primerWillCreatePaymentWithData) {
      RNPrimer.addListener('onBeforePaymentCreate', (data) => {
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
      RNPrimer.addListener('onBeforeClientSessionUpdate', (_) => {
        if (primerSettings && primerSettings.onBeforeClientSessionUpdate) {
          primerSettings.onBeforeClientSessionUpdate();
        }
      });
    }

    if (implementedRNCallbacks.primerClientSessionDidUpdate) {
      RNPrimer.addListener('onClientSessionUpdate', (data) => {
        if (primerSettings && primerSettings.onClientSessionUpdate) {
          const clientSession: PrimerClientSession = data;
          primerSettings.onClientSessionUpdate(clientSession);
        }
      });
    }

    if (implementedRNCallbacks.primerDidTokenizePaymentMethod) {
      RNPrimer.addListener('onTokenizeSuccess', (data) => {
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
      RNPrimer.addListener('onResumeSuccess', (resumeToken) => {
        if (primerSettings && primerSettings.onResumeSuccess) {
          primerSettings.onResumeSuccess(resumeToken, resumeHandler);
        }
      });
    }

    if (implementedRNCallbacks.primerDidDismiss) {
      RNPrimer.addListener('onDismiss', (_) => {
        if (primerSettings && primerSettings.onDismiss) {
          primerSettings.onDismiss();
        }
      });
    }

    if (implementedRNCallbacks.primerDidFailWithError) {
      RNPrimer.addListener('onCheckoutFail', (data) => {
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
  } catch (err) {
    throw new Error(err);
  }
};

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
        await configureCallbackListeners();

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
        await configureCallbackListeners();

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
        await configureCallbackListeners();

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
