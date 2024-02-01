import type { PrimerError, IssuingBank } from '@primer-io/react-native';
import {
  NativeEventEmitter,
  NativeModules,
  EmitterSubscription,
} from 'react-native';

const { RNTPrimerHeadlessUniversalCheckoutBanksComponent } =
  NativeModules;

const eventEmitter = new NativeEventEmitter(
  RNTPrimerHeadlessUniversalCheckoutBanksComponent
);

type EventType = 'onRetrieved' | 'onRetrieving' | 'onInvalid' | 'onValid' | 'onError' | 'onValidating';

const eventTypes: EventType[] = [
  'onRetrieved',
  'onRetrieving',
  'onInvalid',
  'onError',
  'onValid',
  'onValidating'
];

export interface RedirectManagerProps {
  paymentMethodType: string;
  onRetrieved?: (metadata: IssuingBank | any) => void;
  onRetrieving?: () => void;
  onError?: (errors: PrimerError[] | undefined) => void;
  onInvalid?: (data: any) => void;
  onValid?: (data: any) => void;
  onValidating?: (data: any) => void;
}

interface BanksComponent {
  start(): Promise<void>;

  onBankSelected(bankId: string): Promise<void>;

  onBankFilterChange(filter: string): Promise<void>;

  submit(): Promise<void>;
}

class PrimerHeadlessUniversalCheckoutComponentWithRedirectManager {
  ///////////////////////////////////////////
  // Init
  ///////////////////////////////////////////
  constructor() { }

  ///////////////////////////////////////////
  // API
  ///////////////////////////////////////////

  async provide(props: RedirectManagerProps): Promise<BanksComponent | any> {
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

  private async configureListeners(props: RedirectManagerProps): Promise<void> {
    if (props?.onRetrieved) {
      this.addListener('onRetrieved', ({ banks }) => {
        props.onRetrieved?.(banks);
      });
    }

    if (props?.onRetrieving) {
      this.addListener('onRetrieving', () => {
        props.onRetrieving?.();
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

export default PrimerHeadlessUniversalCheckoutComponentWithRedirectManager;
