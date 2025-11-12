import type { ReactNode } from 'react';
import type { PrimerSettings } from '../PrimerSettings';
import type { PrimerCheckoutData } from '../PrimerCheckoutData';
import type { PrimerCheckoutPaymentMethodData } from '../PrimerCheckoutPaymentMethodData';
import type { PrimerPaymentMethodTokenData } from '../PrimerPaymentMethodTokenData';
import type { PrimerError } from '../PrimerError';
import type { PrimerClientSession } from '../PrimerClientSession';
import type { IPrimerHeadlessUniversalCheckoutPaymentMethod } from '../PrimerHeadlessUniversalCheckoutPaymentMethod';
import type {
  PrimerPaymentCreationHandler,
  PrimerHeadlessUniversalCheckoutResumeHandler,
} from '../PrimerHandlers';
import type {
  PrimerPaymentMethodAsset,
  PrimerPaymentMethodNativeView,
} from '../PrimerPaymentMethodResource';

/**
 * Props for PrimerCheckoutProvider component
 */
export interface PrimerCheckoutProviderProps {
  /**
   * Client token obtained from your backend server
   * @see https://primer.io/docs/accept-payments/manage-client-sessions
   */
  clientToken: string;

  /**
   * Optional SDK settings for configuration
   */
  settings?: PrimerSettings;

  /**
   * Called when checkout completes successfully
   */
  onCheckoutComplete?: (checkoutData: PrimerCheckoutData) => void;

  /**
   * Called when tokenization succeeds
   */
  onTokenizationSuccess?: (
    tokenData: PrimerPaymentMethodTokenData,
    handler: PrimerHeadlessUniversalCheckoutResumeHandler
  ) => void;

  /**
   * Called before payment creation for validation/interception
   */
  onBeforePaymentCreate?: (
    data: PrimerCheckoutPaymentMethodData,
    handler: PrimerPaymentCreationHandler
  ) => void;

  /**
   * Called when an error occurs during checkout
   */
  onError?: (error: PrimerError, checkoutData: PrimerCheckoutData | null) => void;

  /**
   * React children components
   */
  children: ReactNode;
}

/**
 * Value provided by PrimerCheckoutContext
 */
export interface PrimerCheckoutContextValue {
  /**
   * Whether the SDK has been initialized and is ready to use
   */
  isReady: boolean;

  /**
   * Available payment methods returned from the SDK
   */
  availablePaymentMethods: IPrimerHeadlessUniversalCheckoutPaymentMethod[];

  /**
   * Payment method resources with display information (logos, names, colors)
   * Fetched eagerly when SDK initializes
   */
  paymentMethodResources: (PrimerPaymentMethodAsset | PrimerPaymentMethodNativeView)[];

  /**
   * Whether payment method resources are still loading
   */
  isLoadingResources: boolean;

  /**
   * The client token used to initialize the SDK
   */
  clientToken: string;

  /**
   * The settings passed to the provider
   */
  settings?: PrimerSettings;

  /**
   * The client session data containing payment amount and details
   * Updated when the SDK receives client session information
   */
  clientSession: PrimerClientSession | null;
}
