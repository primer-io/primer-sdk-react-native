/**
 * Provider-level Stripe ACH tests (specs/004-stripe-ach-components):
 *   - arm/provide/start lifecycle + prefill push-through (FR-002/003)
 *   - validation reconciliation and the all-three-valid submit gate (FR-004)
 *   - mandate interception: consume exactly the ACH event, forward the rest (FR-008/015)
 *   - mandate text resolution: fullMandateText precedence over the template (FR-006)
 *   - accept/decline one-shot + decline outcome suppression with merchant onError intact (FR-007/009/011, C1)
 *   - ACH-scoped 'pending' outcome with onCheckoutComplete unchanged (FR-010/011, D6/G1)
 */
// @ts-expect-error -- React 19 concurrent act environment
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

jest.mock('../../specs/NativePrimer', () => ({
  __esModule: true,
  default: {
    setupAnalyticsLoggingBridge: jest.fn().mockResolvedValue(undefined),
    trackAnalyticsEvent: jest.fn().mockResolvedValue(undefined),
    sendLog: jest.fn().mockResolvedValue(undefined),
    sendErrorLog: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock(
  'react-native',
  () => ({
    Platform: { OS: 'android', select: (o: { android?: unknown; default?: unknown }) => o.android ?? o.default },
    NativeModules: {},
    NativeEventEmitter: jest.fn().mockImplementation(() => ({
      addListener: jest.fn().mockImplementation(() => ({ remove: jest.fn() })),
      removeAllListeners: jest.fn(),
    })),
  }),
  { virtual: true }
);

// --- ACH bridge doubles: capture the provide() props so tests can fire native events directly ---
const mockAchComponent = {
  start: jest.fn().mockResolvedValue(undefined),
  submit: jest.fn().mockResolvedValue(undefined),
  handleFirstNameChange: jest.fn().mockResolvedValue(undefined),
  handleLastNameChange: jest.fn().mockResolvedValue(undefined),
  handleEmailAddressChange: jest.fn().mockResolvedValue(undefined),
  cleanUp: jest.fn().mockResolvedValue(undefined),
};
let capturedAchProps:
  | import('../../HeadlessUniversalCheckout/Managers/PaymentMethodManagers/AchManager').AchManagerProps
  | null = null;
const mockProvide = jest.fn(
  async (
    props: import('../../HeadlessUniversalCheckout/Managers/PaymentMethodManagers/AchManager').AchManagerProps
  ) => {
    capturedAchProps = props;
    return mockAchComponent;
  }
);
jest.mock('../../HeadlessUniversalCheckout/Managers/PaymentMethodManagers/AchManager', () => ({
  PrimerHeadlessUniversalCheckoutAchManager: class {
    provide = mockProvide;
    removeAllListeners = jest.fn();
  },
}));

const mockAcceptMandate = jest.fn().mockResolvedValue(undefined);
const mockDeclineMandate = jest.fn().mockResolvedValue(undefined);
jest.mock('../../HeadlessUniversalCheckout/Managers/PaymentMethodManagers/AchMandateManager', () => ({
  PrimerHeadlessUniversalCheckoutAchMandateManager: class {
    acceptMandate = mockAcceptMandate;
    declineMandate = mockDeclineMandate;
  },
}));

jest.mock('../../HeadlessUniversalCheckout/Managers/AssetsManager', () => ({
  __esModule: true,
  default: class {
    getPaymentMethodResources = jest.fn().mockResolvedValue([]);
    getOrderedAllowedCardNetworks = jest.fn().mockResolvedValue(null);
    getCardNetworkImageURL = jest.fn().mockResolvedValue(undefined);
  },
}));

jest.mock('../../HeadlessUniversalCheckout/Managers/VaultManager', () => ({
  __esModule: true,
  default: class {
    configure = jest.fn().mockResolvedValue(undefined);
    requiresVaultedCardCvv = jest.fn().mockResolvedValue(false);
    fetchVaultedPaymentMethods = jest.fn().mockResolvedValue([]);
  },
}));

jest.mock('../../Components/analytics', () => ({
  PrimerAnalytics: {
    setup: jest.fn().mockResolvedValue(undefined),
    trackEvent: jest.fn().mockResolvedValue(undefined),
    sendLog: jest.fn().mockResolvedValue(undefined),
    sendErrorLog: jest.fn().mockResolvedValue(undefined),
  },
}));

// Deterministic localization: template resolution is observable via the TPL: prefix.
jest.mock('../../Components/internal/localization', () => ({
  translate: (key: string, _locale: string, params?: Record<string, string | number>) =>
    key === 'primer_ach_mandate_template' ? `TPL:${params?.merchantName ?? ''}` : key,
}));
jest.mock('../../Components/internal/localization/locale-resolver', () => ({
  resolveLocale: () => ({ locale: 'en' }),
}));

import { createElement } from 'react';
// @ts-expect-error -- react-test-renderer has no types for React 19
import renderer, { act } from 'react-test-renderer';
import { PrimerCheckoutProvider } from '../../Components/PrimerCheckoutProvider';
import { usePrimerCheckout } from '../../Components/hooks/usePrimerCheckout';
import { PrimerHeadlessUniversalCheckout } from '../../HeadlessUniversalCheckout/PrimerHeadlessUniversalCheckout';
import { PrimerError } from '../../models/PrimerError';
import type { PrimerCheckoutContextValue } from '../../Components/types/PrimerCheckoutProviderTypes';
import type { PrimerSettings } from '../../models/PrimerSettings';
import type { PrimerCheckoutData } from '../../models/PrimerCheckoutData';
import type { AchStep } from '../../models/ach/AchSteps';

const ACH_METHOD = {
  paymentMethodType: 'STRIPE_ACH',
  paymentMethodManagerCategories: ['STRIPE_ACH' as const],
  supportedPrimerSessionIntents: ['CHECKOUT' as const],
};

type SessionCallbacks = NonNullable<PrimerSettings['headlessUniversalCheckoutCallbacks']>;
let capturedCallbacks: SessionCallbacks | undefined;

function TestConsumer({ onContext }: { onContext: (ctx: PrimerCheckoutContextValue) => void }) {
  onContext(usePrimerCheckout());
  return null;
}

function flushPromises() {
  return new Promise((resolve) => setImmediate(resolve));
}

async function renderProvider(opts?: {
  settings?: PrimerSettings;
  onError?: jest.Mock;
  onCheckoutComplete?: jest.Mock;
}) {
  let latest: PrimerCheckoutContextValue | undefined;
  await act(async () => {
    renderer.create(
      createElement(
        PrimerCheckoutProvider,
        {
          clientToken: 'token-1',
          settings: opts?.settings,
          onError: opts?.onError,
          onCheckoutComplete: opts?.onCheckoutComplete,
        },
        createElement(TestConsumer, {
          onContext: (ctx: PrimerCheckoutContextValue) => {
            latest = ctx;
          },
        })
      )
    );
    await flushPromises();
  });
  return {
    ctx: () => {
      if (!latest) throw new Error('context never captured');
      return latest;
    },
  };
}

async function armAch(ctx: () => PrimerCheckoutContextValue) {
  await act(async () => {
    await ctx().startAch('STRIPE_ACH');
    await flushPromises();
  });
}

function fireStep(step: AchStep) {
  act(() => {
    capturedAchProps?.onStep?.(step);
  });
}

const cancellationError = new PrimerError('payment-cancelled', 'payment-cancelled', 'Cancelled', undefined, undefined);

describe('PrimerCheckoutProvider — Stripe ACH slice', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    capturedAchProps = null;
    capturedCallbacks = undefined;
    jest.spyOn(PrimerHeadlessUniversalCheckout, 'startWithClientToken').mockImplementation(async (_token, settings) => {
      capturedCallbacks = settings?.headlessUniversalCheckoutCallbacks;
      return [ACH_METHOD];
    });
    jest.spyOn(PrimerHeadlessUniversalCheckout, 'cleanUp').mockResolvedValue(undefined);
  });

  it('arms via startAch: provides for STRIPE_ACH, starts the component, prefills from userDetailsRetrieved', async () => {
    const { ctx } = await renderProvider();
    await armAch(ctx);

    expect(mockProvide).toHaveBeenCalledTimes(1);
    expect(mockProvide.mock.calls[0]![0].paymentMethodType).toBe('STRIPE_ACH');
    expect(mockAchComponent.start).toHaveBeenCalledTimes(1);
    expect(ctx().achStep).toBe('starting');

    fireStep({ stepName: 'userDetailsRetrieved', firstName: 'John', lastName: 'Smith', emailAddress: 'j@s.com' });

    expect(ctx().achStep).toBe('collectingDetails');
    expect(ctx().achUserDetails).toEqual({ firstName: 'John', lastName: 'Smith', emailAddress: 'j@s.com' });
    // Prefills are pushed back through native validation so the gate can open without edits.
    expect(mockAchComponent.handleFirstNameChange).toHaveBeenCalledWith('John');
    expect(mockAchComponent.handleLastNameChange).toHaveBeenCalledWith('Smith');
    expect(mockAchComponent.handleEmailAddressChange).toHaveBeenCalledWith('j@s.com');
  });

  it('does not push empty prefills through validation (no premature errors)', async () => {
    const { ctx } = await renderProvider();
    await armAch(ctx);

    fireStep({ stepName: 'userDetailsRetrieved', firstName: '', lastName: '', emailAddress: '' });

    expect(mockAchComponent.handleFirstNameChange).not.toHaveBeenCalled();
    expect(ctx().achIsValid).toBe(false);
    expect(ctx().achFieldErrors).toEqual({});
  });

  it('reconciles validation: invalid sets the message, valid clears it, all-three-valid opens the gate', async () => {
    const { ctx } = await renderProvider();
    await armAch(ctx);

    act(() => {
      capturedAchProps?.onInvalid?.({
        data: { validatableDataName: 'firstName', value: '1' },
        errors: [{ description: 'Bad first name' }],
      });
    });
    expect(ctx().achFieldErrors.firstName).toBe('Bad first name');
    expect(ctx().achIsValid).toBe(false);

    act(() => {
      capturedAchProps?.onValid?.({ data: { validatableDataName: 'firstName', value: 'John' } });
      capturedAchProps?.onValid?.({ data: { validatableDataName: 'lastName', value: 'Smith' } });
    });
    expect(ctx().achFieldErrors.firstName).toBeUndefined();
    expect(ctx().achIsValid).toBe(false); // email not validated yet

    act(() => {
      capturedAchProps?.onValid?.({ data: { validatableDataName: 'emailAddress', value: 'j@s.com' } });
    });
    expect(ctx().achIsValid).toBe(true);

    act(() => {
      capturedAchProps?.onValidationError?.({
        data: { validatableDataName: 'emailAddress', value: 'broken' },
        errors: [{ description: 'Cancelled' }],
      });
    });
    expect(ctx().achIsValid).toBe(false);
    expect(ctx().achFieldErrors.emailAddress).toBe('Cancelled');
  });

  it('submitAchDetails submits natively and userDetailsCollected moves to awaitingBankLink', async () => {
    const { ctx } = await renderProvider();
    await armAch(ctx);
    fireStep({ stepName: 'userDetailsRetrieved', firstName: 'J', lastName: 'S', emailAddress: 'j@s.com' });

    await act(async () => {
      await ctx().submitAchDetails();
    });
    expect(mockAchComponent.submit).toHaveBeenCalledTimes(1);
    expect(ctx().achStep).toBe('submittingDetails');

    fireStep({ stepName: 'userDetailsCollected' });
    expect(ctx().achStep).toBe('awaitingBankLink');
  });

  it('intercepts exactly the ACH mandate additionalInfo and forwards everything else (FR-015)', async () => {
    const merchantAdditionalInfo = jest.fn();
    const settings: PrimerSettings = {
      paymentMethodOptions: { stripeOptions: { publishableKey: 'pk', mandateData: { merchantName: 'My Shop' } } },
      headlessUniversalCheckoutCallbacks: { onCheckoutAdditionalInfo: merchantAdditionalInfo },
    };
    const { ctx } = await renderProvider({ settings });
    await armAch(ctx);

    act(() => {
      capturedCallbacks?.onCheckoutAdditionalInfo?.({ additionalInfoName: 'DisplayStripeAchMandateAdditionalInfo' });
    });
    expect(ctx().achStep).toBe('mandatePending');
    expect(ctx().achMandate).toEqual({ text: 'TPL:My Shop', source: 'template' });
    expect(merchantAdditionalInfo).not.toHaveBeenCalled();

    act(() => {
      capturedCallbacks?.onCheckoutAdditionalInfo?.({ additionalInfoName: 'MultibancoCheckoutAdditionalInfo' });
    });
    expect(merchantAdditionalInfo).toHaveBeenCalledTimes(1);
    expect(merchantAdditionalInfo).toHaveBeenCalledWith({ additionalInfoName: 'MultibancoCheckoutAdditionalInfo' });
  });

  it('resolves the mandate from fullMandateText when provided (precedence over the template)', async () => {
    const settings: PrimerSettings = {
      paymentMethodOptions: {
        stripeOptions: { publishableKey: 'pk', mandateData: { fullMandateText: 'FULL LEGAL TEXT' } },
      },
    };
    const { ctx } = await renderProvider({ settings });
    await armAch(ctx);

    act(() => {
      capturedCallbacks?.onCheckoutAdditionalInfo?.({ additionalInfoName: 'DisplayStripeAchMandateAdditionalInfo' });
    });
    expect(ctx().achMandate).toEqual({ text: 'FULL LEGAL TEXT', source: 'fullMandateText' });
  });

  it('accept is one-shot: answers natively once, late calls no-op', async () => {
    const { ctx } = await renderProvider({
      settings: { paymentMethodOptions: { stripeOptions: { mandateData: { merchantName: 'M' } } } },
    });
    await armAch(ctx);
    act(() => {
      capturedCallbacks?.onCheckoutAdditionalInfo?.({ additionalInfoName: 'DisplayStripeAchMandateAdditionalInfo' });
    });

    await act(async () => {
      await ctx().acceptAchMandate();
    });
    expect(mockAcceptMandate).toHaveBeenCalledTimes(1);
    expect(ctx().achStep).toBe('answeringMandate');

    await act(async () => {
      await ctx().acceptAchMandate();
    });
    expect(mockAcceptMandate).toHaveBeenCalledTimes(1);
  });

  it('decline publishes no outcome but still fires merchant onError once (C1), and resets the slice', async () => {
    const merchantOnError = jest.fn();
    const settingsOnError = jest.fn();
    const settings: PrimerSettings = {
      paymentMethodOptions: { stripeOptions: { mandateData: { merchantName: 'M' } } },
      headlessUniversalCheckoutCallbacks: { onError: settingsOnError },
    };
    const { ctx } = await renderProvider({ settings, onError: merchantOnError });
    await armAch(ctx);
    act(() => {
      capturedCallbacks?.onCheckoutAdditionalInfo?.({ additionalInfoName: 'DisplayStripeAchMandateAdditionalInfo' });
    });

    await act(async () => {
      await ctx().declineAchMandate();
    });
    expect(mockDeclineMandate).toHaveBeenCalledTimes(1);

    act(() => {
      capturedCallbacks?.onError?.(cancellationError, null);
    });
    expect(ctx().paymentOutcome).toBeNull();
    expect(merchantOnError).toHaveBeenCalledTimes(1);
    expect(merchantOnError).toHaveBeenCalledWith(cancellationError, null);
    expect(settingsOnError).toHaveBeenCalledTimes(1);
    expect(ctx().achStep).toBe('idle');
    expect(ctx().achMandate).toBeNull();

    // One-shot: a second decline attempt after the reset is a no-op.
    await act(async () => {
      await ctx().declineAchMandate();
    });
    expect(mockDeclineMandate).toHaveBeenCalledTimes(1);
  });

  it('maps PENDING to the pending outcome only for an ACH attempt, with onCheckoutComplete unchanged (D6/G1)', async () => {
    const merchantComplete = jest.fn();
    const { ctx } = await renderProvider({ onCheckoutComplete: merchantComplete });
    await armAch(ctx);
    // The attempt tracker (set on submit) decides the mapping — submit like a real flow.
    await act(async () => {
      await ctx().submitAchDetails();
    });

    const checkoutData = { payment: { id: 'p1', status: 'PENDING' } } as PrimerCheckoutData;
    act(() => {
      capturedCallbacks?.onCheckoutComplete?.(checkoutData);
    });
    expect(ctx().paymentOutcome).toEqual({ status: 'pending', data: checkoutData });
    expect(merchantComplete).toHaveBeenCalledTimes(1);
    expect(merchantComplete).toHaveBeenCalledWith(checkoutData);
    expect(ctx().achStep).toBe('idle'); // terminal outcome resets the slice
  });

  it('keeps the legacy success mapping for PENDING when no ACH flow is active', async () => {
    const { ctx } = await renderProvider();
    const checkoutData = { payment: { id: 'p2', status: 'PENDING' } } as PrimerCheckoutData;
    act(() => {
      capturedCallbacks?.onCheckoutComplete?.(checkoutData);
    });
    expect(ctx().paymentOutcome).toEqual({ status: 'success', data: checkoutData });
  });

  it('publishes a genuine ACH error as an error outcome and resets the slice', async () => {
    const merchantOnError = jest.fn();
    const { ctx } = await renderProvider({ onError: merchantOnError });
    await armAch(ctx);

    const bankError = new PrimerError('stripe-error', 'stripe-error', 'Collector failed', undefined, undefined);
    act(() => {
      capturedCallbacks?.onError?.(bankError, null);
    });
    expect(ctx().paymentOutcome).toEqual({ status: 'error', error: bankError, data: null });
    expect(merchantOnError).toHaveBeenCalledTimes(1);
    expect(ctx().achStep).toBe('idle');
  });

  it('forwards the mandate event verbatim when no CC ACH flow is armed (merchant-driven ACH)', async () => {
    const merchantAdditionalInfo = jest.fn();
    const settings: PrimerSettings = {
      headlessUniversalCheckoutCallbacks: { onCheckoutAdditionalInfo: merchantAdditionalInfo },
    };
    const { ctx } = await renderProvider({ settings });
    // No armAch — the merchant drives ACH through the headless managers themselves.
    act(() => {
      capturedCallbacks?.onCheckoutAdditionalInfo?.({ additionalInfoName: 'DisplayStripeAchMandateAdditionalInfo' });
    });
    expect(merchantAdditionalInfo).toHaveBeenCalledTimes(1);
    expect(ctx().achStep).toBe('idle');
    expect(ctx().achMandate).toBeNull();
  });

  it('publishes a visible error for unhandled additionalInfo when no merchant callback exists', async () => {
    const { ctx } = await renderProvider();
    act(() => {
      capturedCallbacks?.onCheckoutAdditionalInfo?.({ additionalInfoName: 'PromptPayCheckoutAdditionalInfo' });
    });
    const outcome = ctx().paymentOutcome;
    expect(outcome?.status).toBe('error');
    if (outcome?.status === 'error') {
      expect(outcome.error.errorId).toBe('additional-info-unhandled');
    }
  });

  it('fails loud (and releases the native mandate) when mandateData is missing', async () => {
    const merchantOnError = jest.fn();
    const { ctx } = await renderProvider({ onError: merchantOnError }); // no stripeOptions.mandateData
    await armAch(ctx);
    act(() => {
      capturedCallbacks?.onCheckoutAdditionalInfo?.({ additionalInfoName: 'DisplayStripeAchMandateAdditionalInfo' });
    });
    expect(mockDeclineMandate).toHaveBeenCalledTimes(1);
    const outcome = ctx().paymentOutcome;
    expect(outcome?.status).toBe('error');
    if (outcome?.status === 'error') {
      expect(outcome.error.errorId).toBe('stripe-ach-mandate-config');
    }
    expect(merchantOnError).toHaveBeenCalledTimes(1);
    expect(ctx().achMandate).toBeNull();
  });

  it('recovers from a rejected mandate answer instead of wedging answeringMandate', async () => {
    const { ctx } = await renderProvider({
      settings: { paymentMethodOptions: { stripeOptions: { mandateData: { merchantName: 'M' } } } },
    });
    await armAch(ctx);
    act(() => {
      capturedCallbacks?.onCheckoutAdditionalInfo?.({ additionalInfoName: 'DisplayStripeAchMandateAdditionalInfo' });
    });
    mockAcceptMandate.mockRejectedValueOnce(new Error('bridge dead'));
    await act(async () => {
      await ctx().acceptAchMandate();
    });
    expect(ctx().achStep).toBe('idle');
    const outcome = ctx().paymentOutcome;
    expect(outcome?.status).toBe('error');
  });

  it('stopAch defers while the mandate awaits an answer', async () => {
    const { ctx } = await renderProvider({
      settings: { paymentMethodOptions: { stripeOptions: { mandateData: { merchantName: 'M' } } } },
    });
    await armAch(ctx);
    act(() => {
      capturedCallbacks?.onCheckoutAdditionalInfo?.({ additionalInfoName: 'DisplayStripeAchMandateAdditionalInfo' });
    });

    act(() => {
      ctx().stopAch();
    });
    expect(ctx().achStep).toBe('mandatePending');
  });

  it('decline rejection still reports the abandoned attempt via onError and resets (contract honoured)', async () => {
    const merchantOnError = jest.fn();
    const settings: PrimerSettings = {
      paymentMethodOptions: { stripeOptions: { mandateData: { merchantName: 'M' } } },
    };
    const { ctx } = await renderProvider({ settings, onError: merchantOnError });
    await armAch(ctx);
    act(() => {
      capturedCallbacks?.onCheckoutAdditionalInfo?.({ additionalInfoName: 'DisplayStripeAchMandateAdditionalInfo' });
    });
    mockDeclineMandate.mockRejectedValueOnce(new Error('bridge dead'));
    await act(async () => {
      await ctx().declineAchMandate();
    });
    expect(ctx().achStep).toBe('idle');
    expect(ctx().paymentOutcome).toBeNull(); // decline shows no error screen, even on rejection
    expect(merchantOnError).toHaveBeenCalledTimes(1);
  });

  it('backstops a decline whose native confirmation never arrives — force-resets instead of stranding', async () => {
    jest.useFakeTimers({ doNotFake: ['setImmediate'] });
    try {
      const { ctx } = await renderProvider({
        settings: { paymentMethodOptions: { stripeOptions: { mandateData: { merchantName: 'M' } } } },
      });
      await armAch(ctx);
      act(() => {
        capturedCallbacks?.onCheckoutAdditionalInfo?.({ additionalInfoName: 'DisplayStripeAchMandateAdditionalInfo' });
      });
      await act(async () => {
        await ctx().declineAchMandate();
      });
      // No native confirmation follows — the flow would otherwise strand in answeringMandate.
      expect(ctx().achStep).toBe('answeringMandate');
      act(() => {
        jest.advanceTimersByTime(8000); // ACH_DECLINE_CONFIRM_TIMEOUT_MS
      });
      expect(ctx().achStep).toBe('idle');
      expect(ctx().paymentOutcome).toBeNull();
    } finally {
      jest.useRealTimers();
    }
  });

  it('config-missing path: a rejected native decline clears the in-flight flag so a later error is not swallowed', async () => {
    const { ctx } = await renderProvider(); // no stripeOptions.mandateData → fail-loud config path
    await armAch(ctx);
    mockDeclineMandate.mockRejectedValueOnce(new Error('release failed'));
    await act(async () => {
      capturedCallbacks?.onCheckoutAdditionalInfo?.({ additionalInfoName: 'DisplayStripeAchMandateAdditionalInfo' });
      await flushPromises();
    });
    expect(ctx().paymentOutcome?.status).toBe('error'); // the stripe-ach-mandate-config error itself

    const laterError = new PrimerError('later-unrelated', 'later-unrelated', 'x', undefined, undefined);
    act(() => {
      capturedCallbacks?.onError?.(laterError, null);
    });
    const outcome = ctx().paymentOutcome;
    expect(outcome?.status).toBe('error');
    if (outcome?.status === 'error') {
      expect(outcome.error.errorId).toBe('later-unrelated'); // not swallowed by a stuck decline flag
    }
  });
});
