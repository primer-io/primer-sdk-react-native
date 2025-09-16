import { NativeEventEmitter, NativeModules, EmitterSubscription } from 'react-native';
import {
  PrimerComponentDataValidationError,
  PrimerInvalidComponentData,
  PrimerValidComponentData,
  PrimerValidatingComponentData,
} from '../../../models/PrimerComponentDataValidation';
import { PrimerError } from '../../../models/PrimerError';
import { EventType, eventTypes } from './Utils/EventType';
import { AchStep } from '../../../models/ach/AchSteps';
import { AchValidatableData } from '../../../models/ach/AchCollectableData';

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
}

export class PrimerHeadlessUniversalCheckoutAchManager {
  ///////////////////////////////////////////
  // Init
  ///////////////////////////////////////////
  constructor() {}

  ///////////////////////////////////////////
  // API
  ///////////////////////////////////////////

  async provide(props: AchManagerProps): Promise<StripeAchUserDetailsComponent | any> {
    await this.configureListeners(props);

    if (props.paymentMethodType === 'STRIPE_ACH') {
      const component: StripeAchUserDetailsComponent = {
        start: async () => {
          RNTPrimerHeadlessUniversalCheckoutStripeAchUserDetailsComponent.start();
        },
        submit: async () => {
          RNTPrimerHeadlessUniversalCheckoutStripeAchUserDetailsComponent.submit();
        },
        handleFirstNameChange: async (value: String) => {
          RNTPrimerHeadlessUniversalCheckoutStripeAchUserDetailsComponent.onSetFirstName(value);
        },
        handleLastNameChange: async (value: String) => {
          RNTPrimerHeadlessUniversalCheckoutStripeAchUserDetailsComponent.onSetLastName(value);
        },
        handleEmailAddressChange: async (value: String) => {
          RNTPrimerHeadlessUniversalCheckoutStripeAchUserDetailsComponent.onSetEmailAddress(value);
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
