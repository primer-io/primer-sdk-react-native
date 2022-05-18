import type { IPrimer } from './models/IPrimer';
import type { PrimerSessionIntent } from './models/PrimerSessionIntent';
import type { PrimerSettings } from './models/PrimerSettings';
import RNPrimer, { IPrimerError } from './RNPrimer';

// const resumeHandler: PrimerResumeHandler = {
//   handleNewClientToken: async (clientToken) => {
//     try {
//       await RNPrimer.handleNewClientToken(clientToken);
//     } catch (err) {
//       let primerError: IPrimerError;
//       if (err instanceof Error) {
//         primerError = {
//           errorId: "react-native-bridge",
//           errorDescription: err.message
//         }
//       } else {
//         primerError = {
//           errorId: "react-native-bridge",
//           errorDescription: "unknown error"
//         }
//       }
//       await RNPrimer.handleError(primerError);
//     }
//   },
//   handleError: async (err) => {
//     try {
//       const primerError: IPrimerError = {
//         errorId: "react-native",
//         errorDescription: err.message
//       }
//       await RNPrimer.handleError(primerError);
//     } catch (err) {
//       let primerError: IPrimerError;
//       if (err instanceof Error) {
//         primerError = {
//           errorId: "react-native-bridge",
//           errorDescription: err.message
//         }
//       } else {
//         primerError = {
//           errorId: "react-native-bridge",
//           errorDescription: "unknown error"
//         }
//       }
//       await RNPrimer.handleError(primerError);
//     }
//   },
//   handleSuccess: async () => {
//     try {
//       await RNPrimer.handleSuccess();
//     } catch (err) {
//       let primerError: IPrimerError;
//       if (err instanceof Error) {
//         primerError = {
//           errorId: "react-native-bridge",
//           errorDescription: err.message
//         }
//       } else {
//         primerError = {
//           errorId: "react-native-bridge",
//           errorDescription: "unknown error"
//         }
//       }
//       await RNPrimer.handleError(primerError);
//     }
//   }
// }

export const PrimerNativeMapping: IPrimer = {
  async configure(settings?: PrimerSettings): Promise<void> {
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
        RNPrimer.showUniversalCheckout(clientToken);
        resolve();
      } catch (err) {
        reject(err);
      }
    });
    // if (config.settings || config.theme) {
    //   RNPrimer.configure(config.settings || null, config.theme || null);

    //   let implementedRNCallbacks: any = {
    //     // isClientTokenCallbackImplemented: (config.onClientTokenCallback !== undefined),
    //     isTokenAddedToVaultImplemented: (config.onTokenAddedToVault !== undefined),
    //     isOnResumeSuccessImplemented: (config.onResumeSuccess !== undefined),
    //     isOnResumeErrorImplemented: (config.onError !== undefined),
    //     isOnCheckoutDismissedImplemented: (config.onDismiss !== undefined),
    //     isCheckoutFailedImplemented: (config.onError !== undefined),
    //     isClientSessionActionsImplemented: (config.onClientSessionActions !== undefined)
    //   };

    //   RNPrimer.setImplementedRNCallbacks(implementedRNCallbacks)
    //     .then(() => {
    //       RNPrimer.addListener('onClientSessionActions', data => {
    //         const clientSessionActions: IClientSessionAction[] = data;
    //         if (config.onClientSessionActions) {
    //           config.onClientSessionActions(clientSessionActions, resumeHandler);
    //         }
    //       });

    //       RNPrimer.addListener('onTokenizeSuccessCallback', data => {
    //         const paymentInstrumentToken: PaymentInstrumentToken = data;
    //         if (config.onTokenizeSuccess) {
    //           config.onTokenizeSuccess(paymentInstrumentToken, resumeHandler);
    //         }
    //       });

    //       RNPrimer.addListener('onResumeSuccess', data => {
    //         const resumeToken: string = data.resumeToken;
    //         if (config.onResumeSuccess) {
    //           config.onResumeSuccess(resumeToken, resumeHandler);
    //         }
    //       });

    //       RNPrimer.addListener('onCheckoutDismissed', _ => {
    //         if (config.onDismiss) {
    //           config.onDismiss();
    //         }
    //       });

    //       RNPrimer.addListener('onError', data => {
    //         const err: IPrimerError = data.error;
    //         if (config.onError) {
    //           config.onError(err, resumeHandler);
    //         }
    //       });

    //       RNPrimer.showUniversalCheckout(clientToken);
    //     })
    //     .catch( err => {
    //       console.error(err);
    //     })
    //   }

    // RNPrimer.addListener('onClientTokenCallback', _ => {
    //   if (config.onClientTokenCallback) {
    //     config.onClientTokenCallback(resumeHandler);
    //   }
    // });
  },

  async showVaultManager(clientToken: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        RNPrimer.removeAllListeners();
        await RNPrimer.showVaultManager(clientToken);
        resolve();
      } catch (err) {
        reject(err);
      }
    });

    // if (config.settings || config.theme) {
    //   RNPrimer.configure(config.settings || null, config.theme || null);

    //   let implementedRNCallbacks: any = {
    //     // isClientTokenCallbackImplemented: (config.onClientTokenCallback !== undefined),
    //     isTokenAddedToVaultImplemented: (config.onTokenAddedToVault !== undefined),
    //     isOnResumeSuccessImplemented: (config.onResumeSuccess !== undefined),
    //     isOnResumeErrorImplemented: (config.onError !== undefined),
    //     isOnCheckoutDismissedImplemented: (config.onDismiss !== undefined),
    //     isCheckoutFailedImplemented: (config.onError !== undefined),
    //     isClientSessionActionsImplemented: (config.onClientSessionActions !== undefined)
    //   };

    //   RNPrimer.setImplementedRNCallbacks(implementedRNCallbacks);
    // }

    // // RNPrimer.addListener('onClientTokenCallback', _ => {
    // //   if (config.onClientTokenCallback) {
    // //     config.onClientTokenCallback(resumeHandler);
    // //   }
    // // });

    // RNPrimer.addListener('onClientSessionActions', data => {
    //   const clientSessionActions: IClientSessionAction[] = data;
    //   if (config.onClientSessionActions) {
    //     config.onClientSessionActions(clientSessionActions, resumeHandler);
    //   } else {
    //     RNPrimer.handleSuccess();
    //   }
    // });

    // RNPrimer.addListener('onTokenizeSuccessCallback', data => {
    //   const paymentInstrumentToken: PaymentInstrumentToken = data;
    //   if (config.onTokenizeSuccess) {
    //     config.onTokenizeSuccess(paymentInstrumentToken, resumeHandler);
    //   }
    // });

    // RNPrimer.addListener('onResumeSuccess', data => {
    //   const resumeToken: string = data.resumeToken;
    //   if (config.onResumeSuccess) {
    //     config.onResumeSuccess(resumeToken, resumeHandler);
    //   }
    // });

    // RNPrimer.addListener('onCheckoutDismissed', () => {
    //   if (config.onDismiss) {
    //     config.onDismiss();
    //   }
    // });

    // RNPrimer.addListener('onError', data => {
    //   const err: IPrimerError = data.error;
    //   if (config.onError) {
    //     config.onError(err, resumeHandler);
    //   }
    // });
  },

  async showPaymentMethod(
    paymentMethodType: string,
    intent: PrimerSessionIntent,
    clientToken: string
  ): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        RNPrimer.removeAllListeners();
        await RNPrimer.showPaymentMethod(paymentMethodType, intent, clientToken);
        resolve();
      } catch (err) {
        reject(err);
      }
    });

    // RNPrimer.removeAllListeners();

    // if (config.settings || config.theme) {
    //   RNPrimer.configure(config.settings || null, config.theme || null);
    // }

    // let implementedRNCallbacks: any = {
    //   // isClientTokenCallbackImplemented: (config.onClientTokenCallback !== undefined),
    //   isTokenAddedToVaultImplemented: (config.onTokenAddedToVault !== undefined),
    //   isOnResumeSuccessImplemented: (config.onResumeSuccess !== undefined),
    //   isOnResumeErrorImplemented: (config.onError !== undefined),
    //   isOnCheckoutDismissedImplemented: (config.onDismiss !== undefined),
    //   isCheckoutFailedImplemented: (config.onError !== undefined),
    //   isClientSessionActionsImplemented: (config.onClientSessionActions !== undefined)
    // };

    // RNPrimer.setImplementedRNCallbacks(implementedRNCallbacks);
    // RNPrimer.showPaymentMethod(clientToken, intent.paymentMethod, intent.vault === true ? "vault" : "checkout");
  },

  dismiss(): void {
    RNPrimer.removeAllListeners();
    RNPrimer.dispose();
  },

};
