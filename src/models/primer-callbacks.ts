import type { IPrimerError } from 'src/NativePrimer';
import type { IClientSessionAction } from 'src/Primer';
import type { PaymentInstrumentToken } from './payment-instrument-token';
import type { PrimerResumeHandler } from './primer-request';

export type OnClientTokenCallback = (resumeHandler: PrimerResumeHandler) => void;

export type OnTokenizeSuccessCallback = (paymentInstrument: PaymentInstrumentToken, resumeHandler: PrimerResumeHandler) => void;

export type OnClientSessionActionsCallback = (clientSessionActions: IClientSessionAction[], resumeHandler: PrimerResumeHandler | null) => void;

export type OnTokenAddedToVaultCallback = (paymentInstrument: PaymentInstrumentToken) => void;

export type OnDismissCallback = () => void;

export type OnPrimerErrorCallback = (err: IPrimerError, resumeHandler: PrimerResumeHandler) => void;
