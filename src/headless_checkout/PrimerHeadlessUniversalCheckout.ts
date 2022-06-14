import type { PaymentInstrumentToken } from 'src/models/payment-instrument-token';
import type { PrimerError } from 'src/models/primer-error';
import type { PrimerSettings } from 'src/models/primer-settings';
import NativePrimerHeadlessUniversalCheckout from './NativePrimerHeadlessUniversalCheckout';
import type {
  PrimerHeadlessUniversalCheckoutStartResponse,
  PrimerHeadlessUniversalCheckoutCallbacks,
} from './types';

let callbacks: PrimerHeadlessUniversalCheckoutCallbacks | undefined;

class PrimerHeadlessUniversalCheckoutClass {

  ///////////////////////////////////////////
  // Init
  ///////////////////////////////////////////
  constructor() {

  }

  private configureListeners() {
    NativePrimerHeadlessUniversalCheckout.removeAllListeners();

    NativePrimerHeadlessUniversalCheckout.addListener(
      'preparationStarted',
      () => {
        console.log('preparationStarted');
        callbacks?.onPreparationStarted?.();
      }
    );

    NativePrimerHeadlessUniversalCheckout.addListener(
      'paymentMethodPresented',
      () => {
        console.log('paymentMethodPresented');
        callbacks?.onPaymentMethodPresented?.();
      }
    );

    NativePrimerHeadlessUniversalCheckout.addListener(
      'tokenizationStarted',
      () => {
        console.log('tokenizationStarted');
        callbacks?.onTokenizeStart?.();
      }
    );

    NativePrimerHeadlessUniversalCheckout.addListener(
      'tokenizationSucceeded',
      (data) => {
        console.log('tokenizationSucceeded', data);

        if (data.paymentMethodToken) {
          const paymentMethodTokenObj: PaymentInstrumentToken = JSON.parse(
            data.paymentMethodToken
          );
          callbacks?.onTokenizeSuccess?.(paymentMethodTokenObj);
        } else {
          const err: PrimerError = {
            name: 'ParseJsonFailed',
            description: 'Failed to parse payment method token',
          };
          //@ts-ignore
          callbacks?.onFailure?.(err);
        }
      }
    );

    NativePrimerHeadlessUniversalCheckout.addListener('resume', (data) => {
      console.log('resume', data);
      callbacks?.onResumeSuccess?.(data.resumeToken);
    });

    NativePrimerHeadlessUniversalCheckout.addListener('error', (data) => {
      console.log('error', data);
      callbacks?.onFailure?.(data.error);
    });
  }

  ///////////////////////////////////////////
  // API
  ///////////////////////////////////////////
  startWithClientToken(
    clientToken: string,
    settings: PrimerSettings & PrimerHeadlessUniversalCheckoutCallbacks
  ): Promise<PrimerHeadlessUniversalCheckoutStartResponse> {
    // Copy callback
    callbacks = {
      onPreparationStarted: settings.onPreparationStarted,
      onPaymentMethodPresented: settings.onPaymentMethodPresented,
      onTokenizeStart: settings.onTokenizeStart,
      onTokenizeSuccess: settings.onTokenizeSuccess,
      onResumeSuccess: settings.onResumeSuccess,
      onFailure: settings.onFailure,
    };

    return NativePrimerHeadlessUniversalCheckout.startWithClientToken(
      clientToken,
      settings
    );
  }

  showPaymentMethod(paymentMethod: string) {
    this.configureListeners();

    return NativePrimerHeadlessUniversalCheckout.showPaymentMethod(
      paymentMethod
    );
  }

  resumeWithClientToken(resumeToken: string) {
    return NativePrimerHeadlessUniversalCheckout.resumeWithClientToken(
      resumeToken
    );
  }

  getAssetForPaymentMethod(
    paymentMethodType: string,
    assetType: 'logo' | 'icon'
  ): Promise<string> {
    return NativePrimerHeadlessUniversalCheckout.getAssetForPaymentMethod(
      paymentMethodType,
      assetType
    );
  }

  getAssetForCardNetwork(
    cardNetwork: string,
    assetType: 'logo' | 'icon'
  ): Promise<string> {
    return NativePrimerHeadlessUniversalCheckout.getAssetForCardNetwork(
      cardNetwork,
      assetType
    );
  }
}

const PrimerHeadlessUniversalCheckout = new PrimerHeadlessUniversalCheckoutClass();

export default PrimerHeadlessUniversalCheckout;
