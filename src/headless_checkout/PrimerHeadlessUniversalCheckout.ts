import type { PaymentInstrumentToken } from 'src/models/payment-instrument-token';
import type { PrimerError } from 'src/models/primer-error';
import type { PrimerSettings } from 'src/models/primer-settings';
import NativePrimerHeadlessUniversalCheckout from './NativePrimerHeadlessUniversalCheckout';
import type {
  PrimerHeadlessUniversalCheckoutStartResponse,
  PrimerHeadlessUniversalCheckoutCallbacks,
} from './types';

class PrimerHeadlessUniversalCheckoutClass {
  private callbacks: PrimerHeadlessUniversalCheckoutCallbacks | undefined;

  ///////////////////////////////////////////
  // Init
  ///////////////////////////////////////////
  constructor() {
    this.callbacks = undefined;
    this.configureListeners();
  }

  private configureListeners() {
    NativePrimerHeadlessUniversalCheckout.addListener(
      'preparationStarted',
      () => {
        console.log('preparationStarted');
        this.callbacks?.onPreparationStarted?.();
      }
    );

    NativePrimerHeadlessUniversalCheckout.addListener(
      'paymentMethodPresented',
      () => {
        console.log('paymentMethodPresented');
        this.callbacks?.onPaymentMethodPresented?.();
      }
    );

    NativePrimerHeadlessUniversalCheckout.addListener(
      'tokenizationStarted',
      () => {
        console.log('tokenizationStarted');
        this.callbacks?.onTokenizeStart?.();
      }
    );

    NativePrimerHeadlessUniversalCheckout.addListener(
      'tokenizationSucceeded',
      (data) => {
        console.log('tokenizationSucceeded', data);

        if (data.paymentMethodToken) {
          const paymentMethodTokenObj: PaymentInstrumentToken = JSON.parse(data.paymentMethodToken);
          this.callbacks?.onTokenizeSuccess?.(paymentMethodTokenObj);
        } else {
          const err: PrimerError = {
            name: "ParseJsonFailed",
            description: "Failed to parse payment method token"
          }
          //@ts-ignore
          this.callbacks?.onFailure?.(err);
        }        
      }
    );

    NativePrimerHeadlessUniversalCheckout.addListener('resume', (data) => {
      console.log('resume', data);
      this.callbacks?.onResumeSuccess?.(data.resumeToken);
    });

    NativePrimerHeadlessUniversalCheckout.addListener('error', (data) => {
      console.log('error', data);
      this.callbacks?.onFailure?.(data.error);
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
    this.callbacks = {
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
    assetType: "logo" | "icon"
  ): Promise<string> {
    return NativePrimerHeadlessUniversalCheckout.getAssetForPaymentMethod(
      paymentMethodType,
      assetType
    );
  }

  getAssetForCardNetwork(
    cardNetwork: string,
    assetType: "logo" | "icon"
  ): Promise<string> {
    return NativePrimerHeadlessUniversalCheckout.getAssetForCardNetwork(
      cardNetwork,
      assetType
    );
  }

}

const PrimerHeadlessUniversalCheckout = new PrimerHeadlessUniversalCheckoutClass();

export default PrimerHeadlessUniversalCheckout;
