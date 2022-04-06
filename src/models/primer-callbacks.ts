import type { ActionRequest } from './action-request';
import type { ClientSessionActionsRequest } from './client-session-actions-request';
import type { PaymentInstrumentToken } from './payment-instrument-token';
import type { PrimerError } from './primer-error';
import type { PrimerResumeHandler } from './primer-request';

export type OnTokenizeSuccessCallback = (
  paymentInstrumentToken: PaymentInstrumentToken,
  completion: PrimerResumeHandler
) => void;

export type OnResumeSuccessCallback = (
  resumeToken: string,
  resumeHandler: PrimerResumeHandler
) => void;

export type OnClientSessionActionsCallback = (
  request: ClientSessionActionsRequest,
  resumeHandler: PrimerResumeHandler
) => void;

export type OnDataChangeCallback = (
  req: ActionRequest,
  completion: PrimerResumeHandler
) => void;

export type OnTokenAddedToVaultCallback = (
  paymentInstrumentToken: PaymentInstrumentToken
) => void;

export type OnDismissCallback = () => void;

export type OnPrimerErrorCallback = (error: PrimerError) => void;

export type OnSavedPaymentInstrumentsFetchedCallback = (
  paymentInstrumentTokens: PaymentInstrumentToken[]
) => void;
