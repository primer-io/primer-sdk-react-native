import { NativeEventEmitter, NativeModules } from "react-native";
import type { PrimerSettings } from "src/models/primer-settings";

const { PrimerHeadlessUniversalCheckout } = NativeModules;

export interface PaymentMethodsTypes {
    paymentMethodTypes: string[];
}

export class PrimerHUC {

    tokenizationSucceeded: undefined | ((paymentMethod: any) => void);
   
    constructor() {
        const eventEmitter = new NativeEventEmitter(PrimerHeadlessUniversalCheckout);
        const preparationStartedListener = eventEmitter.addListener('preparationStarted', (data) => {
          console.log("preparationStarted");
        });
    
        const clientSessionDidSetUpSuccessfullyListener = eventEmitter.addListener('clientSessionDidSetUpSuccessfully', (data) => {
          console.log("clientSessionDidSetUpSuccessfully");
        });
    
        const paymentMethodPresentedListener = eventEmitter.addListener('paymentMethodPresented', (data) => {
          console.log("paymentMethodPresented");
        });
    
        const tokenizationStartedListener = eventEmitter.addListener('tokenizationStarted', (data) => {
          console.log("tokenizationStarted");
        });
    
        const tokenizationSucceededListener = eventEmitter.addListener('tokenizationSucceeded', (data) => {
            console.log(`tokenizationSucceeded: ${JSON.stringify(data)}`);
            const paymentMethodToken = JSON.parse(data["paymentMethodToken"]);

            if (this.tokenizationSucceeded) {
                this.tokenizationSucceeded(paymentMethodToken);
            }
        });
    
        const resumeListener = eventEmitter.addListener('resume', (data) => {
          console.log("resume");
        });
    
        const errorListener = eventEmitter.addListener('error', (data) => {
          console.log(`error: ${JSON.stringify(data)}`);
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

}