import { NativeModules } from 'react-native';

const { PrimerRN } = NativeModules;

export interface HeadlessCheckout {
  startHeadlessCheckout: (
    clientToken: string,
    callback: (request: HeadlessCheckoutRequest) => void
  ) => void;
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
    const eventHandler = setHeadlessCheckoutCallback(callback);
    PrimerRN.startHeadlessCheckout(clientToken, eventHandler);
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
