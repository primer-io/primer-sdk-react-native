import {
    NativeEventEmitter,
    NativeModules,
    EmitterSubscription,
} from 'react-native';
import { NamedComponentStep } from 'src/models/NamedComponentStep';
import { PrimerComponentDataValidationError, PrimerInvalidComponentData, PrimerValidComponentData, PrimerValidatingComponentData } from 'src/models/PrimerComponentDataValidation';
import { PrimerError } from 'src/models/PrimerError';
import { KlarnaPaymentFinalization, KlarnaPaymentOptions } from 'src/models/klarna/KlarnaPaymentCollectableData';
import { PaymentSessionAuthorized, PaymentSessionCreated, PaymentSessionFinalized } from 'src/models/klarna/KlarnaPaymentSteps';

const { RNTPrimerHeadlessUniversalCheckoutKlarnaPaymentComponent } = NativeModules;

const eventEmitter = new NativeEventEmitter(RNTPrimerHeadlessUniversalCheckoutKlarnaPaymentComponent);

// TODO TWS-94: move to a common package
type EventType = 'onStep' | 'onError' | 'onInvalid' | 'onValid' | 'onValidating' | 'onValidationError';

// TODO TWS-94: move to a common package
const eventTypes: EventType[] = [
    'onStep',
    'onError',
    'onInvalid',
    'onValid',
    'onValidating',
    'onValidationError'
];

export interface KlarnaManagerProps {
    onStep?: (metadata: PaymentSessionCreated | PaymentSessionAuthorized | PaymentSessionFinalized) => void;
    onError?: (error: PrimerError) => void;
    onInvalid?: (data: PrimerInvalidComponentData<KlarnaPaymentOptions | KlarnaPaymentFinalization>) => void;
    onValid?: (data: PrimerValidComponentData<KlarnaPaymentOptions | KlarnaPaymentFinalization>) => void;
    onValidating?: (data: PrimerValidatingComponentData<KlarnaPaymentOptions | KlarnaPaymentFinalization>) => void;
    onValidationError?: (data: PrimerComponentDataValidationError<KlarnaPaymentOptions | KlarnaPaymentFinalization>) => void;
}

// TODO TWS-94: update JDoc
export interface KlarnaPaymentComponent {
    /**
     * Starts the component, causing step emissions. 
     * First, with a {@link NamedComponentStep} instance  where 
     * {@link NamedComponentStep.name} has a value of 'loading', followed 
     * by another emission that contains the list of banks in the form of an 
     * {@link IssuingBank} array.
     */
    start(): Promise<void>;

    /**
     * Selects the bank with the given {@link bankId}, triggering the
     * validation flow.
     * @param bankId The id of the selected bank.
     */
    onSetPaymentOptions(paymentOptions: KlarnaPaymentOptions): Promise<void>;

    /**
     * Filters down the bank list with the given {@link filter}, triggering
     * the validation flow and a new step emission that contains the filtered
     * list of banks in the form of an {@link IssuingBank} array.
     * @param filter The text to filter the bank list by.
     */
    onFinalizePayment(): Promise<void>;

    /**
     * Submits the component, triggering tokenization and a redirect to the 
     * bank's page for finalizing the payment. This function should only be 
     * called after selecting a bank via {@link onBankSelected}.
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

    async provide(props: KlarnaManagerProps): Promise<KlarnaPaymentComponent | any> {
        await this.configureListeners(props);

        const klarnaPaymentComponent: KlarnaPaymentComponent = {
            start: async () => {
                RNTPrimerHeadlessUniversalCheckoutKlarnaPaymentComponent.start();
            },
            submit: async () => {
                RNTPrimerHeadlessUniversalCheckoutKlarnaPaymentComponent.submit();
            },
            onSetPaymentOptions: async (paymentOptions: KlarnaPaymentOptions) => {
                RNTPrimerHeadlessUniversalCheckoutKlarnaPaymentComponent.onSetPaymentOptions(paymentOptions);
            },
            onFinalizePayment: async () => {
                RNTPrimerHeadlessUniversalCheckoutKlarnaPaymentComponent.onFinalizePayment();
            },
        }
        await RNTPrimerHeadlessUniversalCheckoutKlarnaPaymentComponent.configure();
        return klarnaPaymentComponent;
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