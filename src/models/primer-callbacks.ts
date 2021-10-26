import type { ActionRequest } from './action-request';
import type { PaymentInstrumentToken } from './payment-instrument-token';
import type { PrimerError } from './primer-error';
import type { PrimerResumeHandler } from './primer-request';

export type OnTokenizeSuccessCallback = (
  req: PaymentInstrumentToken,
  completion: PrimerResumeHandler
) => void;

export type OnDataChangeCallback = (
  req: ActionRequest,
  completion: PrimerResumeHandler
) => void;

export type OnTokenAddedToVaultCallback = (
  data: PaymentInstrumentToken
) => void;

export type OnDismissCallback = () => void;

export type OnPrimerErrorCallback = (data: PrimerError) => void;

export type OnSavedPaymentInstrumentsFetchedCallback = (
  data: PaymentInstrumentToken[]
) => void;
