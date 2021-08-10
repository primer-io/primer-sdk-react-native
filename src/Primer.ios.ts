import { NativeModules } from 'react-native';
import type { IPaymentInstrument } from './models/payment-instrument';
import type {
  IPrimerInitRequest,
  IPrimerResumeRequest,
} from './models/primer-request';
import type { IPrimerSettings } from './models/primer-settings';
import type { IPrimerTheme } from './models/primer-theme';

const { PrimerRN: IOSModule } = NativeModules;

export interface IPrimer {
  configureSettings(settings: IPrimerSettings): void;
  configureTheme(theme: IPrimerTheme): void;
  configureOnTokenizeSuccessCallback(
    callback: (data: IPaymentInstrument) => void
  ): void;
  configureOnDismissCallback(callback: () => void): void;
  configureOnPrimerErrorCallback(callback: (data: String) => void): void;
  removeAllCallbacks(): void;
  initWith(request: IPrimerInitRequest): void;
  resumeWith(request: IPrimerResumeRequest): void;
}

export const Primer: IPrimer = {
  // SETTINGS & THEME
  configureSettings(settings: IPrimerSettings): void {
    const data = JSON.stringify(settings);
    IOSModule.configureSettings(data);
  },

  configureTheme(theme: IPrimerTheme): void {
    const data = JSON.stringify(theme);
    IOSModule.configureTheme(data);
  },

  // CALLBACKS
  configureOnTokenizeSuccessCallback(
    callback: (data: IPaymentInstrument) => void
  ): void {
    configureOnTokenizeSuccessCallback(callback);
  },

  configureOnDismissCallback(callback: () => void): void {
    configureOnDismissCallback(callback);
  },

  configureOnPrimerErrorCallback(callback: (data: String) => void): void {
    configureOnPrimerErrorCallback(callback);
  },

  removeAllCallbacks(): void {
    IOSModule.removeAllCallbacks();
  },

  // FLOW
  initWith(request: IPrimerInitRequest): void {
    const data = JSON.stringify(request);
    IOSModule.initWith(data);
  },

  resumeWith(request: IPrimerResumeRequest): void {
    const data = JSON.stringify(request);
    IOSModule.resumeWith(data);
  },
};

function configureOnTokenizeSuccessCallback(
  callback: (data: IPaymentInstrument) => void
) {
  IOSModule.configureOnTokenizeSuccessCallback((data: any) => {
    const paymentInstrument = JSON.parse(data) as IPaymentInstrument;
    callback(paymentInstrument);
    configureOnTokenizeSuccessCallback(callback);
  });
}

function configureOnDismissCallback(callback: () => void) {
  IOSModule.configureOnDismissCallback((_: any) => {
    callback();
    configureOnDismissCallback(callback);
  });
}

function configureOnPrimerErrorCallback(callback: (data: String) => void) {
  IOSModule.configureOnPrimerErrorCallback((data: String) => {
    callback(data);
    configureOnPrimerErrorCallback(callback);
  });
}
