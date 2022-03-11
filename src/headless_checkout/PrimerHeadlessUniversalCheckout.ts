import type { PrimerSettings } from 'src/models/primer-settings';
import NativePrimerHeadlessUniversalCheckout from './NativePrimerHeadlessUniversalCheckout';
import type {
  PrimerError,
  PrimerHeadlessUniversalCheckoutStartResponse,
  PrimerHeadlessUniversalCheckoutCallbacks,
} from './types';

export const getAssetForPaymentMethod = (
  paymentMethodType: string,
  assetType: string
): Promise<string> =>
  NativePrimerHeadlessUniversalCheckout.getAssetForPaymentMethod(
    paymentMethodType,
    assetType
  );

export const listAvailableAssets = (): Promise<string[]> =>
  NativePrimerHeadlessUniversalCheckout.listAvailableAssets();

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
        this.callbacks?.onTokenizeSuccess?.(data.paymentMethodToken);
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
}

const PrimerHeadlessUniversalCheckout = new PrimerHeadlessUniversalCheckoutClass();

export default PrimerHeadlessUniversalCheckout;
