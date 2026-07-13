import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform } from 'react-native';

import PrimerHeadlessUniversalCheckoutAssetsManager from '../HeadlessUniversalCheckout/Managers/AssetsManager';
import PrimerHeadlessUniversalCheckoutRawDataManager from '../HeadlessUniversalCheckout/Managers/PaymentMethodManagers/RawDataManager';
import PrimerHeadlessUniversalCheckoutPaymentMethodNativeUIManager from '../HeadlessUniversalCheckout/Managers/PaymentMethodManagers/NativeUIManager';
import { PrimerHeadlessUniversalCheckoutComponentWithRedirectManager } from '../HeadlessUniversalCheckout/Managers/PaymentMethodManagers/ComponentWithRedirectManager';
import { PrimerHeadlessUniversalCheckoutKlarnaManager } from '../HeadlessUniversalCheckout/Managers/PaymentMethodManagers/KlarnaManager';
import PrimerHeadlessUniversalCheckoutVaultManager from '../HeadlessUniversalCheckout/Managers/VaultManager';
import { PrimerHeadlessUniversalCheckout } from '../HeadlessUniversalCheckout/PrimerHeadlessUniversalCheckout';
import { PrimerError } from '../models/PrimerError';
import { PrimerAnalytics } from './analytics';
import { PrimerSessionIntent } from '../models/PrimerSessionIntent';
import { fmt } from './internal/debug';
import { PrimerCheckoutContext } from './internal/PrimerCheckoutContext';
import { mergeTokens } from './internal/theme/merge';
import { ThemeContext } from './internal/theme/ThemeContext';
import { defaultDarkTokens, defaultLightTokens } from './internal/theme/tokens';
import { toError } from './internal/utils/errors';
import { GOOGLE_PAY, isGooglePaySupported } from './internal/googlePay';
import { APPLE_PAY, isApplePaySupported } from './internal/applePay';
import { titleCaseFromType } from './internal/utils/formatting';
import { classifyVault } from './types/VaultedPaymentMethodTypes';

import type { PrimerSettings } from '../models/PrimerSettings';
import type { PrimerCheckoutData } from '../models/PrimerCheckoutData';
import type { PrimerCardData, PrimerRawData } from '../models/PrimerRawData';
import type { PrimerAddress } from '../models/PrimerClientSession';
import type { PrimerBinData } from '../models/PrimerBinData';
import type { PrimerVaultedPaymentMethod } from '../models/PrimerVaultedPaymentMethod';
import type { PrimerVaultedPaymentMethodAdditionalData } from '../models/PrimerVaultedPaymentMethodAdditionalData';
import type {
  PrimerCheckoutProviderProps,
  PrimerCheckoutContextValue,
  PaymentOutcome,
  CardFormState,
} from './types/PrimerCheckoutProviderTypes';
import type { CardFormErrors, CardFormField } from './types/CardFormTypes';
import type { CardNetworkId } from './internal/cardNetwork';
import type { BanksComponent } from '../HeadlessUniversalCheckout/Managers/PaymentMethodManagers/ComponentWithRedirectManager';
import type { KlarnaComponent } from '../HeadlessUniversalCheckout/Managers/PaymentMethodManagers/KlarnaManager';
import type { BanksStep } from '../models/banks/BanksSteps';
import type { IssuingBank } from '../models/IssuingBank';
import type { KlarnaPaymentCategory } from '../models/klarna/KlarnaPaymentCategory';
import type { KlarnaPaymentStep } from '../models/klarna/KlarnaPaymentSteps';

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
  acceptedCardNetworks: PrimerCheckoutContextValue['acceptedCardNetworks'];
  availablePaymentMethods: PrimerCheckoutContextValue['availablePaymentMethods'];
  paymentMethodResources: PrimerCheckoutContextValue['paymentMethodResources'];
  isLoadingResources: boolean;
  resourcesError: Error | null;
  paymentOutcome: PaymentOutcome | null;
  nativeUiInFlightType: string | null;
  activeMethod: string | null;
  cardFormState: CardFormState;
  /** Active COMPONENT_WITH_REDIRECT (bank-selection) method, or null. Drives the banks lifecycle. */
  activeBanksMethod: string | null;
  banks: IssuingBank[];
  selectedBankId: string | null;
  isBanksLoading: boolean;
  /** Active KLARNA method, or null. Drives the Klarna component lifecycle. */
  activeKlarnaMethod: string | null;
  klarnaPaymentCategories: KlarnaPaymentCategory[];
  selectedKlarnaCategoryId: string | null;
  isKlarnaViewLoaded: boolean;
  isKlarnaLoading: boolean;
  vaultedMethods: PrimerVaultedPaymentMethod[];
  vaultedIconUrisById: Record<string, string | undefined>;
  vaultedNamesById: Record<string, string | undefined>;
  isLoadingVaulted: boolean;
  vaultedError: Error | null;
  activeVaultedMethodId: string | null;
  vaultDisplayOverride: 'expanded' | null;
  // Shopper-picked co-badged card network. Null until the user makes a
  // selection in the popover. Persists across re-renders / hook callers.
  selectedCardNetwork: CardNetworkId | null;
  requiresVaultedCardCvv: boolean;
  cvvInputVisible: boolean;
}

const initialState: InternalState = {
  isReady: false,
  error: null,
  clientSession: null,
  acceptedCardNetworks: null,
  availablePaymentMethods: [],
  paymentMethodResources: [],
  isLoadingResources: false,
  resourcesError: null,
  paymentOutcome: null,
  nativeUiInFlightType: null,
  activeMethod: null,
  cardFormState: initialCardFormState,
  activeBanksMethod: null,
  banks: [],
  selectedBankId: null,
  isBanksLoading: false,
  activeKlarnaMethod: null,
  klarnaPaymentCategories: [],
  selectedKlarnaCategoryId: null,
  isKlarnaViewLoaded: false,
  isKlarnaLoading: false,
  vaultedMethods: [],
  vaultedIconUrisById: {},
  vaultedNamesById: {},
  isLoadingVaulted: false,
  vaultedError: null,
  activeVaultedMethodId: null,
  selectedCardNetwork: null,
  vaultDisplayOverride: null,
  requiresVaultedCardCvv: false,
  cvvInputVisible: false,
};

// Cleared on every terminal payment event so no per-method in-flight flag outlives an outcome.
const PAYMENT_ATTEMPT_RESET = {
  nativeUiInFlightType: null,
  isBanksLoading: false,
  isKlarnaLoading: false,
} as const;

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

// Native validation errors carry a free-form `errorId` like `invalid-card-number`. The table
// below routes each id to a `CardFormField`. First match wins. When native gains a typed
// `inputElementType` field on the error object, swap this for a direct enum-keyed lookup.
const ERROR_FIELD_TABLE: ReadonlyArray<{ test: (id: string) => boolean; field: CardFormField }> = [
  { test: (id) => id.includes('card') && id.includes('number'), field: 'cardNumber' },
  { test: (id) => id.includes('expir'), field: 'expiryDate' },
  { test: (id) => id.includes('cvv') || id.includes('cvc'), field: 'cvv' },
  { test: (id) => id.includes('cardholder') || id.includes('card_holder'), field: 'cardholderName' },
];

/** Map native validation errors to per-field typed errors the UI can render. */
function parseValidationErrors(errors: PrimerError[] | undefined): CardFormErrors {
  const fieldErrors: CardFormErrors = {};
  if (!errors) return fieldErrors;
  for (const error of errors) {
    const id = (error.errorId ?? '').toLowerCase();
    const description = error.description ?? error.message ?? 'Invalid';
    const match = ERROR_FIELD_TABLE.find((entry) => entry.test(id));
    if (match) fieldErrors[match.field] = description;
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

  // Analytics session state (reset per client token): SELECTION dedup + outcome correlation.
  const selectionSentRef = useRef<Set<string>>(new Set());
  const lastAttemptedMethodRef = useRef<string | null>(null);
  const hadFailureRef = useRef(false);
  const hadSuccessRef = useRef(false);
  const becameReadyRef = useRef(false);

  const trackSelection = useCallback((paymentMethod: string) => {
    if (selectionSentRef.current.has(paymentMethod)) return;
    selectionSentRef.current.add(paymentMethod);
    void PrimerAnalytics.trackEvent('PAYMENT_METHOD_SELECTION', { paymentMethod });
  }, []);

  // Attempt-start events shared by every pay path: REATTEMPTED (after failure), optional SUBMITTED, PROCESSING.
  const trackAttemptStart = useCallback((paymentMethod: string, options: { submitted: boolean }) => {
    lastAttemptedMethodRef.current = paymentMethod;
    if (hadFailureRef.current) {
      hadFailureRef.current = false;
      void PrimerAnalytics.trackEvent('PAYMENT_REATTEMPTED', { paymentMethod });
    }
    if (options.submitted) {
      void PrimerAnalytics.trackEvent('PAYMENT_SUBMITTED', { paymentMethod });
    }
    void PrimerAnalytics.trackEvent('PAYMENT_PROCESSING_STARTED', { paymentMethod });
  }, []);

  // Native manager. Lifecycle is driven by `state.activeMethod` — the method the user
  // picked on the selection screen — so it survives the card-form view mount/unmount.
  const managerRef = useRef<PrimerHeadlessUniversalCheckoutRawDataManager | null>(null);
  // Bank-selection (COMPONENT_WITH_REDIRECT) manager + its component. Lifecycle driven by
  // `state.activeBanksMethod`, mirroring the raw-data manager above.
  const banksManagerRef = useRef<PrimerHeadlessUniversalCheckoutComponentWithRedirectManager | null>(null);
  const banksComponentRef = useRef<BanksComponent | null>(null);
  // Klarna (KLARNA) manager + component. Lifecycle driven by `state.activeKlarnaMethod`.
  const klarnaManagerRef = useRef<PrimerHeadlessUniversalCheckoutKlarnaManager | null>(null);
  const klarnaComponentRef = useRef<KlarnaComponent | null>(null);
  // finalizePayment() is issued at most once per authorize (onStep auto-finalize vs the hook's finalize()).
  const klarnaFinalizeIssuedRef = useRef(false);
  // Vault manager is lazy — created on first vault fetch, reused across client-session updates,
  // cleared on session teardown alongside `PrimerHeadlessUniversalCheckout.cleanUp()`.
  const vaultManagerRef = useRef<PrimerHeadlessUniversalCheckoutVaultManager | null>(null);
  // Stashed so `retry()` can re-submit without needing the view to re-enter the form.
  // Compensates for an iOS native bug (see the iOS-workaround note in `retry`), not a JS-side concern.
  const lastRawDataRef = useRef<PrimerRawData | null>(null);
  // Shopper's co-badge pick. Ref (not just state) so `setRawData` reads it synchronously
  // when merging it into each keystroke's payload — keeps the pick sticky without
  // native-side state.
  const selectedCardNetworkRef = useRef<CardNetworkId | null>(null);
  const lastManagerCallbacksRef = useRef<{
    onValidation: (isValid: boolean, errors: PrimerError[] | undefined) => void;
    onBinDataChange: (binData: PrimerBinData) => void;
    onMetadataChange: (metadata: unknown) => void;
  } | null>(null);
  // Marks the manager that `retry()` currently holds. Effect cleanup defers
  // teardown of this manager so an in-flight submit/configure isn't destroyed.
  const retryingManagerRef = useRef<PrimerHeadlessUniversalCheckoutRawDataManager | null>(null);
  const pendingCleanupRef = useRef<PrimerHeadlessUniversalCheckoutRawDataManager | null>(null);

  // -----------------------------------------------------------------------
  // Session init — create headless checkout + wire session-level callbacks.
  // -----------------------------------------------------------------------
  useEffect(() => {
    setState(initialState);
    selectionSentRef.current = new Set();
    lastAttemptedMethodRef.current = null;
    hadFailureRef.current = false;
    hadSuccessRef.current = false;
    becameReadyRef.current = false;
    let cancelled = false;
    const initStartedAt = Date.now();

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
            // Init-time errors → `error`. Payment-time errors → `paymentOutcome` → error
            // screen. This includes Google Pay's 'payment-cancelled', surfaced as a failure.
            if (prev.isReady) {
              return {
                ...prev,
                ...PAYMENT_ATTEMPT_RESET,
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
            ...PAYMENT_ATTEMPT_RESET,
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
        // Setup must run after native init — Android's bridge resolves the SDK DI container here.
        try {
          await PrimerAnalytics.setup(clientToken);
          void PrimerAnalytics.trackEvent('SDK_INIT_START');
          void PrimerAnalytics.trackEvent('SDK_INIT_END');
          void PrimerAnalytics.sendLog(
            'Checkout components initialized',
            'checkout-initialized',
            Date.now() - initStartedAt
          );
        } catch (analyticsErr) {
          console.warn(`${LOG} analytics setup failed ${fmt(analyticsErr)}`);
        }

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
        becameReadyRef.current = true;
        void PrimerAnalytics.trackEvent('CHECKOUT_FLOW_STARTED');
      }
    }

    init().catch((err) => {
      console.error(`${LOG} init failed ${fmt(err)}`);
      // Best effort: setup may not have run yet (Android drops pre-init logs; iOS still ships).
      const primerErr = err as PrimerError | Error;
      void PrimerAnalytics.setup(clientToken)
        .then(() =>
          PrimerAnalytics.sendErrorLog(
            'Checkout initialization failed',
            'checkout-init-failed',
            'description' in primerErr ? primerErr.description : primerErr.message,
            primerErr instanceof Error ? primerErr.stack : undefined
          )
        )
        .catch(() => {});
      if (!cancelled) {
        setState((prev) => ({ ...prev, error: err }));
      }
    });

    return () => {
      cancelled = true;
      // Session ends without a completed payment (unmount or token change) → funnel exit.
      if (becameReadyRef.current && !hadSuccessRef.current) {
        void PrimerAnalytics.trackEvent('PAYMENT_FLOW_EXITED');
      }
      // Vault manager is tied to the native session — let the next session recreate it.
      vaultManagerRef.current = null;
      void PrimerHeadlessUniversalCheckout.cleanUp();
    };
  }, [clientToken]);

  // Single choke point: every pay path lands in `paymentOutcome`, so SUCCESS/FAILURE emit once per attempt.
  useEffect(() => {
    const outcome = state.paymentOutcome;
    if (outcome === null) return;
    const paymentMethod = lastAttemptedMethodRef.current ?? 'UNKNOWN';
    if (outcome.status === 'success') {
      // PENDING reaches the 'success' outcome but isn't a completed payment — don't count it.
      if (outcome.data?.payment?.status === 'PENDING') return;
      hadSuccessRef.current = true;
      void PrimerAnalytics.trackEvent('PAYMENT_SUCCESS', {
        paymentMethod,
        paymentId: outcome.data?.payment?.id ?? 'unknown',
      });
      return;
    }
    hadFailureRef.current = true;
    const paymentId = outcome.data?.payment?.id;
    void PrimerAnalytics.trackEvent('PAYMENT_FAILURE', {
      paymentMethod,
      ...(paymentId ? { paymentId } : null),
    });
    void PrimerAnalytics.sendErrorLog(
      'Payment failed',
      'failed-payment',
      outcome.error?.description ?? outcome.error?.message
    );
  }, [state.paymentOutcome]);

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

  // Shared fetch + icon-resolve, used by both the initial-load effect and the post-delete refresh.
  const refreshVaultedMethods = useCallback(async (): Promise<{
    methods: PrimerVaultedPaymentMethod[];
    iconMap: Record<string, string | undefined>;
    nameMap: Record<string, string | undefined>;
  }> => {
    if (!vaultManagerRef.current) {
      const vm = new PrimerHeadlessUniversalCheckoutVaultManager();
      await vm.configure();
      vaultManagerRef.current = vm;
      let requiresCvv = false;
      try {
        requiresCvv = await vm.requiresVaultedCardCvv();
      } catch (cvvErr) {
        console.warn(`${LOG} requiresVaultedCardCvv failed; defaulting to false ${fmt(cvvErr)}`);
      }
      setState((prev) =>
        prev.requiresVaultedCardCvv === requiresCvv ? prev : { ...prev, requiresVaultedCardCvv: requiresCvv }
      );
    }
    const methods = await vaultManagerRef.current.fetchVaultedPaymentMethods();
    const entries = await Promise.all(
      methods.map(async (m) => {
        const kind = classifyVault(m);
        try {
          if (kind === 'card') {
            const network = m.paymentInstrumentData?.network;
            const iconUri = network ? await assetsManager.getCardNetworkImageURL(network) : undefined;
            return [m.id, { iconUri, name: undefined }] as const;
          }
          const resource = await assetsManager.getPaymentMethodResource(m.paymentMethodType);
          const logo = 'paymentMethodLogo' in resource ? resource.paymentMethodLogo : undefined;
          const iconUri = logo?.colored ?? logo?.light ?? logo?.dark;
          const name = resource.paymentMethodName || titleCaseFromType(m.paymentMethodType);
          return [m.id, { iconUri, name }] as const;
        } catch (resolveErr) {
          console.warn(`${LOG} vault asset resolve failed for ${m.paymentMethodType} ${fmt(resolveErr)}`);
          const name = kind === 'card' ? undefined : titleCaseFromType(m.paymentMethodType);
          return [m.id, { iconUri: undefined, name }] as const;
        }
      })
    );
    const iconMap: Record<string, string | undefined> = {};
    const nameMap: Record<string, string | undefined> = {};
    for (const [id, { iconUri, name }] of entries) {
      iconMap[id] = iconUri;
      nameMap[id] = name;
    }
    return { methods, iconMap, nameMap };
  }, []);

  // -----------------------------------------------------------------------
  // Vaulted payment methods — lazy-configured after `isReady`, re-fetched on
  // every client-session update. Brand-icon URIs are resolved at fetch time so
  // the row can render synchronously.
  // -----------------------------------------------------------------------
  useEffect(() => {
    // Key on `isReady` only. Native's `onClientSessionUpdate` only fires on session
    // *mutation*, not on initial load, so waiting for `clientSession` would hang forever
    // in the common case.
    if (!state.isReady) return;

    let cancelled = false;
    setState((prev) =>
      prev.isLoadingVaulted && prev.vaultedError === null
        ? prev
        : { ...prev, isLoadingVaulted: true, vaultedError: null }
    );

    void (async () => {
      try {
        const { methods, iconMap, nameMap } = await refreshVaultedMethods();
        if (cancelled) return;
        setState((prev) => ({
          ...prev,
          vaultedMethods: methods,
          vaultedIconUrisById: iconMap,
          vaultedNamesById: nameMap,
          isLoadingVaulted: false,
        }));
      } catch (err) {
        console.warn(`${LOG} vault fetch failed ${fmt(err)}`);
        if (!cancelled) {
          const vaultedError = toError(err);
          setState((prev) => ({
            ...prev,
            isLoadingVaulted: false,
            vaultedError,
          }));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [state.isReady, state.clientSession, refreshVaultedMethods]);

  // Fetch the merchant's accepted card networks once the session is ready, and
  // re-fetch when the client session mutates. Cached in context so chip-row consumers
  // read synchronously.
  useEffect(() => {
    if (!state.isReady) return;
    let cancelled = false;
    assetsManager
      .getOrderedAllowedCardNetworks()
      .then((networks) => {
        if (cancelled) return;
        setState((prev) => {
          if (networks === null) {
            return prev.acceptedCardNetworks === null ? prev : { ...prev, acceptedCardNetworks: null };
          }
          const same =
            prev.acceptedCardNetworks?.length === networks.length &&
            prev.acceptedCardNetworks.every((n, i) => n === networks[i]);
          return same ? prev : { ...prev, acceptedCardNetworks: networks };
        });
      })
      .catch((err) => {
        console.warn(`${LOG} getOrderedAllowedCardNetworks failed ${fmt(err)}`);
        if (cancelled) return;
        setState((prev) => (prev.acceptedCardNetworks === null ? prev : { ...prev, acceptedCardNetworks: null }));
      });
    return () => {
      cancelled = true;
    };
  }, [state.isReady, state.clientSession]);

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
    const manager = new PrimerHeadlessUniversalCheckoutRawDataManager();
    managerRef.current = manager;

    // Once per card-form session: first invalid → valid transition.
    let detailsEnteredFired = false;

    const callbacks = {
      onValidation: (isValid: boolean, errors: PrimerError[] | undefined) => {
        if (isValid && !detailsEnteredFired) {
          detailsEnteredFired = true;
          void PrimerAnalytics.trackEvent('PAYMENT_DETAILS_ENTERED', { paymentMethod: method });
        }
        const parsed = parseValidationErrors(errors);
        setState((prev) => ({
          ...prev,
          cardFormState: { ...prev.cardFormState, isValid, errors: parsed },
        }));
      },
      onBinDataChange: (binData: PrimerBinData) => {
        // A PAN edit can change the detected networks. If the shopper's co-badge
        // pick is no longer among them, drop it and re-send the last payload
        // without it — otherwise a stale `preferredNetwork` could reach
        // tokenization (e.g. paste a new PAN and submit without another keystroke).
        const pick = selectedCardNetworkRef.current;
        const detected = binData.preferred ? [binData.preferred, ...binData.alternatives] : binData.alternatives;
        const pickIsStale = pick !== null && !detected.some((n) => n.network === pick);
        if (pickIsStale) {
          console.log(`${LOG} pick ${pick} not among detected networks — clearing`);
          selectedCardNetworkRef.current = null;
          const last = lastRawDataRef.current;
          if (last && 'cardNetwork' in last) {
            const stripped: PrimerCardData = { ...(last as PrimerCardData) };
            delete stripped.cardNetwork;
            void setRawData(stripped).catch((err) =>
              console.warn(`${LOG} re-send after pick clear failed ${fmt(err)}`)
            );
          }
        }
        setState((prev) => ({
          ...prev,
          cardFormState: { ...prev.cardFormState, binData },
          ...(pickIsStale ? { selectedCardNetwork: null } : null),
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

    void (async () => {
      try {
        await manager.configure({ paymentMethodType: method, ...callbacks });
        if (cancelled) return;
        const requiredFields = await manager.getRequiredInputElementTypes();
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
      // If retry() holds this manager, defer destroy until retry's finally
      // runs — otherwise we'd cleanUp() between its awaited configure/submit.
      if (retryingManagerRef.current === manager) {
        pendingCleanupRef.current = manager;
        return;
      }
      manager.cleanUp().catch((err) => console.warn(`${LOG} manager cleanUp failed ${fmt(err)}`));
      manager.removeAllListeners();
      if (managerRef.current === manager) {
        managerRef.current = null;
      }
      lastManagerCallbacksRef.current = null;
      selectedCardNetworkRef.current = null;
      setState((prev) => ({ ...prev, cardFormState: initialCardFormState, selectedCardNetwork: null }));
    };
  }, [state.activeMethod, state.isReady]);

  // -----------------------------------------------------------------------
  // Actions — stable identities.
  // -----------------------------------------------------------------------
  const setActiveMethod = useCallback(
    (method: string | null) => {
      if (method !== null) {
        trackSelection(method);
      }
      setState((prev) => (prev.activeMethod === method ? prev : { ...prev, activeMethod: method }));
    },
    [trackSelection]
  );

  const setRawData = useCallback(async (data: PrimerRawData) => {
    // Keep the co-badge pick sticky: merge it into every card-data payload so it
    // survives keystroke updates (native holds no selection state). The merged
    // payload is what lands in `lastRawDataRef`, so `retry()` re-sends it too.
    const network = selectedCardNetworkRef.current;
    const payload = network && 'cardNumber' in data ? { ...data, cardNetwork: network } : data;
    lastRawDataRef.current = payload;
    const manager = managerRef.current;
    if (!manager) {
      console.warn(`${LOG} setRawData: no manager (activeMethod=${stateRef.current.activeMethod})`);
      return;
    }
    try {
      await manager.setRawData(payload);
    } catch (err) {
      console.warn(`${LOG} setRawData failed: ${err instanceof PrimerError ? err.errorId : 'unknown'}`);
      throw err;
    }
  }, []);

  const setBillingAddress = useCallback(async (address: PrimerAddress) => {
    const manager = managerRef.current;
    if (!manager) {
      console.warn(`${LOG} setBillingAddress: no manager (activeMethod=${stateRef.current.activeMethod})`);
      return;
    }
    try {
      await manager.setBillingAddress(address);
    } catch (err) {
      console.warn(`${LOG} setBillingAddress failed ${fmt(err)}`);
      throw err;
    }
  }, []);

  const selectCardNetwork = useCallback(
    async (identifier: CardNetworkId): Promise<void> => {
      const m = managerRef.current;
      if (!m) {
        console.warn(`${LOG} selectCardNetwork: no manager (activeMethod=${stateRef.current.activeMethod})`);
        throw new PrimerError('NO_ACTIVE_CARD_FORM', undefined, 'No active card form', undefined, undefined);
      }
      selectedCardNetworkRef.current = identifier;
      // Re-send the last raw data so the pick applies immediately.
      if (lastRawDataRef.current) {
        await setRawData(lastRawDataRef.current);
      }
      setState((prev) =>
        prev.selectedCardNetwork === identifier ? prev : { ...prev, selectedCardNetwork: identifier }
      );
    },
    [setRawData]
  );

  const submit = useCallback(async () => {
    const manager = managerRef.current;
    if (!manager) {
      console.warn(`${LOG} submit: no manager`);
      return;
    }
    trackAttemptStart(stateRef.current.activeMethod ?? 'PAYMENT_CARD', { submitted: true });
    await manager.submit();
  }, [trackAttemptStart]);

  const retry = useCallback(async () => {
    const method = stateRef.current.activeMethod;
    const manager = managerRef.current;
    if (!method || !manager) {
      console.warn(`${LOG} retry: no active method or manager ${fmt({ method, hasManager: !!manager })}`);
      return;
    }
    // iOS workaround: the native iOS RawDataManager nullifies its delegate on successful
    // tokenization, so any post-tokenize failure would silently drop subsequent submit()
    // outcomes. Reconfiguring here rebuilds the delegate binding; harmless on Android.
    // (The "remove once the iOS SDK stops nullifying" reminder lives in the PR description.)
    retryingManagerRef.current = manager;
    try {
      // Re-pass the original callbacks so the JS-wrapper's listeners get re-registered.
      // Otherwise native would emit onValidation/onBinDataChange/onMetadataChange during
      // the retry attempt with no JS-side subscribers → RN warns "no listeners registered".
      const callbacks = lastManagerCallbacksRef.current;
      await manager.configure(callbacks ? { paymentMethodType: method, ...callbacks } : { paymentMethodType: method });
      if (lastRawDataRef.current) {
        await manager.setRawData(lastRawDataRef.current);
      }
      // Clear the previous outcome so the transitioner fires for the new attempt.
      setState((prev) => (prev.paymentOutcome === null ? prev : { ...prev, paymentOutcome: null }));
      trackAttemptStart(method, { submitted: true });
      await manager.submit();
    } catch (err) {
      console.error(`${LOG} retry failed ${fmt(err)}`);
      throw err;
    } finally {
      retryingManagerRef.current = null;
      // Run a teardown that the effect cleanup deferred while retry was in flight.
      const pending = pendingCleanupRef.current;
      if (pending === manager) {
        pendingCleanupRef.current = null;
        pending.cleanUp().catch((err) => console.warn(`${LOG} deferred cleanUp failed ${fmt(err)}`));
        pending.removeAllListeners();
        if (managerRef.current === pending) {
          managerRef.current = null;
        }
        lastManagerCallbacksRef.current = null;
        selectedCardNetworkRef.current = null;
        setState((prev) => ({ ...prev, cardFormState: initialCardFormState, selectedCardNetwork: null }));
      }
    }
  }, []);

  const clearPaymentOutcome = useCallback(() => {
    // Also nil activeKlarnaMethod so the effect cleanup runs — Klarna needs a fresh component per payment.
    setState((prev) =>
      prev.paymentOutcome === null && prev.activeKlarnaMethod === null
        ? prev
        : {
            ...prev,
            paymentOutcome: null,
            activeKlarnaMethod: null,
            klarnaPaymentCategories: [],
            selectedKlarnaCategoryId: null,
            isKlarnaViewLoaded: false,
            isKlarnaLoading: false,
          }
    );
  }, []);

  // --- Bank-selection (COMPONENT_WITH_REDIRECT) lifecycle — iDEAL, Android Dotpay ---
  // Keyed on `activeBanksMethod` (armed by startBanks): provide a BanksComponent, subscribe to its
  // step + error events, and fetch the issuer list. The redirect + status polling are owned by the
  // native SDK; the terminal outcome arrives through the shared onCheckoutComplete / onError.
  useEffect(() => {
    if (!state.isReady || !state.activeBanksMethod) {
      return;
    }

    const method = state.activeBanksMethod;
    let cancelled = false;
    const manager = new PrimerHeadlessUniversalCheckoutComponentWithRedirectManager();
    banksManagerRef.current = manager;

    void (async () => {
      try {
        const component: BanksComponent = await manager.provide({
          paymentMethodType: method,
          onStep: (step: BanksStep) => {
            if (cancelled) return;
            if (step.stepName === 'banksRetrieved') {
              setState((prev) => ({ ...prev, banks: step.banks, isBanksLoading: false }));
            } else {
              setState((prev) => (prev.isBanksLoading ? prev : { ...prev, isBanksLoading: true }));
            }
          },
          onError: (error) => {
            if (cancelled) return;
            setState((prev) =>
              prev.isReady
                ? { ...prev, isBanksLoading: false, paymentOutcome: { status: 'error', error, data: null } }
                : { ...prev, isBanksLoading: false, error }
            );
          },
        });
        if (cancelled) {
          manager.removeAllListeners();
          return;
        }
        banksComponentRef.current = component;
        await component.start();
      } catch (err) {
        console.warn(`${LOG} banks provide/start failed ${fmt(err)}`);
        if (!cancelled) {
          // Surface a startup failure as an error outcome (mirrors onError above) so
          // PaymentOutcomeTransitioner routes to the error screen instead of leaving the shopper
          // on an empty bank list with a disabled Pay button.
          const error =
            err instanceof PrimerError
              ? err
              : new PrimerError('bank-selection-start-failed', undefined, toError(err).message, undefined, undefined);
          setState((prev) =>
            prev.isReady
              ? { ...prev, isBanksLoading: false, paymentOutcome: { status: 'error', error, data: null } }
              : { ...prev, isBanksLoading: false, error }
          );
        }
      }
    })();

    return () => {
      cancelled = true;
      manager.removeAllListeners();
      if (banksManagerRef.current === manager) {
        banksManagerRef.current = null;
      }
      banksComponentRef.current = null;
    };
  }, [state.activeBanksMethod, state.isReady]);

  // Klarna (KLARNA) lifecycle — categories → embedded view → authorize → (auto) finalize; keyed on activeKlarnaMethod.
  useEffect(() => {
    if (!state.isReady || !state.activeKlarnaMethod) {
      return;
    }

    let cancelled = false;
    const manager = new PrimerHeadlessUniversalCheckoutKlarnaManager();
    klarnaManagerRef.current = manager;
    klarnaFinalizeIssuedRef.current = false;

    void (async () => {
      try {
        const component: KlarnaComponent = await manager.provide({
          primerSessionIntent: PrimerSessionIntent.CHECKOUT,
          onStep: (step: KlarnaPaymentStep) => {
            if (cancelled) return;
            switch (step.stepName) {
              case 'paymentSessionCreated':
                setState((prev) => ({
                  ...prev,
                  klarnaPaymentCategories: step.paymentCategories,
                  isKlarnaLoading: false,
                }));
                break;
              case 'paymentViewLoaded':
                setState((prev) => (prev.isKlarnaViewLoaded ? prev : { ...prev, isKlarnaViewLoaded: true }));
                break;
              case 'paymentSessionAuthorized':
                if (step.isFinalized) {
                  setState((prev) => (prev.isKlarnaLoading ? { ...prev, isKlarnaLoading: false } : prev));
                } else if (!klarnaFinalizeIssuedRef.current) {
                  // Headless autoFinalize=false: finalize here when required, once.
                  klarnaFinalizeIssuedRef.current = true;
                  void klarnaComponentRef.current
                    ?.finalizePayment()
                    .catch((err) => console.warn(`${LOG} klarna finalizePayment failed ${fmt(err)}`));
                }
                break;
              case 'paymentSessionFinalized':
                setState((prev) => (prev.isKlarnaLoading ? { ...prev, isKlarnaLoading: false } : prev));
                break;
            }
          },
          onError: (error) => {
            if (cancelled) return;
            setState((prev) =>
              prev.isReady
                ? { ...prev, isKlarnaLoading: false, paymentOutcome: { status: 'error', error, data: null } }
                : { ...prev, isKlarnaLoading: false, error }
            );
          },
        });
        if (cancelled) {
          await component.cleanUp().catch(() => {});
          return;
        }
        klarnaComponentRef.current = component;
        await component.start();
      } catch (err) {
        console.warn(`${LOG} klarna provide/start failed ${fmt(err)}`);
        if (!cancelled) {
          // Surface a startup failure as an error outcome so the shopper isn't stranded on the spinner.
          const error =
            err instanceof PrimerError
              ? err
              : new PrimerError('klarna-start-failed', undefined, toError(err).message, undefined, undefined);
          setState((prev) =>
            prev.isReady
              ? { ...prev, isKlarnaLoading: false, paymentOutcome: { status: 'error', error, data: null } }
              : { ...prev, isKlarnaLoading: false, error }
          );
        }
      }
    })();

    return () => {
      cancelled = true;
      // Best-effort teardown; cleanUp can reject benignly on a finished component.
      klarnaComponentRef.current?.cleanUp().catch(() => {});
      if (klarnaManagerRef.current === manager) {
        klarnaManagerRef.current = null;
      }
      klarnaComponentRef.current = null;
      klarnaFinalizeIssuedRef.current = false;
    };
  }, [state.activeKlarnaMethod, state.isReady]);

  // NATIVE_UI methods (Google Pay today; Apple Pay / PayPal / web-redirect APMs later) ride the
  // existing Headless NATIVE_UI path: start the native flow by type; outcomes arrive through the
  // shared onCheckoutComplete/onError. Only one native-UI flow runs at a time.
  const startNativeUI = useCallback(
    async (paymentMethodType: string) => {
      // Ignore re-entrant taps: the in-list method row isn't disabled while loading, so a fast
      // double-tap would otherwise spawn two native flows.
      if (stateRef.current.nativeUiInFlightType !== null) {
        return;
      }
      if (paymentMethodType === GOOGLE_PAY && !isGooglePaySupported(stateRef.current.availablePaymentMethods)) {
        throw new PrimerError(
          'google-pay-unavailable',
          'google-pay-unavailable',
          'Google Pay is not available on this device.',
          undefined,
          undefined
        );
      }
      if (paymentMethodType === APPLE_PAY && !isApplePaySupported(stateRef.current.availablePaymentMethods)) {
        throw new PrimerError(
          'apple-pay-unavailable',
          'apple-pay-unavailable',
          'Apple Pay is not available on this device.',
          undefined,
          undefined
        );
      }
      // Clear any stale outcome so the result screen re-fires for this attempt.
      setState((prev) => ({ ...prev, paymentOutcome: null, nativeUiInFlightType: paymentMethodType }));
      // Wallet/APM handoff: select + hand off to native, no form so no SUBMITTED (matches Web).
      trackSelection(paymentMethodType);
      trackAttemptStart(paymentMethodType, { submitted: false });
      try {
        const manager = new PrimerHeadlessUniversalCheckoutPaymentMethodNativeUIManager();
        await manager.configure(paymentMethodType);
        await manager.showPaymentMethod(PrimerSessionIntent.CHECKOUT);
        // Success / failure arrive via onCheckoutComplete / onError; shopper-cancel via
        // onError('payment-cancelled'). nativeUiInFlightType is reset in those handlers.
      } catch (err) {
        console.warn(`${LOG} startNativeUI(${paymentMethodType}) failed ${fmt(err)}`);
        const error =
          err instanceof PrimerError
            ? err
            : new PrimerError('native-ui-start-failed', undefined, toError(err).message, undefined, undefined);
        void PrimerAnalytics.sendErrorLog(
          'Unable to present payment method',
          'unable-to-present-payment-method',
          `${paymentMethodType}: ${error.description ?? error.message}`
        );
        setState((prev) => ({
          ...prev,
          nativeUiInFlightType: null,
          paymentOutcome: { status: 'error', error, data: null },
        }));
        throw error;
      }
    },
    [trackSelection, trackAttemptStart]
  );

  const cancelNativeUI = useCallback((paymentMethodType: string) => {
    // The native sheet is a system surface JS can't force-close (FR-002b), so we only clear the
    // in-flight flag, and only for the matching method. A real dismissal surfaces via
    // onError('payment-cancelled').
    setState((prev) =>
      prev.nativeUiInFlightType === paymentMethodType ? { ...prev, nativeUiInFlightType: null } : prev
    );
  }, []);

  // Bank-selection actions (COMPONENT_WITH_REDIRECT). `startBanks` arms the lifecycle effect above;
  // filter/select/submit forward to the active BanksComponent.
  const startBanks = useCallback(async (paymentMethodType: string) => {
    setState((prev) => ({
      ...prev,
      activeBanksMethod: paymentMethodType,
      banks: [],
      selectedBankId: null,
      isBanksLoading: true,
      paymentOutcome: null,
    }));
  }, []);

  const filterBanks = useCallback((text: string) => {
    void banksComponentRef.current?.handleBankFilterChange(text);
  }, []);

  const selectBank = useCallback((bankId: string) => {
    void banksComponentRef.current?.handleBankChange(bankId);
    setState((prev) => (prev.selectedBankId === bankId ? prev : { ...prev, selectedBankId: bankId }));
  }, []);

  const submitBanks = useCallback(async () => {
    // Hold isLoading from submit() until a terminal outcome so a custom Pay button disables during
    // tokenise→redirect — onError/onCheckoutComplete clear it.
    setState((prev) => ({ ...prev, isBanksLoading: true, paymentOutcome: null }));
    await banksComponentRef.current?.submit();
  }, []);

  // Disarm the bank flow (called on return to the method list) so re-selecting the same method
  // re-runs the provide effect instead of stranding on a spinner.
  const stopBanks = useCallback(() => {
    setState((prev) =>
      prev.activeBanksMethod === null
        ? prev
        : { ...prev, activeBanksMethod: null, banks: [], selectedBankId: null, isBanksLoading: false }
    );
  }, []);

  // Disarm on return to the method list (mirrors stopBanks); the effect cleanup tears down the component.
  const stopKlarna = useCallback(() => {
    setState((prev) =>
      prev.activeKlarnaMethod === null
        ? prev
        : {
            ...prev,
            activeKlarnaMethod: null,
            klarnaPaymentCategories: [],
            selectedKlarnaCategoryId: null,
            isKlarnaViewLoaded: false,
            isKlarnaLoading: false,
          }
    );
  }, []);

  // Klarna actions: startKlarna arms the lifecycle effect; select/authorize/finalize forward to the component.
  const startKlarna = useCallback(async (paymentMethodType: string) => {
    setState((prev) => ({
      ...prev,
      activeKlarnaMethod: paymentMethodType,
      klarnaPaymentCategories: [],
      selectedKlarnaCategoryId: null,
      isKlarnaViewLoaded: false,
      isKlarnaLoading: true,
      paymentOutcome: null,
    }));
  }, []);

  const selectKlarnaCategory = useCallback((categoryId: string) => {
    const category = stateRef.current.klarnaPaymentCategories.find((c) => c.identifier === categoryId);
    if (!category) {
      console.warn(`${LOG} selectKlarnaCategory: unknown category ${categoryId}`);
      return;
    }
    const returnIntentUrl = settingsRef.current?.paymentMethodOptions?.klarnaOptions?.returnIntentUrl;
    // Android needs returnIntentUrl to build the embedded view — fail clearly instead of a dead screen (iOS ignores it).
    if (Platform.OS === 'android' && !returnIntentUrl) {
      const error = new PrimerError(
        'klarna-return-url-missing',
        undefined,
        'Klarna on Android requires paymentMethodOptions.klarnaOptions.returnIntentUrl to be set.',
        undefined,
        undefined
      );
      setState((prev) =>
        prev.isReady
          ? { ...prev, isKlarnaLoading: false, paymentOutcome: { status: 'error', error, data: null } }
          : { ...prev, isKlarnaLoading: false, error }
      );
      return;
    }
    void klarnaComponentRef.current
      ?.handlePaymentOptionsChange({
        validatableDataName: 'klarnaPaymentOptions',
        paymentCategory: category,
        ...(returnIntentUrl ? { returnIntentUrl } : null),
      })
      .catch((err) => console.warn(`${LOG} klarna handlePaymentOptionsChange failed ${fmt(err)}`));
    setState((prev) =>
      prev.selectedKlarnaCategoryId === categoryId
        ? prev
        : { ...prev, selectedKlarnaCategoryId: categoryId, isKlarnaViewLoaded: false }
    );
  }, []);

  const authorizeKlarna = useCallback(async () => {
    // Re-arm the finalize guard so a retry's auto-finalize can fire again.
    klarnaFinalizeIssuedRef.current = false;
    setState((prev) => ({ ...prev, isKlarnaLoading: true, paymentOutcome: null }));
    await klarnaComponentRef.current?.submit();
  }, []);

  const finalizeKlarna = useCallback(async () => {
    // Manual path for custom layouts; guarded against onStep's auto-finalize double-firing.
    if (klarnaFinalizeIssuedRef.current) return;
    klarnaFinalizeIssuedRef.current = true;
    await klarnaComponentRef.current?.finalizePayment();
  }, []);

  const selectVaultedMethodId = useCallback((id: string) => {
    setState((prev) => {
      // The id must exist among the current methods to be honoured.
      if (!prev.vaultedMethods.some((m) => m.id === id)) {
        console.warn(`${LOG} selectVaultedMethodId: id ${id} not present in vaultedMethods`);
        return prev;
      }
      // Already lite-with-this-id (no override to clear) → nothing to do.
      if (prev.activeVaultedMethodId === id && prev.vaultDisplayOverride === null) {
        return prev;
      }
      // Any tap commits the user's choice and clears any prior expand-override.
      return { ...prev, activeVaultedMethodId: id, vaultDisplayOverride: null };
    });
  }, []);

  const requestExpandedVaultDisplay = useCallback(() => {
    setState((prev) =>
      prev.vaultDisplayOverride === 'expanded' ? prev : { ...prev, vaultDisplayOverride: 'expanded' }
    );
  }, []);

  const setCvvInputVisible = useCallback((visible: boolean) => {
    setState((prev) => (prev.cvvInputVisible === visible ? prev : { ...prev, cvvInputVisible: visible }));
  }, []);

  // Vanish fallback: if the user-selected method is no longer in `vaultedMethods`
  // (mid-session client-session update removed it), clear the override so the
  // hook falls back to the new originalDefault and the lite layout disappears.
  useEffect(() => {
    if (state.activeVaultedMethodId === null) return;
    const stillPresent = state.vaultedMethods.some((m) => m.id === state.activeVaultedMethodId);
    if (stillPresent) return;
    setState((prev) =>
      prev.activeVaultedMethodId === null && prev.vaultDisplayOverride === null
        ? prev
        : { ...prev, activeVaultedMethodId: null, vaultDisplayOverride: null }
    );
  }, [state.activeVaultedMethodId, state.vaultedMethods]);

  const payFromVault = useCallback(
    async (vaultedPaymentMethodId: string, additionalData?: PrimerVaultedPaymentMethodAdditionalData) => {
      const vm = vaultManagerRef.current;
      if (!vm) {
        console.warn(`${LOG} payFromVault: vault manager not configured`);
        return;
      }
      // Clear any stale outcome so PaymentOutcomeTransitioner re-fires for this attempt.
      setState((prev) => (prev.paymentOutcome === null ? prev : { ...prev, paymentOutcome: null }));
      // Vaulted pay is a card payment: same SUBMITTED → PROCESSING → outcome sequence.
      trackAttemptStart('PAYMENT_CARD', { submitted: true });
      try {
        await vm.startPaymentFlow(vaultedPaymentMethodId, additionalData);
      } catch (err) {
        console.error(`${LOG} payFromVault failed ${fmt(err)}`);
        if (additionalData?.cvv) {
          const errorId =
            (err as PrimerError | { errorId?: string } | undefined)?.errorId != null
              ? String((err as PrimerError | { errorId?: string }).errorId)
              : 'UNKNOWN';
          void PrimerAnalytics.trackEvent('VAULT_CVV_SUBMISSION_FAILED', {
            vaultedMethodId: vaultedPaymentMethodId,
            errorId,
          });
        }
        const primerError = err as PrimerError;
        setState((prev) => ({
          ...prev,
          paymentOutcome: { status: 'error', error: primerError, data: null },
        }));
      }
    },
    []
  );

  const deleteVaultedPaymentMethod = useCallback(
    async (vaultedPaymentMethodId: string): Promise<void> => {
      const vm = vaultManagerRef.current;
      if (!vm) {
        return Promise.reject({
          errorId: 'VAULT_MANAGER_NOT_CONFIGURED',
          description: 'Vault manager not configured',
        });
      }
      if (!stateRef.current.vaultedMethods.some((m) => m.id === vaultedPaymentMethodId)) {
        return Promise.reject({
          errorId: 'INVALID_VAULTED_METHOD_ID',
          description: `No vaulted method with id ${vaultedPaymentMethodId}`,
        });
      }
      await vm.deleteVaultedPaymentMethod(vaultedPaymentMethodId);
      // Refresh is best-effort: if it fails after a successful server-side delete,
      // reconcile local state from what we know (drop the deleted id) rather than
      // rejecting — otherwise the caller surfaces "delete failed" for a delete that
      // actually succeeded.
      let methods: PrimerVaultedPaymentMethod[];
      let iconMap: Record<string, string | undefined>;
      let nameMap: Record<string, string | undefined>;
      try {
        ({ methods, iconMap, nameMap } = await refreshVaultedMethods());
      } catch (refreshErr) {
        console.warn(`${LOG} deleteVaultedPaymentMethod refresh failed ${fmt(refreshErr)}`);
        methods = stateRef.current.vaultedMethods.filter((m) => m.id !== vaultedPaymentMethodId);
        iconMap = { ...stateRef.current.vaultedIconUrisById };
        delete iconMap[vaultedPaymentMethodId];
        nameMap = { ...stateRef.current.vaultedNamesById };
        delete nameMap[vaultedPaymentMethodId];
      }
      // Promotion rule (matches iOS VaultedPaymentMethodManager.swift:18-31 and Android
      // VaultViewModel.kt:136-148): if the deleted id was the user's explicit pick, replace it
      // with the new top-of-list (or null when empty); otherwise leave the explicit pick alone.
      setState((prev) => {
        const wasActive = prev.activeVaultedMethodId === vaultedPaymentMethodId;
        const nextActiveId = wasActive ? (methods[0]?.id ?? null) : prev.activeVaultedMethodId;
        const nextOverride = methods.length === 0 ? null : prev.vaultDisplayOverride;
        return {
          ...prev,
          vaultedMethods: methods,
          vaultedIconUrisById: iconMap,
          vaultedNamesById: nameMap,
          activeVaultedMethodId: nextActiveId,
          vaultDisplayOverride: nextOverride,
        };
      });
    },
    [refreshVaultedMethods]
  );

  const contextValue = useMemo<PrimerCheckoutContextValue>(() => {
    return {
      isReady: state.isReady,
      error: state.error,
      clientSession: state.clientSession,
      acceptedCardNetworks: state.acceptedCardNetworks,
      availablePaymentMethods: state.availablePaymentMethods,
      paymentMethodResources: state.paymentMethodResources,
      isLoadingResources: state.isLoadingResources,
      resourcesError: state.resourcesError,
      settings: settingsRef.current,
      paymentOutcome: state.paymentOutcome,
      nativeUiInFlightType: state.nativeUiInFlightType,
      activeMethod: state.activeMethod,
      cardFormState: state.cardFormState,
      banks: state.banks,
      selectedBankId: state.selectedBankId,
      isBanksLoading: state.isBanksLoading,
      klarnaPaymentCategories: state.klarnaPaymentCategories,
      selectedKlarnaCategoryId: state.selectedKlarnaCategoryId,
      isKlarnaViewLoaded: state.isKlarnaViewLoaded,
      isKlarnaLoading: state.isKlarnaLoading,
      vaultedMethods: state.vaultedMethods,
      vaultedIconUrisById: state.vaultedIconUrisById,
      vaultedNamesById: state.vaultedNamesById,
      isLoadingVaulted: state.isLoadingVaulted,
      vaultedError: state.vaultedError,
      activeVaultedMethodId: state.activeVaultedMethodId,
      vaultDisplayOverride: state.vaultDisplayOverride,
      selectedCardNetwork: state.selectedCardNetwork,
      requiresVaultedCardCvv: state.requiresVaultedCardCvv,
      cvvInputVisible: state.cvvInputVisible,
      setActiveMethod,
      setRawData,
      setBillingAddress,
      selectCardNetwork,
      submit,
      retry,
      clearPaymentOutcome,
      startNativeUI,
      cancelNativeUI,
      startBanks,
      filterBanks,
      selectBank,
      submitBanks,
      stopBanks,
      startKlarna,
      selectKlarnaCategory,
      authorizeKlarna,
      finalizeKlarna,
      stopKlarna,
      payFromVault,
      selectVaultedMethodId,
      requestExpandedVaultDisplay,
      setCvvInputVisible,
      deleteVaultedPaymentMethod,
    };
  }, [
    state,
    startNativeUI,
    cancelNativeUI,
    startBanks,
    filterBanks,
    selectBank,
    submitBanks,
    stopBanks,
    startKlarna,
    selectKlarnaCategory,
    authorizeKlarna,
    finalizeKlarna,
    stopKlarna,
    setActiveMethod,
    setRawData,
    setBillingAddress,
    selectCardNetwork,
    submit,
    retry,
    clearPaymentOutcome,
    payFromVault,
    selectVaultedMethodId,
    requestExpandedVaultDisplay,
    setCvvInputVisible,
    deleteVaultedPaymentMethod,
  ]);

  return (
    <ThemeContext.Provider value={{ lightTokens, darkTokens }}>
      <PrimerCheckoutContext.Provider value={contextValue}>{children}</PrimerCheckoutContext.Provider>
    </ThemeContext.Provider>
  );
}
