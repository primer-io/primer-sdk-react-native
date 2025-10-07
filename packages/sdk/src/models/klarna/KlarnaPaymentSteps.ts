import { NamedComponentStep } from './../NamedComponentStep';
import { KlarnaPaymentCategory } from './KlarnaPaymentCategory';

export type KlarnaPaymentStep =
  | PaymentSessionCreated
  | PaymentViewLoaded
  | PaymentSessionAuthorized
  | PaymentSessionFinalized;

/**
 * A type that indicates that the payment view is loaded and ready to be displayed.
 */
export type PaymentViewLoaded = { stepName: 'paymentViewLoaded' } & NamedComponentStep;

/**
 * A type representing the created payment session.
 */
export type PaymentSessionCreated = {
  stepName: 'paymentSessionCreated';
  /**
   * The list of available Klarna payment categories.
   */
  paymentCategories: KlarnaPaymentCategory[];
} & NamedComponentStep;

/**
 * A type representing the authorized payment session.
 */
export type PaymentSessionAuthorized = {
  stepName: 'paymentSessionAuthorized';
  /**
   * The state of the finalization.
   */
  isFinalized: boolean;
} & NamedComponentStep;

/**
 * A type representing the finalized payment session.
 */
export type PaymentSessionFinalized = { stepName: 'paymentSessionFinalized' } & NamedComponentStep;
