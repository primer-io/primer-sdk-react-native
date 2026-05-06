import { NativeEventEmitter, NativeModules } from 'react-native';
import type { EmitterSubscription } from 'react-native';
import type {
  PrimerComponentDataValidationError,
  PrimerInvalidComponentData,
  PrimerValidComponentData,
  PrimerValidatingComponentData,
} from '../../../models/PrimerComponentDataValidation';
import { PrimerError } from '../../../models/PrimerError';
import type {
  KlarnaPaymentOptions,
  KlarnaPaymentValidatableData,
} from '../../../models/klarna/KlarnaPaymentCollectableData';
import type { KlarnaPaymentStep } from '../../../models/klarna/KlarnaPaymentSteps';
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

  /**
   * Tears down the underlying Klarna component and releases the JS event
   * subscriptions registered by {@link KlarnaManager.provide}. Call this after
   * a payment completes (or before initiating another) to allow consecutive
   * Klarna payments within the same app session.
   */
  cleanUp(): Promise<void>;
}

export class PrimerHeadlessUniversalCheckoutKlarnaManager {
  private subscriptions: EmitterSubscription[] = [];

  ///////////////////////////////////////////
  // Init
  ///////////////////////////////////////////
  constructor() {}

  ///////////////////////////////////////////
  // API
  ///////////////////////////////////////////

  async provide(props: KlarnaManagerProps): Promise<KlarnaComponent> {
    // Drain any subscriptions left over from a previous provide() on this instance,
    // so consumers who skip explicit cleanUp don't accumulate duplicate listeners.
    this.drainSubscriptions();
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
      cleanUp: async () => {
        await RNTPrimerHeadlessUniversalCheckoutKlarnaComponent.cleanUp();
        this.drainSubscriptions();
      },
    };
    await RNTPrimerHeadlessUniversalCheckoutKlarnaComponent.configure(props.primerSessionIntent);
    return klarnaComponent;
  }

  private async configureListeners(props: KlarnaManagerProps): Promise<void> {
    if (props?.onStep) {
      const sub = await this.addListener('onStep', (data) => {
        props.onStep?.(data);
      });
      this.subscriptions.push(sub);
    }

    if (props?.onInvalid) {
      const sub = await this.addListener('onInvalid', (data) => {
        props.onInvalid?.(data);
      });
      this.subscriptions.push(sub);
    }

    if (props?.onError) {
      const sub = await this.addListener('onError', (data) => {
        props.onError?.(data);
      });
      this.subscriptions.push(sub);
    }

    if (props?.onValid) {
      const sub = await this.addListener('onValid', (data) => {
        props.onValid?.(data);
      });
      this.subscriptions.push(sub);
    }

    if (props?.onValidating) {
      const sub = await this.addListener('onValidating', (data) => {
        props.onValidating?.(data);
      });
      this.subscriptions.push(sub);
    }

    if (props?.onValidationError) {
      const sub = await this.addListener('onValidationError', (data) => {
        props.onValidationError?.(data);
      });
      this.subscriptions.push(sub);
    }
  }

  ///////////////////////////////////////////
  // HELPERS
  ///////////////////////////////////////////

  async addListener(eventType: EventType, listener: (...args: any[]) => any): Promise<EmitterSubscription> {
    return eventEmitter.addListener(eventType, listener);
  }

  removeListener(subscription: EmitterSubscription): void {
    subscription.remove();
    this.subscriptions = this.subscriptions.filter((sub) => sub !== subscription);
  }

  removeAllListenersForEvent(eventType: EventType) {
    eventEmitter.removeAllListeners(eventType);
  }

  // Routes through per-instance bookkeeping. Avoids the global-nuke approach
  // (eventEmitter.removeAllListeners(eventName)) which on Android would also
  // wipe other modules' listeners for overlapping event names like onError —
  // those modules share the global RCTDeviceEventEmitter.
  removeAllListeners() {
    this.drainSubscriptions();
  }

  private drainSubscriptions(): void {
    this.subscriptions.forEach((subscription) => subscription.remove());
    this.subscriptions = [];
  }
}
