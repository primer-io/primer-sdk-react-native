import RNPrimerHeadlessUniversalCheckout from './RNPrimerHeadlessUniversalCheckout';
import {
  PrimerCheckoutData,
  PrimerCheckoutPaymentMethodData,
  PrimerClientSession,
  PrimerError,
  PrimerPaymentCreationHandler,
  PrimerPaymentMethodTokenData,
  PrimerResumeHandler,
  PrimerSettings,
  PrimerTokenizationHandler
} from '..';
import type {
  PrimerHeadlessUniversalCheckoutStartResponse,
} from './types';

///////////////////////////////////////////
// DECISION HANDLERS
///////////////////////////////////////////

// Tokenization Handler

const tokenizationHandler: PrimerTokenizationHandler = {
  handleFailure: async (errorMessage: string) => {
    try {
      RNPrimerHeadlessUniversalCheckout.handleTokenizationFailure(errorMessage);
    } catch (err) {
      console.error(err);
    }
  },

  handleSuccess: async () => {
    try {
      RNPrimerHeadlessUniversalCheckout.handleTokenizationSuccess();
    } catch (err) {
      console.error(err);
    }
  },

  continueWithNewClientToken: async (newClientToken: string) => {
    try {
      RNPrimerHeadlessUniversalCheckout.handleTokenizationNewClientToken(newClientToken);
    } catch (err) {
      console.error(err);
    }
  }
}

// Resume Handler

const resumeHandler: PrimerResumeHandler = {
  handleFailure: async (errorMessage: string) => {
    try {
      RNPrimerHeadlessUniversalCheckout.handleResumeFailure(errorMessage);
    } catch (err) {
      console.error(err);
    }
  },

  handleSuccess: async () => {
    try {
      RNPrimerHeadlessUniversalCheckout.handleResumeSuccess();
    } catch (err) {
      console.error(err);
    }
  },

  continueWithNewClientToken: async (newClientToken: string) => {
    try {
      RNPrimerHeadlessUniversalCheckout.handleResumeWithNewClientToken(newClientToken);
    } catch (err) {
      console.error(err);
    }
  }
}

// Payment Creation Handler

const paymentCreationHandler: PrimerPaymentCreationHandler = {
  abortPaymentCreation: async (errorMessage: string) => {
    try {
      RNPrimerHeadlessUniversalCheckout.handlePaymentCreationAbort(errorMessage);
    } catch (err) {
      console.error(err);
    }
  },

  continuePaymentCreation: async () => {
    try {
      RNPrimerHeadlessUniversalCheckout.handlePaymentCreationContinue();
    } catch (err) {
      console.error(err);
    }
  }
}

let primerSettings: PrimerSettings | undefined = undefined;

async function configureListeners(): Promise<void> {
  return new Promise(async (resolve, reject) => {
    try {
      RNPrimerHeadlessUniversalCheckout.removeAllListeners();

      let implementedRNCallbacks: any = {
        onCheckoutComplete: (primerSettings?.onCheckoutComplete !== undefined),
        onBeforePaymentCreate: (primerSettings?.onBeforePaymentCreate !== undefined),
        onBeforeClientSessionUpdate: (primerSettings?.onBeforeClientSessionUpdate !== undefined),
        onClientSessionUpdate: (primerSettings?.onClientSessionUpdate !== undefined),
        onTokenizeSuccess: (primerSettings?.onTokenizeSuccess !== undefined),
        onResumeSuccess: (primerSettings?.onResumeSuccess !== undefined),
        onDismiss: false,
        onError: (primerSettings?.onError !== undefined),
        onHUCClientSessionSetup: (primerSettings?.onHUCClientSessionSetup !== undefined),
        onHUCPrepareStart: (primerSettings?.onHUCPrepareStart !== undefined),
        onHUCTokenizeStart: (primerSettings?.onHUCTokenizeStart !== undefined),
        onHUCPaymentMethodPresent: (primerSettings?.onHUCPaymentMethodPresent !== undefined),
      };

      await RNPrimerHeadlessUniversalCheckout.setImplementedRNCallbacks(implementedRNCallbacks);

      if (implementedRNCallbacks.onCheckoutComplete) {
        RNPrimerHeadlessUniversalCheckout.addListener(
          'onCheckoutComplete',
          (data) => {
            console.log('onCheckoutComplete');
            if (primerSettings && primerSettings.onCheckoutComplete) {
              const checkoutData: PrimerCheckoutData = data;
              primerSettings.onCheckoutComplete(checkoutData);
            } else {
              // Ignore!
            }
          }
        );
      }

      if (implementedRNCallbacks.onHUCPrepareStart) {
        RNPrimerHeadlessUniversalCheckout.addListener(
          'onHUCPrepareStart',
          (data) => {
            console.log('onHUCPrepareStart');
            if (primerSettings && primerSettings.onHUCPrepareStart) {
              primerSettings.onHUCPrepareStart(data.paymentMethod || 'not implemented');
            } else {
              // Ignore!
            }
          }
        );
      }

      if (implementedRNCallbacks.onHUCTokenizeStart) {
        RNPrimerHeadlessUniversalCheckout.addListener(
          'onHUCTokenizeStart',
          (data) => {
            console.log('onHUCTokenizeStart');
            if (primerSettings && primerSettings.onHUCTokenizeStart) {
              primerSettings.onHUCTokenizeStart(data.paymentMethod || 'not implemented');
            } else {
              // Ignore!
            }
          }
        );
      }

      if (implementedRNCallbacks.onHUCPaymentMethodPresent) {
        RNPrimerHeadlessUniversalCheckout.addListener(
          'onHUCPaymentMethodPresent',
          (data) => {
            console.log('onHUCPaymentMethodPresent');
            if (primerSettings && primerSettings.onHUCPaymentMethodPresent) {
              primerSettings.onHUCPaymentMethodPresent(data.paymentMethod || 'not implemented');
            } else {
              // Ignore!
            }
          }
        );
      }

      if (implementedRNCallbacks.onHUCClientSessionSetup) {
        RNPrimerHeadlessUniversalCheckout.addListener(
          'onHUCClientSessionSetup',
          (data) => {
            console.log('onHUCClientSessionSetup');
            if (primerSettings && primerSettings.onHUCClientSessionSetup) {
              primerSettings.onHUCClientSessionSetup(data.paymentMethods || ['not implemented']);
            } else {
              // Ignore!
            }
          }
        );
      }

      if (implementedRNCallbacks.onBeforePaymentCreate) {
        RNPrimerHeadlessUniversalCheckout.addListener('onBeforePaymentCreate', data => {
          if (primerSettings && primerSettings.onBeforePaymentCreate) {
            const checkoutPaymentMethodData: PrimerCheckoutPaymentMethodData = data;
            primerSettings.onBeforePaymentCreate(checkoutPaymentMethodData, paymentCreationHandler);
          }
        });
      }

      if (implementedRNCallbacks.onBeforeClientSessionUpdate) {
        RNPrimerHeadlessUniversalCheckout.addListener('onBeforeClientSessionUpdate', _ => {
          if (primerSettings && primerSettings.onBeforeClientSessionUpdate) {
            primerSettings.onBeforeClientSessionUpdate();
          }
        });
      }

      if (implementedRNCallbacks.onClientSessionUpdate) {
        RNPrimerHeadlessUniversalCheckout.addListener('onClientSessionUpdate', data => {
          if (primerSettings && primerSettings.onClientSessionUpdate) {
            const clientSession: PrimerClientSession = data;
            primerSettings.onClientSessionUpdate(clientSession);
          }
        });
      }

      if (implementedRNCallbacks.onTokenizeSuccess) {
        RNPrimerHeadlessUniversalCheckout.addListener('onTokenizeSuccess', data => {
          if (primerSettings && primerSettings.onTokenizeSuccess) {
            const paymentMethodTokenData: PrimerPaymentMethodTokenData = data;
            primerSettings.onTokenizeSuccess(paymentMethodTokenData, tokenizationHandler);
          }
        });
      }

      if (implementedRNCallbacks.onResumeSuccess) {
        RNPrimerHeadlessUniversalCheckout.addListener('onResumeSuccess', data => {
          if (primerSettings && primerSettings.onResumeSuccess && data.resumeToken) {
            primerSettings.onResumeSuccess(data.resumeToken, resumeHandler);
          }
        });
      }

      if (implementedRNCallbacks.onError) {
        RNPrimerHeadlessUniversalCheckout.addListener('onError', data => {
          if (data && data.error && data.error.errorId && primerSettings && primerSettings.onError) {
            const errorId: string = data.error.errorId;
            const description: string | undefined = data.error.description;
            const recoverySuggestion: string | undefined = data.error.recoverySuggestion;
            const primerError = new PrimerError(errorId, description || 'Unknown error', recoverySuggestion);

            if (data.checkoutData) {
              primerSettings.onError(primerError, data.checkoutData, undefined);
            } else {
              primerSettings.onError(primerError, null, undefined);
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

class PrimerHeadlessUniversalCheckoutClass {

  ///////////////////////////////////////////
  // Init
  ///////////////////////////////////////////
  constructor() {

  }

  ///////////////////////////////////////////
  // API
  ///////////////////////////////////////////
  startWithClientToken(
    clientToken: string,
    settings: PrimerSettings
  ): Promise<PrimerHeadlessUniversalCheckoutStartResponse> {
    primerSettings = settings;

    return new Promise(async (resolve, reject) => {
      try {
        await configureListeners();
        const hucResponse = await RNPrimerHeadlessUniversalCheckout.startWithClientToken(clientToken, settings);
        resolve(hucResponse);
      } catch (err) {
        reject(err);
      }
    });
  }

  async showPaymentMethod(paymentMethod: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        await RNPrimerHeadlessUniversalCheckout.showPaymentMethod(paymentMethod);
        resolve();
      } catch (err) {
        reject(err);
      }
    });
  }

  getAssetForPaymentMethod(
    paymentMethodType: string,
    assetType: 'logo' | 'icon'
  ): Promise<string> {
    return RNPrimerHeadlessUniversalCheckout.getAssetForPaymentMethod(
      paymentMethodType,
      assetType
    );
  }

  getAssetForCardNetwork(
    cardNetwork: string,
    assetType: 'logo' | 'icon'
  ): Promise<string> {
    return RNPrimerHeadlessUniversalCheckout.getAssetForCardNetwork(
      cardNetwork,
      assetType
    );
  }
}

const PrimerHeadlessUniversalCheckout = new PrimerHeadlessUniversalCheckoutClass();

export default PrimerHeadlessUniversalCheckout;
