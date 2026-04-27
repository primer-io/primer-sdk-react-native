import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PrimerCheckoutContext } from './internal/PrimerCheckoutContext';
import { ThemeContext } from './internal/theme/ThemeContext';
import { defaultDarkTokens, defaultLightTokens } from './internal/theme/tokens';
import { mergeTokens } from './internal/theme/merge';
import { PrimerHeadlessUniversalCheckout } from '../HeadlessUniversalCheckout/PrimerHeadlessUniversalCheckout';
import PrimerHeadlessUniversalCheckoutAssetsManager from '../HeadlessUniversalCheckout/Managers/AssetsManager';
import PrimerHeadlessUniversalCheckoutRawDataManager from '../HeadlessUniversalCheckout/Managers/PaymentMethodManagers/RawDataManager';
import type { PrimerSettings } from '../models/PrimerSettings';
import { PrimerError } from '../models/PrimerError';
import type { PrimerCheckoutData } from '../models/PrimerCheckoutData';
import type { PrimerRawData } from '../models/PrimerRawData';
import type { PrimerBinData } from '../models/PrimerBinData';
import type {
  PrimerCheckoutProviderProps,
  PrimerCheckoutContextValue,
  PaymentOutcome,
  CardFormState,
} from './types/PrimerCheckoutProviderTypes';
import type { CardFormErrors } from './types/CardFormTypes';
import { fmt } from './internal/debug';
import { toError } from './internal/utils/errors';

const LOG = '[PrimerCheckoutProvider]';

const assetsManager = new PrimerHeadlessUniversalCheckoutAssetsManager();

const initialCardFormState: CardFormState = {
  isValid: false,
  errors: {},
  binData: null,
  metadata: null,
  requiredFields: [],
};

interface InternalState {
  isReady: boolean;
  error: PrimerError | null;
  clientSession: PrimerCheckoutContextValue['clientSession'];
  availablePaymentMethods: PrimerCheckoutContextValue['availablePaymentMethods'];
  paymentMethodResources: PrimerCheckoutContextValue['paymentMethodResources'];
  isLoadingResources: boolean;
  resourcesError: Error | null;
  paymentOutcome: PaymentOutcome | null;
  activeMethod: string | null;
  cardFormState: CardFormState;
}

const initialState: InternalState = {
  isReady: false,
  error: null,
  clientSession: null,
  availablePaymentMethods: [],
  paymentMethodResources: [],
  isLoadingResources: false,
  resourcesError: null,
  paymentOutcome: null,
  activeMethod: null,
  cardFormState: initialCardFormState,
};

/**
 * Native `onCheckoutComplete` fires for every terminal checkout, including
 * FAILED ones — so we inspect `payment.status` to pick the result screen.
 */
function buildPaymentOutcome(checkoutData: PrimerCheckoutData): PaymentOutcome {
  const payment = checkoutData?.payment;
  if (payment?.status !== 'FAILED') {
    return { status: 'success', data: checkoutData };
  }
  const errorCode = payment.paymentFailureReason ?? 'payment-failed';
  const description = payment.id ? `Payment ${payment.id} failed` : 'Payment failed';
  return {
    status: 'error',
    error: new PrimerError('payment-failed', errorCode, description, undefined, undefined),
    data: checkoutData,
  };
}

/** Map native validation errors to per-field typed errors the UI can render. */
function parseValidationErrors(errors: PrimerError[] | undefined): CardFormErrors {
  const fieldErrors: CardFormErrors = {};
  if (!errors) return fieldErrors;
  for (const error of errors) {
    const id = (error.errorId ?? '').toLowerCase();
    const description = error.description ?? error.message ?? 'Invalid';
    if (id.includes('card') && id.includes('number')) {
      fieldErrors.cardNumber = description;
    } else if (id.includes('expir') || id.includes('expiry')) {
      fieldErrors.expiryDate = description;
    } else if (id.includes('cvv') || id.includes('cvc')) {
      fieldErrors.cvv = description;
    } else if (id.includes('cardholder') || id.includes('name')) {
      fieldErrors.cardholderName = description;
    }
  }
  return fieldErrors;
}

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
  const [state, setState] = useState<InternalState>(initialState);

  const [lightTokens] = useState(() => mergeTokens(defaultLightTokens, theme?.light));
  const [darkTokens] = useState(() => mergeTokens(defaultDarkTokens, theme?.dark));

  // Refs keep init useEffect deps to [clientToken] only.
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

  // Snapshot of current state for stable callbacks that need activeMethod.
  const stateRef = useRef(state);
  stateRef.current = state;

  // Native manager. Lifecycle is driven by `state.activeMethod` — the method the user
  // picked on the selection screen — so it survives the card-form view mount/unmount.
  const managerRef = useRef<PrimerHeadlessUniversalCheckoutRawDataManager | null>(null);
  // Stashed so `retry()` can re-submit without needing the view to re-enter the form.
  // Compensates for an iOS native bug (see TODO in `retry`), not a JS-side concern.
  const lastRawDataRef = useRef<PrimerRawData | null>(null);
  const lastManagerCallbacksRef = useRef<{
    onValidation: (isValid: boolean, errors: PrimerError[] | undefined) => void;
    onBinDataChange: (binData: PrimerBinData) => void;
    onMetadataChange: (metadata: unknown) => void;
  } | null>(null);

  // -----------------------------------------------------------------------
  // Session init — create headless checkout + wire session-level callbacks.
  // -----------------------------------------------------------------------
  useEffect(() => {
    setState(initialState);
    let cancelled = false;

    async function init() {
      const userCallbacks = settingsRef.current?.headlessUniversalCheckoutCallbacks;

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
          setState((prev) => {
            // Init-time errors → `error`. Payment-time errors → `paymentOutcome`.
            if (prev.isReady) {
              return {
                ...prev,
                paymentOutcome: { status: 'error', error, data: checkoutData ?? null },
              };
            }
            return { ...prev, error };
          });
          onErrorRef.current?.(error, checkoutData);
          settingsRef.current?.headlessUniversalCheckoutCallbacks?.onError?.(error, checkoutData);
        },
        // Always-subscribed so paymentOutcome fires regardless of merchant callbacks.
        onCheckoutComplete: (checkoutData) => {
          // Native fires onCheckoutComplete for any finished checkout — including
          // FAILED payments — so we have to read `payment.status` to decide which
          // result screen to show. Backend statuses: SUCCESS | FAILED | PENDING.
          setState((prev) => ({
            ...prev,
            paymentOutcome: buildPaymentOutcome(checkoutData),
          }));
          onCheckoutCompleteRef.current?.(checkoutData);
          settingsRef.current?.headlessUniversalCheckoutCallbacks?.onCheckoutComplete?.(checkoutData);
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
          paymentMethodResources: [],
          isLoadingResources: true,
          resourcesError: null,
        }));
      }
    }

    init().catch((err) => {
      console.error(`${LOG} init failed ${fmt(err)}`);
      if (!cancelled) {
        setState((prev) => ({ ...prev, error: err }));
      }
    });

    return () => {
      cancelled = true;
      PrimerHeadlessUniversalCheckout.cleanUp();
    };
  }, [clientToken]);

  // -----------------------------------------------------------------------
  // Payment method resource fetch — re-runs whenever the set of available
  // method types changes (init, or onAvailablePaymentMethodsLoad firing post-ready).
  // -----------------------------------------------------------------------
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
        console.warn(`${LOG} resources load failed ${fmt(err)}`);
        if (!cancelled) {
          setState((prev) => ({ ...prev, isLoadingResources: false, resourcesError: toError(err) }));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [state.isReady, methodTypesSignature]);

  // -----------------------------------------------------------------------
  // Raw-data manager lifecycle.
  //
  // The effect creates a manager for the current `activeMethod` and tears it down in
  // cleanup. Because `activeMethod` is set by the method-selection screen (user intent)
  // rather than the card-form view's mount/unmount, the manager survives nav transitions
  // through processing/success/error — exactly when retry needs it alive.
  //
  // The single cleanup handles all three teardown paths:
  //   • method change     — effect re-runs, cleanup destroys old, body builds new
  //   • session end       — `isReady` or `activeMethod` flips, effect re-runs, cleanup destroys
  //   • provider unmount  — final cleanup destroys
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (!state.isReady || !state.activeMethod) {
      return;
    }

    const method = state.activeMethod;
    let cancelled = false;
    const m = new PrimerHeadlessUniversalCheckoutRawDataManager();
    managerRef.current = m;

    const callbacks = {
      onValidation: (isValid: boolean, errors: PrimerError[] | undefined) => {
        const parsed = parseValidationErrors(errors);
        setState((prev) => ({
          ...prev,
          cardFormState: { ...prev.cardFormState, isValid, errors: parsed },
        }));
      },
      onBinDataChange: (binData: PrimerBinData) => {
        setState((prev) => ({
          ...prev,
          cardFormState: { ...prev.cardFormState, binData },
        }));
      },
      onMetadataChange: (metadata: unknown) => {
        setState((prev) => ({
          ...prev,
          cardFormState: { ...prev.cardFormState, metadata },
        }));
      },
    };
    lastManagerCallbacksRef.current = callbacks;

    (async () => {
      try {
        await m.configure({ paymentMethodType: method, ...callbacks });
        if (cancelled) return;
        const requiredFields = await m.getRequiredInputElementTypes();
        if (cancelled) return;
        setState((prev) => ({
          ...prev,
          cardFormState: { ...prev.cardFormState, requiredFields },
        }));
      } catch (err) {
        console.error(`${LOG} manager configure failed ${fmt(err)}`);
      }
    })();

    return () => {
      cancelled = true;
      m.cleanUp().catch((err) => console.warn(`${LOG} manager cleanUp failed ${fmt(err)}`));
      m.removeAllListeners();
      if (managerRef.current === m) {
        managerRef.current = null;
      }
      lastManagerCallbacksRef.current = null;
      setState((prev) => ({ ...prev, cardFormState: initialCardFormState }));
    };
  }, [state.activeMethod, state.isReady]);

  // -----------------------------------------------------------------------
  // Actions — stable identities.
  // -----------------------------------------------------------------------
  const setActiveMethod = useCallback((method: string | null) => {
    setState((prev) => (prev.activeMethod === method ? prev : { ...prev, activeMethod: method }));
  }, []);

  const setRawData = useCallback(async (data: PrimerRawData) => {
    lastRawDataRef.current = data;
    const m = managerRef.current;
    if (!m) {
      console.warn(`${LOG} setRawData: no manager (activeMethod=${stateRef.current.activeMethod})`);
      return;
    }
    try {
      await m.setRawData(data);
    } catch (err) {
      console.warn(`${LOG} setRawData failed ${fmt(err)}`);
      throw err;
    }
  }, []);

  const submit = useCallback(async () => {
    const m = managerRef.current;
    if (!m) {
      console.warn(`${LOG} submit: no manager`);
      return;
    }
    await m.submit();
  }, []);

  const retry = useCallback(async () => {
    const method = stateRef.current.activeMethod;
    const m = managerRef.current;
    if (!method || !m) {
      console.warn(`${LOG} retry: no active method or manager ${fmt({ method, hasManager: !!m })}`);
      return;
    }
    // TODO(iOS native fix): ios .../RawDataManager.swift:237 nullifies its delegate on
    // successful tokenization, so any post-tokenize failure would silently drop subsequent
    // submit() outcomes. Reconfiguring here rebuilds the delegate binding. Harmless on
    // Android. Remove the reconfigure once the iOS SDK stops nullifying.
    try {
      // Re-pass the original callbacks so the JS-wrapper's listeners get re-registered.
      // Otherwise native would emit onValidation/onBinDataChange/onMetadataChange during
      // the retry attempt with no JS-side subscribers → RN warns "no listeners registered".
      const callbacks = lastManagerCallbacksRef.current;
      await m.configure(callbacks ? { paymentMethodType: method, ...callbacks } : { paymentMethodType: method });
      if (lastRawDataRef.current) {
        await m.setRawData(lastRawDataRef.current);
      }
      // Clear the previous outcome so the transitioner fires for the new attempt.
      setState((prev) => (prev.paymentOutcome === null ? prev : { ...prev, paymentOutcome: null }));
      await m.submit();
    } catch (err) {
      console.error(`${LOG} retry failed ${fmt(err)}`);
      throw err;
    }
  }, []);

  const clearPaymentOutcome = useCallback(() => {
    setState((prev) => (prev.paymentOutcome === null ? prev : { ...prev, paymentOutcome: null }));
  }, []);

  const contextValue = useMemo<PrimerCheckoutContextValue>(
    () => ({
      isReady: state.isReady,
      error: state.error,
      clientSession: state.clientSession,
      availablePaymentMethods: state.availablePaymentMethods,
      paymentMethodResources: state.paymentMethodResources,
      isLoadingResources: state.isLoadingResources,
      resourcesError: state.resourcesError,
      settings: settingsRef.current,
      paymentOutcome: state.paymentOutcome,
      activeMethod: state.activeMethod,
      cardFormState: state.cardFormState,
      setActiveMethod,
      setRawData,
      submit,
      retry,
      clearPaymentOutcome,
    }),
    [state, setActiveMethod, setRawData, submit, retry, clearPaymentOutcome]
  );

  return (
    <ThemeContext.Provider value={{ lightTokens, darkTokens }}>
      <PrimerCheckoutContext.Provider value={contextValue}>{children}</PrimerCheckoutContext.Provider>
    </ThemeContext.Provider>
  );
}
