import { useEffect, useState, useMemo } from 'react';
import { PrimerHeadlessUniversalCheckout } from '../HeadlessUniversalCheckout/PrimerHeadlessUniversalCheckout';
import { PrimerCheckoutContext } from './internal/PrimerCheckoutContext';
import type {
  PrimerCheckoutProviderProps,
  PrimerCheckoutContextValue,
} from '../models/components/PrimerCheckoutProviderTypes';
import type { IPrimerHeadlessUniversalCheckoutPaymentMethod } from '../models/PrimerHeadlessUniversalCheckoutPaymentMethod';
import type { PrimerSettings } from '../models/PrimerSettings';

/**
 * Provider component for Primer Components API
 *
 * This component initializes the Primer Headless Universal Checkout SDK
 * and provides context to child components that use Primer hooks.
 *
 * @example
 * ```tsx
 * <PrimerCheckoutProvider
 *   clientToken={clientToken}
 *   onCheckoutComplete={(data) => console.log(data)}
 * >
 *   <CheckoutScreen />
 * </PrimerCheckoutProvider>
 * ```
 */
export function PrimerCheckoutProvider(props: PrimerCheckoutProviderProps) {
  const {
    clientToken,
    settings,
    onCheckoutComplete,
    onTokenizationSuccess,
    onBeforePaymentCreate,
    onError,
    children,
  } = props;

  const [isReady, setIsReady] = useState(false);
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState<
    IPrimerHeadlessUniversalCheckoutPaymentMethod[]
  >([]);
  const [initError, setInitError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initializeSDK = async () => {
      try {
        // Build settings with headless callbacks
        const headlessSettings: PrimerSettings = {
          ...settings,
          headlessUniversalCheckoutCallbacks: {
            // Merge existing callbacks with provider callbacks
            ...settings?.headlessUniversalCheckoutCallbacks,

            onCheckoutComplete: (checkoutData) => {
              if (onCheckoutComplete) {
                onCheckoutComplete(checkoutData);
              }
              // Also call original callback if exists
              settings?.headlessUniversalCheckoutCallbacks?.onCheckoutComplete?.(checkoutData);
            },

            onTokenizationSuccess: (tokenData, handler) => {
              if (onTokenizationSuccess) {
                onTokenizationSuccess(tokenData, handler);
              } else {
                // Default behavior: complete the flow
                // Note: In a real app, you'd typically create a payment on your backend
                // and then call handler.continueWithNewClientToken if 3DS is required
                handler.complete();
              }
              // Also call original callback if exists
              settings?.headlessUniversalCheckoutCallbacks?.onTokenizationSuccess?.(tokenData, handler);
            },

            onBeforePaymentCreate: (data, handler) => {
              if (onBeforePaymentCreate) {
                onBeforePaymentCreate(data, handler);
              } else {
                // Default behavior: auto-continue payment creation
                handler.continuePaymentCreation();
              }
              // Also call original callback if exists
              settings?.headlessUniversalCheckoutCallbacks?.onBeforePaymentCreate?.(data, handler);
            },

            onError: (error, checkoutData) => {
              if (onError) {
                onError(error, checkoutData);
              }
              // Also call original callback if exists
              settings?.headlessUniversalCheckoutCallbacks?.onError?.(error, checkoutData);
            },
          },
        };

        // Initialize headless checkout
        const paymentMethods = await PrimerHeadlessUniversalCheckout.startWithClientToken(
          clientToken,
          headlessSettings
        );

        if (isMounted) {
          setAvailablePaymentMethods(paymentMethods);
          setIsReady(true);
        }
      } catch (err) {
        console.error('Failed to initialize Primer Checkout:', err);
        if (isMounted) {
          setInitError(err as Error);
        }
      }
    };

    initializeSDK();

    // Cleanup on unmount
    return () => {
      isMounted = false;
      PrimerHeadlessUniversalCheckout.cleanUp().catch((err) => {
        console.error('Failed to clean up Primer Checkout:', err);
      });
    };
  }, [clientToken, settings, onCheckoutComplete, onTokenizationSuccess, onBeforePaymentCreate, onError]);

  // Memoize context value to prevent unnecessary re-renders
  const contextValue: PrimerCheckoutContextValue = useMemo(
    () => ({
      isReady,
      availablePaymentMethods,
      clientToken,
      settings,
    }),
    [isReady, availablePaymentMethods, clientToken, settings]
  );

  // Show error if initialization failed
  if (initError) {
    console.error('PrimerCheckoutProvider initialization error:', initError);
    // You might want to render an error UI here instead of children
    // For now, we'll still render children to allow error handling at app level
  }

  return (
    <PrimerCheckoutContext.Provider value={contextValue}>
      {children}
    </PrimerCheckoutContext.Provider>
  );
}
