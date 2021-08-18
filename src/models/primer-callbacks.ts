import type { PaymentInstrumentToken } from './payment-instrument-token';
import type {
  PrimerException,
  PrimerReactNativeException,
} from './primer-exception';
import type { IPrimerResumeRequest } from './primer-request';

export type OnTokenizeSuccessCallback = (
  data: PaymentInstrumentToken | PrimerReactNativeException,
  completion: (request: IPrimerResumeRequest) => void
) => void;

export type OnTokenAddedToVaultCallback = (
  data: PaymentInstrumentToken | PrimerReactNativeException
) => void;

export type OnDismissCallback = () => void;

export type OnPrimerErrorCallback = (data: PrimerException) => void;
