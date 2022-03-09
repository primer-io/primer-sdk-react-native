import { NativeEventEmitter, NativeModules, Platform } from 'react-native';
import type { PrimerSettings } from 'src/models/primer-settings';

const { PrimerRN, PrimerHeadlessUniversalCheckout } = NativeModules;

export interface HeadlessCheckout {
  startHeadlessCheckout: (
    clientToken: string,
    callback: (request: HeadlessCheckoutRequest) => void
  ) => void;
  showPaymentMethod: (paymentMethod: string) => void;
  disposeHeadlessCheckout: () => void;
  resumeHandler: HeadlessCheckoutResumeHandler;
  validate: (callback: (isValid: boolean) => void) => void;
}

interface HeadlessCheckoutResumeHandler {
  resume: () => void;
  resumeWithClientToken: (clientToken: string) => void;
  resumeWithError: (errorDescription: string) => void;
}

type HeadlessCheckoutRequest =
  | OnClientSessionSetupSuccessfullyRequest
  | OnErrorRequest
  | OnPaymentMethodPresentedRequest
  | OnPreparationStartedRequest
  | OnResumeSuccessRequest
  | OnTokenizationStartedRequest
  | OnTokenizationSuccessRequest;

interface OnClientSessionSetupSuccessfullyRequest {
  kind: 'OnClientSessionSetupSuccessfully';
  paymentMethodTypes: string[];
}

interface OnErrorRequest {
  kind: 'OnError';
}

interface OnPaymentMethodPresentedRequest {
  kind: 'OnPaymentMethodPresented';
}

interface OnPreparationStartedRequest {
  kind: 'OnPreparationStarted';
}

interface OnResumeSuccessRequest {
  kind: 'OnPreparationStarted';
}

interface OnTokenizationStartedRequest {
  kind: 'OnTokenizationStarted';
}

interface OnTokenizationSuccessRequest {
  kind: 'OnTokenizationSuccess';
}

const setHeadlessCheckoutCallback = (
  callback: (request: HeadlessCheckoutRequest) => void
) => {
  const eventHandler = (event: string) => {
    try {
      const decodedEvent: HeadlessCheckoutRequest = JSON.parse(event);
      callback(decodedEvent);
    } catch (error) {
      console.error('failed to parse headless checkout event', error);
    }
  };
  console.log('set headless checkout callback');
  return eventHandler;
};

const headlessCheckout: HeadlessCheckout = {
  startHeadlessCheckout: (
    clientToken: string,
    callback: (request: HeadlessCheckoutRequest) => void
  ) => {
    console.log('start headless checkout');

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
      console.log("tokenizationSucceeded");
    });

    const resumeListener = eventEmitter.addListener('resume', (data) => {
      console.log("resume");
    });

    const errorListener = eventEmitter.addListener('error', (data) => {
      console.log("error");
    });

    if (Platform.OS === 'ios') {
      const settings: PrimerSettings = {
        options: {
          ios: {
            merchantIdentifier: "merchant.dx.team"
          }
        }
      }
      PrimerHeadlessUniversalCheckout.startWithClientToken(clientToken, 
        JSON.stringify(settings), 
        (err) => {
          console.error(err);
        },
        (paymentMethodsArr: string[]) => {
          const onClientSessionSetupSuccessfullyRequest: OnClientSessionSetupSuccessfullyRequest = {
            kind: 'OnClientSessionSetupSuccessfully',
            paymentMethodTypes: paymentMethodsArr
          }
          
          callback(onClientSessionSetupSuccessfullyRequest);
        })
    } else {
      const eventHandler = setHeadlessCheckoutCallback(callback);
      PrimerRN.startHeadlessCheckout(clientToken, eventHandler);
    }
  },

  showPaymentMethod: (paymentMethod: string) => {
    PrimerHeadlessUniversalCheckout.showPaymentMethod(paymentMethod);
  },

  disposeHeadlessCheckout: () => {
    PrimerRN.disposeHeadlessCheckout();
  },
  resumeHandler: {
    resume: () => PrimerRN.resumeHeadlessCheckout(null, null),
    resumeWithClientToken: (clientToken) =>
      PrimerRN.resumeHeadlessCheckout(clientToken, null),
    resumeWithError: (error) => PrimerRN.resumeHeadlessCheckout(null, error),
  },
  validate: (callback: (isValid: boolean) => void) => {
    PrimerRN.validate(callback);
  },
};

export default headlessCheckout;
