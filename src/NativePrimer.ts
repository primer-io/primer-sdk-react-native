import { NativeEventEmitter, NativeModules } from 'react-native';
import type { PrimerSettings } from './models/primer-settings';
import type { PrimerTheme } from './models/primer-theme';

const { NativePrimer } = NativeModules;

const eventEmitter = new NativeEventEmitter(NativePrimer);

type EventType =
  | 'onClientTokenCallback'
  | 'onError';

const _NativePrimer = {
  ///////////////////////////////////////////
  // Event Emitter
  ///////////////////////////////////////////
  addListener: (eventType: EventType, listener: (...args: any[]) => any) => {
    eventEmitter.addListener(eventType, listener);
  },

  ///////////////////////////////////////////
  // Native API
  ///////////////////////////////////////////
  configure: (
    settings: PrimerSettings | null,
    theme: PrimerTheme | null
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (settings === null && theme === null) {
        // Do nothing, SDK will use default settings and theme.
      } else if (settings && theme === null) {
        NativePrimer.configureWithSettings(JSON.stringify(settings));
      } else if (settings === null && theme) {
        NativePrimer.configureWithTheme(JSON.stringify(theme));
      } else {
        NativePrimer.configureWithSettings(JSON.stringify(settings), JSON.stringify(theme));
      }

      resolve();
    });
  },

  showUniversalCheckout: (clientToken: string | undefined): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (clientToken) {
        NativePrimer.showUniversalCheckoutWithClientToken(clientToken);
      } else {
        NativePrimer.showUniversalCheckout();
      }

      resolve();
    });
  },

  setClientToken: (clientToken: string | undefined): Promise<void> => {
    return new Promise((resolve, reject) => {
      NativePrimer.setClientToken(clientToken);
      resolve();
    });
  }
};

export default _NativePrimer;
