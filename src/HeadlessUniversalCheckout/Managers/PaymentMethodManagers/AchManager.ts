import { NativeEventEmitter, NativeModules } from 'react-native';
import type { EmitterSubscription } from 'react-native';
import type {
  PrimerComponentDataValidationError,
  PrimerInvalidComponentData,
  PrimerValidComponentData,
  PrimerValidatingComponentData,
} from '../../../models/PrimerComponentDataValidation';
import { PrimerError } from '../../../models/PrimerError';
import type { EventType } from './Utils/EventType';
import { unwrapNativeError } from './Utils/unwrapNativeError';
import type { AchStep } from '../../../models/ach/AchSteps';
import type { AchValidatableData } from '../../../models/ach/AchCollectableData';

const { RNTPrimerHeadlessUniversalCheckoutStripeAchUserDetailsComponent } = NativeModules;

const eventEmitter = new NativeEventEmitter(RNTPrimerHeadlessUniversalCheckoutStripeAchUserDetailsComponent);
export interface AchManagerProps {
  paymentMethodType: string;
  onStep?: (data: AchStep) => void;
  onError?: (error: PrimerError) => void;
  onInvalid?: (data: PrimerInvalidComponentData<AchValidatableData>) => void;
  onValid?: (data: PrimerValidComponentData<AchValidatableData>) => void;
  onValidating?: (data: PrimerValidatingComponentData<AchValidatableData>) => void;
  onValidationError?: (data: PrimerComponentDataValidationError<AchValidatableData>) => void;
}

export interface StripeAchUserDetailsComponent {
  /**
   * Starts the component, causing the {@link UserDetailsRetrieved} step
   * to be emitted.
   */
  start(): Promise<void>;

  /**
   * Sets the customer's first name.
   * @param value The customer's first name.
   */
  handleFirstNameChange(value: String): Promise<void>;

  /**
   * Sets the customer's last name.
   * @param value The customer's last name.
   */
  handleLastNameChange(value: String): Promise<void>;

  /**
   * Sets the customer's email address.
   * @param value The customer's email address.
   */
  handleEmailAddressChange(value: String): Promise<void>;

  /**
   * Submits the component, initiating the payment authorization process.
   * This function should only be called after setting the customer first name,
   * last name and email address.
   */
  submit(): Promise<void>;

  /**
   * Tears down the underlying native component and releases the JS event
   * subscriptions registered by {@link PrimerHeadlessUniversalCheckoutAchManager.provide},
   * allowing consecutive Stripe ACH payments within the same app session.
   */
  cleanUp(): Promise<void>;
}

export class PrimerHeadlessUniversalCheckoutAchManager {
  private subscriptions: EmitterSubscription[] = [];

  ///////////////////////////////////////////
  // Init
  ///////////////////////////////////////////
  constructor() {}

  ///////////////////////////////////////////
  // API
  ///////////////////////////////////////////

  async provide(props: AchManagerProps): Promise<StripeAchUserDetailsComponent | null> {
    // Drain any subscriptions left over from a previous provide() on this instance.
    this.drainSubscriptions();
    await this.configureListeners(props);

    if (props.paymentMethodType === 'STRIPE_ACH') {
      const component: StripeAchUserDetailsComponent = {
        start: async () => {
          await RNTPrimerHeadlessUniversalCheckoutStripeAchUserDetailsComponent.start();
        },
        submit: async () => {
          await RNTPrimerHeadlessUniversalCheckoutStripeAchUserDetailsComponent.submit();
        },
        handleFirstNameChange: async (value: String) => {
          await RNTPrimerHeadlessUniversalCheckoutStripeAchUserDetailsComponent.onSetFirstName(value);
        },
        handleLastNameChange: async (value: String) => {
          await RNTPrimerHeadlessUniversalCheckoutStripeAchUserDetailsComponent.onSetLastName(value);
        },
        handleEmailAddressChange: async (value: String) => {
          await RNTPrimerHeadlessUniversalCheckoutStripeAchUserDetailsComponent.onSetEmailAddress(value);
        },
        cleanUp: async () => {
          await RNTPrimerHeadlessUniversalCheckoutStripeAchUserDetailsComponent.cleanUp();
          this.drainSubscriptions();
        },
      };
      await RNTPrimerHeadlessUniversalCheckoutStripeAchUserDetailsComponent.configure();
      return component;
    } else {
      return null;
    }
  }

  private async configureListeners(props: AchManagerProps): Promise<void> {
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
        const error = unwrapNativeError(data);
        if (error) props.onError?.(error);
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
