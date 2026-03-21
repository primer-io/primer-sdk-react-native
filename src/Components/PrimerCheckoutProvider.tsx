import { useEffect, useRef, useState } from 'react';
import { PrimerCheckoutContext } from './internal/PrimerCheckoutContext';
import { PrimerHeadlessUniversalCheckout } from '../HeadlessUniversalCheckout/PrimerHeadlessUniversalCheckout';
import type { PrimerSettings } from '../models/PrimerSettings';
import type {
  PrimerCheckoutProviderProps,
  PrimerCheckoutContextValue,
} from '../models/components/PrimerCheckoutProviderTypes';

const initialState: PrimerCheckoutContextValue = {
  isReady: false,
  error: null,
  clientSession: null,
  availablePaymentMethods: [],
  localeData: undefined,
};

export function PrimerCheckoutProvider({
  clientToken,
  settings,
  onCheckoutComplete,
  onTokenizationSuccess,
  onBeforePaymentCreate,
  onError,
  children,
}: PrimerCheckoutProviderProps) {
  const [state, setState] = useState<PrimerCheckoutContextValue>(initialState);

  // Keep refs for all callbacks and settings so the useEffect doesn't depend on them
  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  const onCheckoutCompleteRef = useRef(onCheckoutComplete);
  onCheckoutCompleteRef.current = onCheckoutComplete;
  const onTokenizationSuccessRef = useRef(onTokenizationSuccess);
  onTokenizationSuccessRef.current = onTokenizationSuccess;
  const onBeforePaymentCreateRef = useRef(onBeforePaymentCreate);
  onBeforePaymentCreateRef.current = onBeforePaymentCreate;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  useEffect(() => {
    setState(initialState);
    let cancelled = false;

    async function init() {
      const userCallbacks = settingsRef.current?.headlessUniversalCheckoutCallbacks;

      // Only define callbacks that are actually needed — native SDK checks for presence
      // and handler-based ones (onTokenizationSuccess, onCheckoutResume, onBeforePaymentCreate)
      // will hang the flow if defined but no handler is invoked.
      const callbacks: PrimerSettings['headlessUniversalCheckoutCallbacks'] = {
        onAvailablePaymentMethodsLoad: (availablePaymentMethods) => {
          setState((prev) => ({ ...prev, availablePaymentMethods }));
          settingsRef.current?.headlessUniversalCheckoutCallbacks?.onAvailablePaymentMethodsLoad?.(
            availablePaymentMethods
          );
        },
        onClientSessionUpdate: (clientSession) => {
          setState((prev) => ({ ...prev, clientSession }));
          settingsRef.current?.headlessUniversalCheckoutCallbacks?.onClientSessionUpdate?.(clientSession);
        },
        onError: (error, checkoutData) => {
          setState((prev) => ({ ...prev, error }));
          onErrorRef.current?.(error, checkoutData);
          settingsRef.current?.headlessUniversalCheckoutCallbacks?.onError?.(error, checkoutData);
        },
      };

      if (onTokenizationSuccessRef.current || userCallbacks?.onTokenizationSuccess) {
        callbacks.onTokenizationSuccess = (paymentMethodTokenData, handler) => {
          onTokenizationSuccessRef.current?.(paymentMethodTokenData, handler);
          settingsRef.current?.headlessUniversalCheckoutCallbacks?.onTokenizationSuccess?.(
            paymentMethodTokenData,
            handler
          );
        };
      }
      if (userCallbacks?.onCheckoutResume) {
        callbacks.onCheckoutResume = (resumeToken, handler) => {
          settingsRef.current?.headlessUniversalCheckoutCallbacks?.onCheckoutResume?.(resumeToken, handler);
        };
      }
      if (onBeforePaymentCreateRef.current || userCallbacks?.onBeforePaymentCreate) {
        callbacks.onBeforePaymentCreate = (checkoutPaymentMethodData, handler) => {
          onBeforePaymentCreateRef.current?.(checkoutPaymentMethodData, handler);
          settingsRef.current?.headlessUniversalCheckoutCallbacks?.onBeforePaymentCreate?.(
            checkoutPaymentMethodData,
            handler
          );
        };
      }

      if (onCheckoutCompleteRef.current || userCallbacks?.onCheckoutComplete) {
        callbacks.onCheckoutComplete = (checkoutData) => {
          onCheckoutCompleteRef.current?.(checkoutData);
          settingsRef.current?.headlessUniversalCheckoutCallbacks?.onCheckoutComplete?.(checkoutData);
        };
      }

      if (userCallbacks?.onTokenizationStart) {
        callbacks.onTokenizationStart = (paymentMethodType) => {
          settingsRef.current?.headlessUniversalCheckoutCallbacks?.onTokenizationStart?.(paymentMethodType);
        };
      }
      if (userCallbacks?.onCheckoutPending) {
        callbacks.onCheckoutPending = (additionalInfo) => {
          settingsRef.current?.headlessUniversalCheckoutCallbacks?.onCheckoutPending?.(additionalInfo);
        };
      }
      if (userCallbacks?.onCheckoutAdditionalInfo) {
        callbacks.onCheckoutAdditionalInfo = (additionalInfo) => {
          settingsRef.current?.headlessUniversalCheckoutCallbacks?.onCheckoutAdditionalInfo?.(additionalInfo);
        };
      }
      if (userCallbacks?.onBeforeClientSessionUpdate) {
        callbacks.onBeforeClientSessionUpdate = () => {
          settingsRef.current?.headlessUniversalCheckoutCallbacks?.onBeforeClientSessionUpdate?.();
        };
      }
      if (userCallbacks?.onPreparationStart) {
        callbacks.onPreparationStart = (paymentMethodType) => {
          settingsRef.current?.headlessUniversalCheckoutCallbacks?.onPreparationStart?.(paymentMethodType);
        };
      }
      if (userCallbacks?.onPaymentMethodShow) {
        callbacks.onPaymentMethodShow = (paymentMethodType) => {
          settingsRef.current?.headlessUniversalCheckoutCallbacks?.onPaymentMethodShow?.(paymentMethodType);
        };
      }

      const mergedSettings: PrimerSettings = {
        ...settingsRef.current,
        headlessUniversalCheckoutCallbacks: callbacks,
      };

      const methods = await PrimerHeadlessUniversalCheckout.startWithClientToken(clientToken, mergedSettings);

      if (!cancelled) {
        setState((prev) => ({
          ...prev,
          isReady: true,
          availablePaymentMethods: methods,
          localeData: settingsRef.current?.localeData,
        }));
      }
    }

    init().catch((err) => {
      if (!cancelled) {
        setState((prev) => ({ ...prev, error: err }));
      }
    });

    return () => {
      cancelled = true;
      PrimerHeadlessUniversalCheckout.cleanUp();
    };
  }, [clientToken]);

  return <PrimerCheckoutContext.Provider value={state}>{children}</PrimerCheckoutContext.Provider>;
}
