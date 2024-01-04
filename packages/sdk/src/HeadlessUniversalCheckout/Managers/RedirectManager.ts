import type { PrimerError } from '@primer-io/react-native';
import {
  NativeEventEmitter,
  NativeModules,
  EmitterSubscription,
} from 'react-native';
import { PrimerInitializationData } from 'src/models/PrimerInitializationData';

const { RNTPrimerHeadlessUniversalCheckoutComponentWithRedirectManager } =
  NativeModules;

const eventEmitter = new NativeEventEmitter(
  RNTPrimerHeadlessUniversalCheckoutComponentWithRedirectManager
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
  onRetrieved?: (metadata: any) => void;
  onRetrieving?: () => void;
  onError?: (errors: PrimerError[] | undefined) => void;
  onInvalid?: (isValid: any) => void;
  onValid?: () => void;
  onValidating?: () => void;
}

class PrimerHeadlessUniversalCheckoutComponentWithRedirectManager {
  options?: RedirectManagerProps;

  ///////////////////////////////////////////
  // Init
  ///////////////////////////////////////////
  constructor() { }

  ///////////////////////////////////////////
  // API
  ///////////////////////////////////////////

  async configure(
    options: RedirectManagerProps
  ): Promise<{ initializationData: PrimerInitializationData } | void> {
    return new Promise(async (resolve, reject) => {
      try {
        this.options = options;
        await this.configureListeners();

        const data =
          await RNTPrimerHeadlessUniversalCheckoutComponentWithRedirectManager.configure(
            options.paymentMethodType
          );

        if (data) {
          resolve(data);
        } else {
          resolve();
        }
      } catch (err) {
        reject(err);
      }
    });
  }

  async submit(): Promise<{ initializationData: PrimerInitializationData } | void> {
    return new Promise(async (resolve, reject) => {
      try {
        const data =
          await RNTPrimerHeadlessUniversalCheckoutComponentWithRedirectManager.submit();

        if (data) {
          resolve(data);
        } else {
          resolve();
        }
      } catch (err) {
        reject(err);
      }
    });
  }

  async onBankSelected(
    bankId: string
  ): Promise<{ initializationData: PrimerInitializationData } | void> {
    return new Promise(async (resolve, reject) => {
      try {
        const data =
          await RNTPrimerHeadlessUniversalCheckoutComponentWithRedirectManager.onBankSelected(
            bankId
          );

        if (data) {
          resolve(data);
        } else {
          resolve();
        }
      } catch (err) {
        reject(err);
      }
    });
  }

  async onBankFilterChange(
    filter: string
  ): Promise<{ initializationData: PrimerInitializationData } | void> {
    return new Promise(async (resolve, reject) => {
      try {
        const data =
          await RNTPrimerHeadlessUniversalCheckoutComponentWithRedirectManager.onBankFilterChange(
            filter
          );

        if (data) {
          resolve(data);
        } else {
          resolve();
        }
      } catch (err) {
        reject(err);
      }
    });
  }

  async configureListeners(): Promise<void> {
    //@ts-ignore
    return new Promise(async (resolve, reject) => {
      if (this.options?.onRetrieved) {
        this.addListener('onRetrieved', ({ banks }) => {
          if (this.options?.onRetrieved) {
            this.options.onRetrieved(banks);
          }
        });
      }

      if (this.options?.onRetrieving) {
        this.addListener('onRetrieving', () => {
          if (this.options?.onRetrieving) {
            this.options.onRetrieving();
          }
        });
      }

      if (this.options?.onInvalid) {
        this.addListener('onInvalid', (data) => {
          if (this.options?.onInvalid) {
            this.options.onInvalid(data);
          }
        });
      }

      if (this.options?.onError) {
        this.addListener('onError', (data) => {
          if (this.options?.onError) {
            this.options.onError(data.errors);
          }
        });
      }

      if (this.options?.onValid) {
        this.addListener('onValid', ({ data }) => {
          if (this.options?.onValid) {
            this.options.onValid(data);
          }
        });
      }

      if (this.options?.onValidating) {
        this.addListener('onValidating', () => {
          if (this.options?.onValidating) {
            this.options.onValidating();
          }
        });
      }

      resolve();
    });
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
