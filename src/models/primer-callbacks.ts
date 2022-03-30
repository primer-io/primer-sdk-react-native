import type { IPrimerError } from 'src/RNPrimer';
import type { IClientSessionAction } from 'src/Primer';
import type { PaymentInstrumentToken } from './payment-instrument-token';
import type { PrimerResumeHandler } from './primer-request';

// Not implemented
// export type OnClientTokenCallback = (resumeHandler: PrimerResumeHandler) => void;

export type OnClientSessionActionsCallback = (clientSessionActions: IClientSessionAction[], resumeHandler: PrimerResumeHandler | null) => void;
export type OnTokenizeSuccessCallback = (paymentInstrument: PaymentInstrumentToken, resumeHandler: PrimerResumeHandler) => void;
export type OnTokenAddedToVaultCallback = (paymentInstrument: PaymentInstrumentToken) => void;
export type OnResumeCallback = (resumeToken: string, resumeHandler: PrimerResumeHandler | null) => void;
export type OnPrimerErrorCallback = (err: IPrimerError, resumeHandler: PrimerResumeHandler) => void;
export type OnDismissCallback = () => void;
