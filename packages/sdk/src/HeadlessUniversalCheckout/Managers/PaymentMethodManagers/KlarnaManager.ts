import {
    NativeEventEmitter,
    NativeModules,
    EmitterSubscription,
} from 'react-native';
import { PrimerComponentDataValidationError, PrimerInvalidComponentData, PrimerValidComponentData, PrimerValidatingComponentData } from 'src/models/PrimerComponentDataValidation';
import { PrimerError } from 'src/models/PrimerError';
import { KlarnaPaymentFinalization, KlarnaPaymentOptions } from 'src/models/klarna/KlarnaPaymentCollectableData';
import { PaymentSessionAuthorized, PaymentSessionCreated, PaymentSessionFinalized } from 'src/models/klarna/KlarnaPaymentSteps';
import { EventType, eventTypes } from './Utils/EventType';
import { PrimerSessionIntent } from 'src/models/PrimerSessionIntent';

const { RNTPrimerHeadlessUniversalCheckoutKlarnaComponent } = NativeModules;

const eventEmitter = new NativeEventEmitter(RNTPrimerHeadlessUniversalCheckoutKlarnaComponent);
export interface KlarnaManagerProps {
    primerSessionIntent: PrimerSessionIntent;
    onStep?: (metadata: PaymentSessionCreated | PaymentSessionAuthorized | PaymentSessionFinalized) => void;
    onError?: (error: PrimerError) => void;
    onInvalid?: (data: PrimerInvalidComponentData<KlarnaPaymentOptions | KlarnaPaymentFinalization>) => void;
    onValid?: (data: PrimerValidComponentData<KlarnaPaymentOptions | KlarnaPaymentFinalization>) => void;
    onValidating?: (data: PrimerValidatingComponentData<KlarnaPaymentOptions | KlarnaPaymentFinalization>) => void;
    onValidationError?: (data: PrimerComponentDataValidationError<KlarnaPaymentOptions | KlarnaPaymentFinalization>) => void;
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
     */
    onSetPaymentOptions(paymentOptions: KlarnaPaymentOptions): Promise<void>;

    /**
     * Finalizes the payment.
     */
    onFinalizePayment(): Promise<void>;

    /**
     * Submits the component, initiating the payment authorization process. 
     * This function should only be called after setting the payment options 
     * {@link onSetPaymentOptions}.
     */
    submit(): Promise<void>;
}

export class PrimerHeadlessUniversalCheckoutKlarnaManager {
    ///////////////////////////////////////////
    // Init
    ///////////////////////////////////////////
    constructor() { }

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
            onFinalizePayment: async () => {
                RNTPrimerHeadlessUniversalCheckoutKlarnaComponent.onFinalizePayment();
            },
        }
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