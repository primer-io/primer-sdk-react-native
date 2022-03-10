import { NativeEventEmitter, NativeModules } from "react-native";
import type { PrimerSettings } from "src/models/primer-settings";

const { PrimerHeadlessUniversalCheckout } = NativeModules;

export interface PaymentMethodsTypes {
    paymentMethodTypes: string[];
}

export interface IPrimerError {
  errorId: string;
  description: string;
  recoverySuggestion?: string;
}

export class PrimerHUC {

    onPreparationStarted: undefined | (() => void);
    onPaymentMethodPresented: undefined | (() => void);
    onTokenizationStarted: undefined | (() => void);
    onTokenizeSuccess: undefined | ((paymentMethod: any) => void);
    onResume: undefined | ((resumeToken: string) => void);
    onFailure: undefined | ((error: IPrimerError) => void);
   
    constructor() {
        const eventEmitter = new NativeEventEmitter(PrimerHeadlessUniversalCheckout);
        const preparationStartedListener = eventEmitter.addListener('preparationStarted', (data) => {
          console.log("preparationStarted");
          if (this.onPreparationStarted) {
            this.onPreparationStarted();
          }
        });
    
        const paymentMethodPresentedListener = eventEmitter.addListener('paymentMethodPresented', (data) => {
          console.log("paymentMethodPresented");

          if (this.onPaymentMethodPresented) {
            this.onPaymentMethodPresented();
          }
        });
    
        const tokenizationStartedListener = eventEmitter.addListener('tokenizationStarted', (data) => {
          console.log("tokenizationStarted");

          if (this.onTokenizationStarted) {
            this.onTokenizationStarted();
          }
        });
    
        const tokenizationSucceededListener = eventEmitter.addListener('tokenizationSucceeded', (data) => {
            console.log(`tokenizationSucceeded: ${JSON.stringify(data)}`);
            const paymentMethodToken = JSON.parse(data["paymentMethodToken"]);

            if (this.onTokenizeSuccess) {
                this.onTokenizeSuccess(paymentMethodToken);
            }
        });
    
        const resumeListener = eventEmitter.addListener('resume', (data) => {
          console.log("resume");
          if (this.onResume && data.resumeToken) {
            this.onResume(data.resumeToken);
          }
        });
    
        const errorListener = eventEmitter.addListener('error', (data) => {
          console.log(`error: ${JSON.stringify(data)}`);

          const error: IPrimerError = data["error"];
          if (this.onFailure && error) {
            this.onFailure(error);
          }
        });
    }

    startHeadlessCheckout(clientToken: string, 
        settings: PrimerSettings,
        errorCallback: (err: Error) => void,
        completion: (paymentMethodsTypes: PaymentMethodsTypes) => void) 
    {
        PrimerHeadlessUniversalCheckout.startWithClientToken(clientToken, 
            JSON.stringify(settings), 
            (err: Error) => {
              console.error(err);
              errorCallback(err);
            },
            (paymentMethodsArr: string[]) => {
              const onClientSessionSetupSuccessfullyRequest: PaymentMethodsTypes = {
                paymentMethodTypes: paymentMethodsArr
              }
              
              completion(onClientSessionSetupSuccessfullyRequest);
            })
    }

    showPaymentMethod(paymentMethod: string) {
      PrimerHeadlessUniversalCheckout.showPaymentMethod(paymentMethod);
    }

    resumeWithToken(resumeToken: string) {
      PrimerHeadlessUniversalCheckout.resumeWithClientToken(resumeToken);
    }

    listAvailableAssets(completion: (assets: string[]) => void) {
      PrimerHeadlessUniversalCheckout.listAvailableAssets((assets: string[]) => {
        completion(assets);
      })
    }

    getAssetFor(paymentMethodType: string,
        assetType: string,
        errorCallback: (err: Error) => void,
        completion: (url: string) => void) {
        PrimerHeadlessUniversalCheckout.getAssetFor(paymentMethodType,
            assetType,
            (err: Error) => {
                errorCallback(err);
            },
            (url: string) => {
                completion(url);
            });
    }

}