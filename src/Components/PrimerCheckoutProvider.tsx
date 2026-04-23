import { useEffect, useMemo, useRef, useState } from 'react';
import { PrimerCheckoutContext } from './internal/PrimerCheckoutContext';
import { ThemeContext } from './internal/theme/ThemeContext';
import { defaultDarkTokens, defaultLightTokens } from './internal/theme/tokens';
import { mergeTokens } from './internal/theme/merge';
import { PrimerHeadlessUniversalCheckout } from '../HeadlessUniversalCheckout/PrimerHeadlessUniversalCheckout';
import PrimerHeadlessUniversalCheckoutAssetsManager from '../HeadlessUniversalCheckout/Managers/AssetsManager';
import { toError } from './internal/utils/errors';
import type { PrimerSettings } from '../models/PrimerSettings';
import type { PrimerCheckoutProviderProps, PrimerCheckoutContextValue } from './types/PrimerCheckoutProviderTypes';

const assetsManager = new PrimerHeadlessUniversalCheckoutAssetsManager();

const initialState: PrimerCheckoutContextValue = {
  isReady: false,
  error: null,
  clientSession: null,
  availablePaymentMethods: [],
  paymentMethodResources: [],
  isLoadingResources: false,
  resourcesError: null,
};

export function PrimerCheckoutProvider({
  clientToken,
  settings,
  theme,
  onCheckoutComplete,
  onTokenizationSuccess,
  onBeforePaymentCreate,
  onError,
  children,
}: PrimerCheckoutProviderProps) {
  const [state, setState] = useState<PrimerCheckoutContextValue>(initialState);

  const [lightTokens] = useState(() => mergeTokens(defaultLightTokens, theme?.light));
  const [darkTokens] = useState(() => mergeTokens(defaultDarkTokens, theme?.dark));

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
          // Flip isLoadingResources: true atomically with the new list so the hook
          // doesn't render for one frame with new methods + stale resources.
          // The fetch effect picks it up on the next tick via methodTypesSignature.
          setState((prev) => ({
            ...prev,
            availablePaymentMethods,
            isLoadingResources: true,
            resourcesError: null,
          }));
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
        // Seed isLoadingResources atomically with isReady so consumers don't see a
        // brief "ready but no resources loading" window before the fetch effect runs.
        setState((prev) => ({
          ...prev,
          isReady: true,
          availablePaymentMethods: methods,
          isLoadingResources: true,
          resourcesError: null,
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

  // Re-fetch payment method resources whenever the set of available method types changes.
  const methodTypesSignature = useMemo(
    () =>
      state.availablePaymentMethods
        .map((m) => m.paymentMethodType)
        .sort()
        .join('|'),
    [state.availablePaymentMethods]
  );

  useEffect(() => {
    if (!state.isReady) return;

    // No methods configured → nothing to fetch. Clear the loading flag so
    // consumers don't hang on `isLoading: true` forever (init sets it
    // optimistically before we know the method list is empty).
    if (state.availablePaymentMethods.length === 0) {
      setState((prev) =>
        prev.isLoadingResources || prev.paymentMethodResources.length > 0
          ? { ...prev, paymentMethodResources: [], isLoadingResources: false }
          : prev
      );
      return;
    }

    let cancelled = false;
    setState((prev) =>
      prev.isLoadingResources && prev.resourcesError === null
        ? prev
        : { ...prev, isLoadingResources: true, resourcesError: null }
    );

    assetsManager
      .getPaymentMethodResources()
      .then((resources) => {
        if (!cancelled) {
          setState((prev) => ({ ...prev, paymentMethodResources: resources, isLoadingResources: false }));
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setState((prev) => ({ ...prev, isLoadingResources: false, resourcesError: toError(err) }));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [state.isReady, methodTypesSignature]);

  return (
    <ThemeContext.Provider value={{ lightTokens, darkTokens }}>
      <PrimerCheckoutContext.Provider value={state}>{children}</PrimerCheckoutContext.Provider>
    </ThemeContext.Provider>
  );
}
