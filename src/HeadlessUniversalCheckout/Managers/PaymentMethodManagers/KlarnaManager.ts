import { NativeEventEmitter, NativeModules } from 'react-native';
import type { EmitterSubscription } from 'react-native';
import type {
  PrimerComponentDataValidationError,
  PrimerInvalidComponentData,
  PrimerValidComponentData,
  PrimerValidatingComponentData,
} from '../../../models/PrimerComponentDataValidation';
import { PrimerError } from '../../../models/PrimerError';
import type { KlarnaPaymentOptions, KlarnaPaymentValidatableData } from '../../../models/klarna/KlarnaPaymentCollectableData';
import type { KlarnaPaymentStep } from '../../../models/klarna/KlarnaPaymentSteps';
import { eventTypes } from './Utils/EventType';
import type { EventType } from './Utils/EventType';
import { PrimerSessionIntent } from '../../../models/PrimerSessionIntent';

const { RNTPrimerHeadlessUniversalCheckoutKlarnaComponent } = NativeModules;

const eventEmitter = new NativeEventEmitter(RNTPrimerHeadlessUniversalCheckoutKlarnaComponent);
export interface KlarnaManagerProps {
  primerSessionIntent: PrimerSessionIntent;
  onStep?: (data: KlarnaPaymentStep) => void;
  onError?: (error: PrimerError) => void;
  onInvalid?: (data: PrimerInvalidComponentData<KlarnaPaymentValidatableData>) => void;
  onValid?: (data: PrimerValidComponentData<KlarnaPaymentValidatableData>) => void;
  onValidating?: (data: PrimerValidatingComponentData<KlarnaPaymentValidatableData>) => void;
  onValidationError?: (data: PrimerComponentDataValidationError<KlarnaPaymentValidatableData>) => void;
}

export interface KlarnaComponent {
  /**
   * Starts the component, causing the {@link PaymentSessionCreated} step
   * to be emitted.
   */
  start(): Promise<void>;

  /**
   * Sets the options to use when initializing the Klarna payment view,
   * triggering the validation flow.
   * @param paymentOptions The options to use when initializing the Klarna
   * payment view.
   * @deprecated use handlePaymentOptionsChange function instead.
   */
  onSetPaymentOptions(paymentOptions: KlarnaPaymentOptions): Promise<void>;

  /**
   * Sets the options to use when initializing the Klarna payment view,
   * triggering the validation flow.
   * @param paymentOptions The options to use when initializing the Klarna
   * payment view.
   */
  handlePaymentOptionsChange(paymentOptions: KlarnaPaymentOptions): Promise<void>;

  /**
   * Finalizes the payment.
   * @deprecated use finalizePayment function instead.
   */
  onFinalizePayment(): Promise<void>;

  /**
   * Finalizes the payment.
   */
  finalizePayment(): Promise<void>;

  /**
   * Submits the component, initiating the payment authorization process.
   * This function should only be called after setting the payment options
   * {@link handlePaymentOptionsChange}.
   */
  submit(): Promise<void>;
}

export class PrimerHeadlessUniversalCheckoutKlarnaManager {
  ///////////////////////////////////////////
  // Init
  ///////////////////////////////////////////
  constructor() {}

  ///////////////////////////////////////////
  // API
  ///////////////////////////////////////////

  async provide(props: KlarnaManagerProps): Promise<KlarnaComponent> {
    await this.configureListeners(props);

    const klarnaComponent: KlarnaComponent = {
      start: async () => {
        RNTPrimerHeadlessUniversalCheckoutKlarnaComponent.start();
      },
      submit: async () => {
        RNTPrimerHeadlessUniversalCheckoutKlarnaComponent.submit();
      },
      onSetPaymentOptions: async (paymentOptions: KlarnaPaymentOptions) => {
        RNTPrimerHeadlessUniversalCheckoutKlarnaComponent.onSetPaymentOptions(paymentOptions);
      },
      handlePaymentOptionsChange: async (paymentOptions: KlarnaPaymentOptions) => {
        RNTPrimerHeadlessUniversalCheckoutKlarnaComponent.onSetPaymentOptions(paymentOptions);
      },
      onFinalizePayment: async () => {
        RNTPrimerHeadlessUniversalCheckoutKlarnaComponent.onFinalizePayment();
      },
      finalizePayment: async () => {
        RNTPrimerHeadlessUniversalCheckoutKlarnaComponent.onFinalizePayment();
      },
    };
    await RNTPrimerHeadlessUniversalCheckoutKlarnaComponent.configure(props.primerSessionIntent);
    return klarnaComponent;
  }

  private async configureListeners(props: KlarnaManagerProps): Promise<void> {
    if (props?.onStep) {
      this.addListener('onStep', (data) => {
        props.onStep?.(data);
      });
    }

    if (props?.onInvalid) {
      this.addListener('onInvalid', (data) => {
        props.onInvalid?.(data);
      });
    }

    if (props?.onError) {
      this.addListener('onError', (data) => {
        props.onError?.(data);
      });
    }

    if (props?.onValid) {
      this.addListener('onValid', (data) => {
        props.onValid?.(data);
      });
    }

    if (props?.onValidating) {
      this.addListener('onValidating', (data) => {
        props.onValidating?.(data);
      });
    }

    if (props?.onValidationError) {
      this.addListener('onValidationError', (data) => {
        props.onValidationError?.(data);
      });
    }
  }

  ///////////////////////////////////////////
  // HELPERS
  ///////////////////////////////////////////

  async addListener(eventType: EventType, listener: (...args: any[]) => any): Promise<EmitterSubscription> {
    return eventEmitter.addListener(eventType, listener);
  }

  removeListener(subscription: EmitterSubscription): void {
    return subscription.remove();
  }

  removeAllListenersForEvent(eventType: EventType) {
    eventEmitter.removeAllListeners(eventType);
  }

  removeAllListeners() {
    eventTypes.forEach((eventType) => this.removeAllListenersForEvent(eventType));
  }
}
