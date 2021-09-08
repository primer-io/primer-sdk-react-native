import type { PaymentInstrumentToken } from './payment-instrument-token';
import type { PrimerError } from './primer-error';
import type { IPrimerResumeRequest } from './primer-request';

export type OnTokenizeSuccessCallback = (
  data: PaymentInstrumentToken
) => Promise<IPrimerResumeRequest>;

export type OnResumeCallback = (request: IPrimerResumeRequest) => void;

export type OnTokenAddedToVaultCallback = (
  data: PaymentInstrumentToken
) => void;

export type OnDismissCallback = () => void;

export type OnPrimerErrorCallback = (data: PrimerError) => void;

export type OnSavedPaymentInstrumentsFetchedCallback = (
  data: PaymentInstrumentToken[]
) => void;
