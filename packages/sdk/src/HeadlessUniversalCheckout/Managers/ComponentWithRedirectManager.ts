import {
  NativeEventEmitter,
  NativeModules,
  EmitterSubscription,
} from 'react-native';
import { BankId, BankListFilter, NamedComponentStep } from 'src/models/ComponentWithRedirectModels';
import { IssuingBank } from 'src/models/IssuingBank';
import { PrimerComponentDataValidationError, PrimerInvalidComponentData, PrimerValidComponentData, PrimerValidatingComponentData } from 'src/models/PrimerComponentDataValidation';
import { PrimerError } from 'src/models/PrimerError';

const { RNTPrimerHeadlessUniversalCheckoutBanksComponent } =
  NativeModules;

const eventEmitter = new NativeEventEmitter(
  RNTPrimerHeadlessUniversalCheckoutBanksComponent
);

type EventType = 'onStep' | 'onError' | 'onInvalid' | 'onValid' | 'onValidating' | 'onValidationError';

const eventTypes: EventType[] = [
  'onStep',
  'onError',
  'onInvalid',
  'onValid',
  'onValidating',
  'onValidationError'
];

export interface ComponentWithRedirectManagerProps {
  paymentMethodType: string;
  onStep?: (metadata: IssuingBank[] | NamedComponentStep) => void;
  onError?: (error: PrimerError) => void;
  onInvalid?: (data: PrimerInvalidComponentData<BankId | BankListFilter>) => void;
  onValid?: (data: PrimerValidComponentData<BankId | BankListFilter>) => void;
  onValidating?: (data: PrimerValidatingComponentData<BankId | BankListFilter>) => void;
  onValidationError?: (data: PrimerComponentDataValidationError<BankId | BankListFilter>) => void;
}

export interface BanksComponent {
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
  onBankSelected(bankId: string): Promise<void>;

  /**
   * Filters down the bank list with the given {@link filter}, triggering
   * the validation flow and a new step emission that contains the filtered
   * list of banks in the form of an {@link IssuingBank} array.
   * @param filter The text to filter the bank list by.
   */
  onBankFilterChange(filter: string): Promise<void>;

  /**
   * Submits the component, triggering tokenization and a redirect to the 
   * bank's page for finalizing the payment. This function should only be 
   * called after selecting a bank via {@link onBankSelected}.
   */
  submit(): Promise<void>;
}

export class PrimerHeadlessUniversalCheckoutComponentWithRedirectManager {
  ///////////////////////////////////////////
  // Init
  ///////////////////////////////////////////
  constructor() { }

  ///////////////////////////////////////////
  // API
  ///////////////////////////////////////////

  async provide(props: ComponentWithRedirectManagerProps): Promise<BanksComponent | any> {
    await this.configureListeners(props);

    if (props.paymentMethodType == "ADYEN_IDEAL") {
      const banksComponent: BanksComponent = {
        start: async () => {
          RNTPrimerHeadlessUniversalCheckoutBanksComponent.start();
        },
        submit: async () => {
          RNTPrimerHeadlessUniversalCheckoutBanksComponent.submit();
        },
        onBankFilterChange: async (filter: String) => {
          RNTPrimerHeadlessUniversalCheckoutBanksComponent.onBankFilterChange(filter);
        },
        onBankSelected: async (bankId: String) => {
          RNTPrimerHeadlessUniversalCheckoutBanksComponent.onBankSelected(bankId);
        },
      }
      await RNTPrimerHeadlessUniversalCheckoutBanksComponent.configure(props.paymentMethodType);
      return banksComponent;
    } else {
      return null;
    }
  }

  private async configureListeners(props: ComponentWithRedirectManagerProps): Promise<void> {
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