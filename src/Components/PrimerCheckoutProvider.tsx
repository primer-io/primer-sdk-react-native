import { useEffect, useMemo, useRef, useState } from 'react';
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

  // Stable callbacks object created once — reads from refs at call time
  const stableCallbacks = useMemo(
    (): PrimerSettings['headlessUniversalCheckoutCallbacks'] => ({
      onAvailablePaymentMethodsLoad: (availablePaymentMethods) => {
        settingsRef.current?.headlessUniversalCheckoutCallbacks?.onAvailablePaymentMethodsLoad?.(
          availablePaymentMethods
        );
      },
      onTokenizationStart: (paymentMethodType) => {
        settingsRef.current?.headlessUniversalCheckoutCallbacks?.onTokenizationStart?.(paymentMethodType);
      },
      onTokenizationSuccess: (paymentMethodTokenData, handler) => {
        onTokenizationSuccessRef.current?.(paymentMethodTokenData, handler);
        settingsRef.current?.headlessUniversalCheckoutCallbacks?.onTokenizationSuccess?.(
          paymentMethodTokenData,
          handler
        );
      },
      onCheckoutResume: (resumeToken, handler) => {
        settingsRef.current?.headlessUniversalCheckoutCallbacks?.onCheckoutResume?.(resumeToken, handler);
      },
      onCheckoutPending: (additionalInfo) => {
        settingsRef.current?.headlessUniversalCheckoutCallbacks?.onCheckoutPending?.(additionalInfo);
      },
      onCheckoutAdditionalInfo: (additionalInfo) => {
        settingsRef.current?.headlessUniversalCheckoutCallbacks?.onCheckoutAdditionalInfo?.(additionalInfo);
      },
      onError: (error, checkoutData) => {
        setState((prev) => ({ ...prev, error }));
        onErrorRef.current?.(error, checkoutData);
        settingsRef.current?.headlessUniversalCheckoutCallbacks?.onError?.(error, checkoutData);
      },
      onCheckoutComplete: (checkoutData) => {
        onCheckoutCompleteRef.current?.(checkoutData);
        settingsRef.current?.headlessUniversalCheckoutCallbacks?.onCheckoutComplete?.(checkoutData);
      },
      onBeforeClientSessionUpdate: () => {
        settingsRef.current?.headlessUniversalCheckoutCallbacks?.onBeforeClientSessionUpdate?.();
      },
      onClientSessionUpdate: (clientSession) => {
        setState((prev) => ({ ...prev, clientSession }));
        settingsRef.current?.headlessUniversalCheckoutCallbacks?.onClientSessionUpdate?.(clientSession);
      },
      onBeforePaymentCreate: (checkoutPaymentMethodData, handler) => {
        onBeforePaymentCreateRef.current?.(checkoutPaymentMethodData, handler);
        settingsRef.current?.headlessUniversalCheckoutCallbacks?.onBeforePaymentCreate?.(
          checkoutPaymentMethodData,
          handler
        );
      },
      onPreparationStart: (paymentMethodType) => {
        settingsRef.current?.headlessUniversalCheckoutCallbacks?.onPreparationStart?.(paymentMethodType);
      },
      onPaymentMethodShow: (paymentMethodType) => {
        settingsRef.current?.headlessUniversalCheckoutCallbacks?.onPaymentMethodShow?.(paymentMethodType);
      },
    }),
    []
  );

  useEffect(() => {
    setState(initialState);
    let cancelled = false;

    async function init() {
      const mergedSettings: PrimerSettings = {
        ...settingsRef.current,
        headlessUniversalCheckoutCallbacks: stableCallbacks,
      };

      const methods = await PrimerHeadlessUniversalCheckout.startWithClientToken(clientToken, mergedSettings);

      if (!cancelled) {
        setState((prev) => ({
          ...prev,
          isReady: true,
          availablePaymentMethods: methods,
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
  }, [clientToken, stableCallbacks]);

  return <PrimerCheckoutContext.Provider value={state}>{children}</PrimerCheckoutContext.Provider>;
}
