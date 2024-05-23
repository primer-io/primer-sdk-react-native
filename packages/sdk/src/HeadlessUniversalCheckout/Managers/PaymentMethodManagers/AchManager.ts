import {
    NativeEventEmitter,
    NativeModules,
    EmitterSubscription,
} from 'react-native';
import { PrimerComponentDataValidationError, PrimerInvalidComponentData, PrimerValidComponentData, PrimerValidatingComponentData } from 'src/models/PrimerComponentDataValidation';
import { PrimerError } from 'src/models/PrimerError';
import { EventType, eventTypes } from './Utils/EventType';
import { AchUserDetailsStep, UserDetailsRetrieved } from 'src/models/ach/AchUserDetailsSteps';
import { StripeAchUserDetailsValidatableData } from 'src/models/ach/AchUserDetailsCollectableData';

const { RNHeadlessUniversalCheckoutStripeAchUserDetailsComponent, RNStripeAchMandateManager } = NativeModules;

const eventEmitter = new NativeEventEmitter(RNHeadlessUniversalCheckoutStripeAchUserDetailsComponent);
export interface AchManagerProps {
    onStep?: (data: AchUserDetailsStep) => void;
    onError?: (error: PrimerError) => void;
    onInvalid?: (data: PrimerInvalidComponentData<StripeAchUserDetailsValidatableData>) => void;
    onValid?: (data: PrimerValidComponentData<StripeAchUserDetailsValidatableData>) => void;
    onValidating?: (data: PrimerValidatingComponentData<StripeAchUserDetailsValidatableData>) => void;
    onValidationError?: (data: PrimerComponentDataValidationError<StripeAchUserDetailsValidatableData>) => void;
}

export interface StripeAchComponent {
    /**
     * Starts the component, causing the {@link UserDetailsRetrieved} step
     * to be emitted.
     */
    start(): Promise<void>;

    /**
     * Sets the customer's first name.
     * @param value The customer's first name.
     */
    onSetFirstName(value: String): Promise<void>;

    /**
     * Sets the customer's last name.
     * @param value The customer's last name.
     */
    onSetLastName(value: String): Promise<void>;

    /**
     * Sets the customer's email address.
     * @param value The customer's email address.
     */
    onSetEmailAddress(value: String): Promise<void>;

    /**
     * Submits the component, initiating the payment authorization process. 
     * This function should only be called after setting the customer first name, 
     * last name and email address.
     */
    submit(): Promise<void>;

    /**
     * Accepts the Stripe ACH mandate, completing the payment.
     */
    acceptMandate(): Promise<void>;

    /**
     * Declines the Stripe ACH mandate, cancelling the payment.
     */
    declineMandate(): Promise<void>;
}

export class PrimerHeadlessUniversalCheckoutAchManager {
    ///////////////////////////////////////////
    // Init
    ///////////////////////////////////////////
    constructor() { }

    ///////////////////////////////////////////
    // API
    ///////////////////////////////////////////

    async provideStripeAchComponent(props: AchManagerProps): Promise<StripeAchComponent> {
        await this.configureListeners(props);

        const component: StripeAchComponent = {
            start: async () => {
                RNHeadlessUniversalCheckoutStripeAchUserDetailsComponent.start();
            },
            submit: async () => {
                RNHeadlessUniversalCheckoutStripeAchUserDetailsComponent.submit();
            },
            onSetFirstName: async (value: String) => {
                RNHeadlessUniversalCheckoutStripeAchUserDetailsComponent.onSetFirstName(value);
            },
            onSetLastName: async (value: String) => {
                RNHeadlessUniversalCheckoutStripeAchUserDetailsComponent.onSetLastName(value);
            },
            onSetEmailAddress: async (value: String) => {
                RNHeadlessUniversalCheckoutStripeAchUserDetailsComponent.onSetEmailAddress(value);
            },
            acceptMandate: async () => {
                RNStripeAchMandateManager.acceptMandate();
            },
            declineMandate: async () => {
                RNStripeAchMandateManager.declineMandate();
            },
        }
        await RNHeadlessUniversalCheckoutStripeAchUserDetailsComponent.configure();
        return component;
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

    async addListener(
        eventType: EventType,
        listener: (...args: any[]) => any
    ): Promise<EmitterSubscription> {
        return eventEmitter.addListener(eventType, listener);
    }

    removeListener(subscription: EmitterSubscription): void {
        return subscription.remove();
    }

    removeAllListenersForEvent(eventType: EventType) {
        eventEmitter.removeAllListeners(eventType);
    }

    removeAllListeners() {
        eventTypes.forEach((eventType) =>
            this.removeAllListenersForEvent(eventType)
        );
    }
}