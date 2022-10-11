import RNPrimerHeadlessUniversalCheckout from './RNPrimerHeadlessUniversalCheckout';
import type { PrimerCheckoutData } from '../models/PrimerCheckoutData';
import type { PrimerCheckoutAdditionalInfo } from '../models/PrimerCheckoutAdditionalInfo';
import type { PrimerCheckoutPaymentMethodData } from '../models/PrimerCheckoutPaymentMethodData';
import type { PrimerSettings } from '../models/PrimerSettings';
import type { PrimerClientSession } from '../models/PrimerClientSession';
import { PrimerError } from '../models/PrimerError';
import type { PrimerPaymentMethodTokenData } from '../models/PrimerPaymentMethodTokenData';
import type { PrimerImplementedRNCallbacks } from 'src/models/PrimerImplementedRNCallbacks';
import type { IPrimerHeadlessUniversalCheckoutPaymentMethod } from '../models/PrimerHeadlessUniversalCheckoutPaymentMethod';
import type { PrimerHeadlessUniversalCheckoutResumeHandler, PrimerPaymentCreationHandler } from 'src/models/PrimerHandlers';

///////////////////////////////////////////
// DECISION HANDLERS
///////////////////////////////////////////

// Tokenization Handler

const tokenizationHandler: PrimerHeadlessUniversalCheckoutResumeHandler = {
  continueWithNewClientToken: async (newClientToken: string) => {
    try {
      RNPrimerHeadlessUniversalCheckout.handleTokenizationNewClientToken(newClientToken);
    } catch (err) {
      console.error(err);
    }
  },
  
  complete: () => {
    RNPrimerHeadlessUniversalCheckout.handleCompleteFlow();
  }
}

// Resume Handler

const resumeHandler: PrimerHeadlessUniversalCheckoutResumeHandler = {
  continueWithNewClientToken: async (newClientToken: string) => {
    try {
      RNPrimerHeadlessUniversalCheckout.handleResumeWithNewClientToken(newClientToken);
    } catch (err) {
      console.error(err);
    }
  },

  complete: () => {
    RNPrimerHeadlessUniversalCheckout.handleCompleteFlow();
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

export let primerSettings: PrimerSettings | undefined = undefined;

async function configureListeners(): Promise<void> {
  return new Promise(async (resolve, reject) => {
    try {
      RNPrimerHeadlessUniversalCheckout.removeAllListeners();

      let implementedRNCallbacks: PrimerImplementedRNCallbacks = {
        onAvailablePaymentMethodsLoad: (primerSettings?.headlessUniversalCheckoutCallbacks?.onAvailablePaymentMethodsLoad !== undefined) || false,
        onTokenizationStart: (primerSettings?.headlessUniversalCheckoutCallbacks?.onTokenizationStart !== undefined) || false,
        onTokenizationSuccess: (primerSettings?.headlessUniversalCheckoutCallbacks?.onTokenizationSuccess !== undefined) || false,
    
        onCheckoutResume: (primerSettings?.headlessUniversalCheckoutCallbacks?.onCheckoutResume !== undefined) || false,
        onCheckoutPending: (primerSettings?.headlessUniversalCheckoutCallbacks?.onCheckoutPending !== undefined) || false,
        onCheckoutAdditionalInfo: (primerSettings?.headlessUniversalCheckoutCallbacks?.onCheckoutAdditionalInfo !== undefined) || false,
    
        onError: (primerSettings?.headlessUniversalCheckoutCallbacks?.onError !== undefined) || false,
        onCheckoutComplete: (primerSettings?.headlessUniversalCheckoutCallbacks?.onCheckoutComplete !== undefined) || false,
        onBeforeClientSessionUpdate: (primerSettings?.headlessUniversalCheckoutCallbacks?.onBeforeClientSessionUpdate !== undefined) || false,
    
        onClientSessionUpdate: (primerSettings?.headlessUniversalCheckoutCallbacks?.onClientSessionUpdate !== undefined) || false,
        onBeforePaymentCreate: (primerSettings?.headlessUniversalCheckoutCallbacks?.onBeforePaymentCreate !== undefined) || false,
        onPreparationStart: (primerSettings?.headlessUniversalCheckoutCallbacks?.onPreparationStart !== undefined) || false,
    
        onPaymentMethodShow: (primerSettings?.headlessUniversalCheckoutCallbacks?.onPaymentMethodShow !== undefined) || false,
        onDismiss: false
      };

      await RNPrimerHeadlessUniversalCheckout.setImplementedRNCallbacks(implementedRNCallbacks);

      if (implementedRNCallbacks.onAvailablePaymentMethodsLoad) {
        RNPrimerHeadlessUniversalCheckout.addListener(
          'onAvailablePaymentMethodsLoad',
          (data) => {
            if (primerSettings?.headlessUniversalCheckoutCallbacks?.onAvailablePaymentMethodsLoad) {
              const availablePaymentMethods: IPrimerHeadlessUniversalCheckoutPaymentMethod[] = data.availablePaymentMethods || [];
              primerSettings.headlessUniversalCheckoutCallbacks.onAvailablePaymentMethodsLoad(availablePaymentMethods);
            } else {
              // Ignore!
            }
          }
        );
      }

      if (implementedRNCallbacks.onPreparationStart) {
        RNPrimerHeadlessUniversalCheckout.addListener(
          'onPreparationStart',
          (data) => {
            if (primerSettings?.headlessUniversalCheckoutCallbacks?.onPreparationStart) {
              primerSettings.headlessUniversalCheckoutCallbacks.onPreparationStart(data.paymentMethodType);
            } else {
              // Ignore!
            }
          }
        );
      }

      if (implementedRNCallbacks.onBeforeClientSessionUpdate) {
        RNPrimerHeadlessUniversalCheckout.addListener(
          'onBeforeClientSessionUpdate',
          () => {
            if (primerSettings?.headlessUniversalCheckoutCallbacks?.onBeforeClientSessionUpdate) {
              primerSettings.headlessUniversalCheckoutCallbacks.onBeforeClientSessionUpdate();
            } else {
              // Ignore!
            }
          }
        );
      }

      if (implementedRNCallbacks.onClientSessionUpdate) {
        RNPrimerHeadlessUniversalCheckout.addListener(
          'onClientSessionUpdate',
          (data) => {
            if (primerSettings?.headlessUniversalCheckoutCallbacks?.onClientSessionUpdate) {
              const clientSession: PrimerClientSession = data.clientSession;
              primerSettings.headlessUniversalCheckoutCallbacks.onClientSessionUpdate(clientSession);
            } else {
              // Ignore!
            }
          }
        );
      }

      if (implementedRNCallbacks.onBeforePaymentCreate) {
        RNPrimerHeadlessUniversalCheckout.addListener(
          'onBeforePaymentCreate',
          (data) => {
            if (primerSettings?.headlessUniversalCheckoutCallbacks?.onBeforePaymentCreate) {
              const checkoutPaymentMethodData: PrimerCheckoutPaymentMethodData = data;
              primerSettings.headlessUniversalCheckoutCallbacks.onBeforePaymentCreate(checkoutPaymentMethodData, paymentCreationHandler);
            } else {
              // Ignore!
            }
          }
        );
      }

      if (implementedRNCallbacks.onTokenizationStart) {
        RNPrimerHeadlessUniversalCheckout.addListener(
          'onTokenizationStart',
          (data) => {
            if (primerSettings?.headlessUniversalCheckoutCallbacks?.onTokenizationStart) {
              primerSettings.headlessUniversalCheckoutCallbacks.onTokenizationStart(data.paymentMethodType);
            } else {
              // Ignore!
            }
          }
        );
      }

      if (implementedRNCallbacks.onPaymentMethodShow) {
        RNPrimerHeadlessUniversalCheckout.addListener(
          'onPaymentMethodShow',
          (data) => {
            if (primerSettings?.headlessUniversalCheckoutCallbacks?.onPaymentMethodShow) {
              primerSettings.headlessUniversalCheckoutCallbacks.onPaymentMethodShow(data.paymentMethodType);
            } else {
              // Ignore!
            }
          }
        );
      }

      if (implementedRNCallbacks.onTokenizationSuccess) {
        RNPrimerHeadlessUniversalCheckout.addListener(
          'onTokenizationSuccess',
          (data) => {
            if (primerSettings?.headlessUniversalCheckoutCallbacks?.onTokenizationSuccess) {
              const paymentMethodTokenData: PrimerPaymentMethodTokenData = data.paymentMethodTokenData;
              primerSettings.headlessUniversalCheckoutCallbacks.onTokenizationSuccess(paymentMethodTokenData, tokenizationHandler);
            } else {
              // Ignore!
            }
          }
        );
      }

      if (implementedRNCallbacks.onCheckoutResume) {
        RNPrimerHeadlessUniversalCheckout.addListener(
          'onCheckoutResume',
          (data) => {
            if (primerSettings?.headlessUniversalCheckoutCallbacks?.onCheckoutResume) {
              primerSettings.headlessUniversalCheckoutCallbacks.onCheckoutResume(data.resumeToken, resumeHandler);
            } else {
              // Ignore!
            }
          }
        );
      }
      
      if (implementedRNCallbacks.onCheckoutPending) {
        RNPrimerHeadlessUniversalCheckout.addListener(
          'onCheckoutPending',
          (data) => {
            if (primerSettings?.headlessUniversalCheckoutCallbacks?.onCheckoutPending) {
              const checkoutAdditionalInfo: PrimerCheckoutAdditionalInfo = data;
              primerSettings.headlessUniversalCheckoutCallbacks.onCheckoutPending(checkoutAdditionalInfo);
            } else {
              // Ignore!
            }
          }
        );
      }

      if (implementedRNCallbacks.onCheckoutAdditionalInfo) {
        RNPrimerHeadlessUniversalCheckout.addListener(
          'onCheckoutAdditionalInfo',
          (data) => {
            if (primerSettings?.headlessUniversalCheckoutCallbacks?.onCheckoutAdditionalInfo) {
              const checkoutAdditionalInfo: PrimerCheckoutAdditionalInfo = data;
              primerSettings.headlessUniversalCheckoutCallbacks.onCheckoutAdditionalInfo(checkoutAdditionalInfo);
            } else {
              // Ignore!
            }
          }
        );
      }
      
      if (implementedRNCallbacks.onCheckoutComplete) {
        RNPrimerHeadlessUniversalCheckout.addListener(
          'onCheckoutComplete',
          (data) => {
            if (primerSettings?.headlessUniversalCheckoutCallbacks?.onCheckoutComplete) {
              const checkoutData: PrimerCheckoutData = data;
              primerSettings.headlessUniversalCheckoutCallbacks.onCheckoutComplete(checkoutData);
            } else {
              // Ignore!
            }
          }
        );
      }

      if (implementedRNCallbacks.onError) {
        RNPrimerHeadlessUniversalCheckout.addListener(
          'onError',
          (data) => {
            if (primerSettings?.headlessUniversalCheckoutCallbacks?.onError) {
              if (data && data.error && data.error.errorId && primerSettings) {
                const errorId: string = data.error.errorId;
                const description: string | undefined = data.error.description;
                const recoverySuggestion: string | undefined = data.error.recoverySuggestion;
                const primerError = new PrimerError(errorId, description || 'Unknown error', recoverySuggestion);

                const checkoutData: PrimerCheckoutData = data.checkoutData;
                primerSettings.headlessUniversalCheckoutCallbacks.onError(primerError, checkoutData);
              }
            } else {
              // Ignore!
            }
          }
        );
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
  ): Promise<IPrimerHeadlessUniversalCheckoutPaymentMethod[]> {
    primerSettings = settings;

    return new Promise(async (resolve, reject) => {
      try {
        await configureListeners();
        const res = await RNPrimerHeadlessUniversalCheckout.startWithClientToken(clientToken, settings);

        if (res["availablePaymentMethods"]) {
          const availablePaymentMethods: IPrimerHeadlessUniversalCheckoutPaymentMethod[] = res["availablePaymentMethods"];
          resolve(availablePaymentMethods);
        } else {
          const err = new PrimerError("primer-rn-sdk", "Failed to find availablePaymentMethods", "Create another client session");
          reject(err);
        }
      } catch (err) {
        reject(err);
      }
    });
  }

  disposePrimerHeadlessUniversalCheckout(): Promise<void> {
    return RNPrimerHeadlessUniversalCheckout.disposePrimerHeadlessUniversalCheckout();
  }
}

export const PrimerHeadlessUniversalCheckout = new PrimerHeadlessUniversalCheckoutClass();
