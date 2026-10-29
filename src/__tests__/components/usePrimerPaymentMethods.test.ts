import { createElement, useState, type ReactNode } from 'react';
// @ts-expect-error -- react-test-renderer has no types for React 19
import { act, create } from 'react-test-renderer';
import { PrimerCheckoutContext } from '../../Components/internal/PrimerCheckoutContext';
import { ThemeContext, type PrimerColorScheme } from '../../Components/internal/theme/ThemeContext';
import { defaultLightTokens } from '../../Components/internal/theme/tokens';
import { usePrimerPaymentMethods } from '../../Components/hooks/usePrimerPaymentMethods';
import type { PrimerCheckoutContextValue } from '../../Components/types/PrimerCheckoutProviderTypes';
import type { IPrimerHeadlessUniversalCheckoutPaymentMethod } from '../../models/PrimerHeadlessUniversalCheckoutPaymentMethod';
import type { PrimerPaymentMethodAsset, PrimerPaymentMethodNativeView } from '../../models/PrimerPaymentMethodResource';
import type { UsePrimerPaymentMethodsReturn } from '../../Components/types/PaymentMethodTypes';

// @ts-expect-error -- React 19 concurrent act environment
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

// The scheme the provider decided; the hook reads it from the theme, not from the phone.
let scheme: PrimerColorScheme = 'light';
beforeEach(() => {
  scheme = 'light';
});

function renderHook<T>(hook: () => T, Wrapper: (props: { children: ReactNode }) => ReactNode | null) {
  const result = { current: null as unknown as T };

  function HookComponent() {
    result.current = hook();
    return null;
  }

  act(() => {
    create(createElement(Wrapper, { children: createElement(HookComponent) }));
  });

  return { result };
}

function makeMethod(type: string): IPrimerHeadlessUniversalCheckoutPaymentMethod {
  return {
    paymentMethodType: type,
    paymentMethodManagerCategories: ['NATIVE_UI'],
    supportedPrimerSessionIntents: ['CHECKOUT'],
  };
}

function makeResource(type: string, name: string): PrimerPaymentMethodAsset {
  return {
    paymentMethodType: type,
    paymentMethodName: name,
    paymentMethodLogo: { colored: `https://logo/${type}` },
    paymentMethodBackgroundColor: { colored: '#000' },
  };
}

function makeResourceWithVariants(
  type: string,
  name: string,
  overrides: { colored?: string; light?: string; dark?: string }
): PrimerPaymentMethodAsset {
  return {
    paymentMethodType: type,
    paymentMethodName: name,
    paymentMethodLogo: overrides,
    paymentMethodBackgroundColor: overrides,
  };
}

function makeNativeViewResource(type: string, name: string, nativeViewName: string): PrimerPaymentMethodNativeView {
  return {
    paymentMethodType: type,
    paymentMethodName: name,
    nativeViewName,
  };
}

function contextWrapper(value: PrimerCheckoutContextValue) {
  return ({ children }: { children: ReactNode }) =>
    createElement(
      ThemeContext.Provider,
      { value: { scheme, tokens: defaultLightTokens } },
      createElement(PrimerCheckoutContext.Provider, { value }, children)
    );
}

const readyContext: PrimerCheckoutContextValue = {
  isReady: true,
  error: null,
  clientSession: null,
  acceptedCardNetworks: null,
  availablePaymentMethods: [makeMethod('PAYMENT_CARD'), makeMethod('PAYPAL'), makeMethod('APPLE_PAY')],
  paymentMethodResources: [
    makeResource('PAYMENT_CARD', 'Card'),
    makeResource('PAYPAL', 'PayPal'),
    makeResource('APPLE_PAY', 'Apple Pay'),
  ],
  isLoadingResources: false,
  resourcesError: null,
  settings: undefined,
  paymentOutcome: null,
  nativeUiInFlightType: null,
  startNativeUI: async () => {},
  cancelNativeUI: () => {},
  banks: [],
  selectedBankId: null,
  isBanksLoading: false,
  startBanks: async () => {},
  filterBanks: () => {},
  selectBank: () => {},
  submitBanks: async () => {},
  stopBanks: () => {},
  stopKlarna: () => {},
  klarnaPaymentCategories: [],
  selectedKlarnaCategoryId: null,
  isKlarnaViewLoaded: false,
  isKlarnaLoading: false,
  startKlarna: async () => {},
  selectKlarnaCategory: () => {},
  authorizeKlarna: async () => {},
  finalizeKlarna: async () => {},
  achStep: 'idle' as const,
  achUserDetails: { firstName: '', lastName: '', emailAddress: '' },
  achFieldErrors: {},
  achIsValid: false,
  achMandate: null,
  startAch: async () => {},
  setAchFirstName: async () => {},
  setAchLastName: async () => {},
  setAchEmailAddress: async () => {},
  submitAchDetails: async () => {},
  acceptAchMandate: async () => {},
  declineAchMandate: async () => {},
  stopAch: () => {},
  activeMethod: null,
  cardFormState: {
    isValid: false,
    errors: {},
    messages: [],
    binData: null,
    metadata: null,
    requiredFields: [],
  },
  vaultedMethods: [],
  vaultedIconUrisById: {},
  vaultedNamesById: {},
  isLoadingVaulted: false,
  vaultedError: null,
  setActiveMethod: () => {},
  selectedCardNetwork: null,
  setRawData: async () => {},
  setBillingAddress: async () => {},
  selectCardNetwork: async () => {},
  submit: async () => {},
  retry: async () => {},
  clearPaymentOutcome: () => {},
  payFromVault: async () => {},
  activeVaultedMethodId: null,
  vaultDisplayOverride: null,
  selectVaultedMethodId: () => {},
  requestExpandedVaultDisplay: () => {},
  deleteVaultedPaymentMethod: async () => {},
  requiresVaultedCardCvv: false,
  cvvInputVisible: false,
  setCvvInputVisible: () => {},
};

describe('usePrimerPaymentMethods', () => {
  it.each<[string, Partial<PrimerCheckoutContextValue>]>([
    ['when SDK is not ready', { isReady: false }],
    ['while resources are loading', { isLoadingResources: true }],
  ])('returns isLoading true %s', (_, overrides) => {
    const ctx: PrimerCheckoutContextValue = {
      ...readyContext,
      ...overrides,
    };
    const { result } = renderHook(() => usePrimerPaymentMethods(), contextWrapper(ctx));
    expect(result.current.isLoading).toBe(true);
    expect(result.current.paymentMethods).toEqual([]);
  });

  it('merges methods with resources when ready, in API order (no implicit sort)', () => {
    const { result } = renderHook(() => usePrimerPaymentMethods(), contextWrapper(readyContext));
    expect(result.current.isLoading).toBe(false);
    expect(result.current.paymentMethods).toHaveLength(3);
    expect(result.current.paymentMethods.map((m) => m.type)).toEqual(['PAYMENT_CARD', 'PAYPAL', 'APPLE_PAY']);

    const card = result.current.paymentMethods.find((m) => m.type === 'PAYMENT_CARD')!;
    expect(card.name).toBe('Card');
    expect(card.logo).toBe('https://logo/PAYMENT_CARD');
    expect(card.backgroundColor).toBe('#000');
    expect(card.categories).toEqual(['NATIVE_UI']);
    expect(card.intents).toEqual(['CHECKOUT']);
  });

  it.each<[string, { include?: string[]; exclude?: string[] }, string[]]>([
    ['include', { include: ['PAYPAL'] }, ['PAYPAL']],
    ['exclude', { exclude: ['APPLE_PAY'] }, ['PAYMENT_CARD', 'PAYPAL']],
    ['include then exclude', { include: ['PAYMENT_CARD', 'PAYPAL'], exclude: ['PAYPAL'] }, ['PAYMENT_CARD']],
  ])('filters by %s', (_, options, expected) => {
    const { result } = renderHook(() => usePrimerPaymentMethods(options), contextWrapper(readyContext));
    expect(result.current.paymentMethods).toHaveLength(expected.length);
    expect(result.current.paymentMethods.map((m) => m.type)).toEqual(expected);
  });

  it('handles methods without matching resources', () => {
    const ctx: PrimerCheckoutContextValue = {
      ...readyContext,
      paymentMethodResources: [],
    };
    const { result } = renderHook(() => usePrimerPaymentMethods(), contextWrapper(ctx));
    expect(result.current.paymentMethods).toHaveLength(3);
    // falls back to title-cased type name
    const paypal = result.current.paymentMethods.find((m) => m.type === 'PAYPAL');
    expect(paypal?.name).toBe('Paypal');
    expect(paypal?.logo).toBeUndefined();
    expect(paypal?.resource).toBeUndefined();

    // Multi-word fallback: PAYMENT_CARD → "Payment Card"
    const card = result.current.paymentMethods.find((m) => m.type === 'PAYMENT_CARD');
    expect(card?.name).toBe('Payment Card');
  });

  it('selectMethod stores selection; selectedMethod resolves to current item', () => {
    const { result } = renderHook(() => usePrimerPaymentMethods(), contextWrapper(readyContext));
    const paypal = result.current.paymentMethods.find((m) => m.type === 'PAYPAL')!;

    act(() => {
      result.current.selectMethod(paypal);
    });
    expect(result.current.selectedMethod?.type).toBe('PAYPAL');

    act(() => {
      result.current.clearSelection();
    });
    expect(result.current.selectedMethod).toBeNull();
  });

  it('selection survives context rebuild (tracks by type, not reference)', () => {
    let hookResult: UsePrimerPaymentMethodsReturn = null as unknown as UsePrimerPaymentMethodsReturn;
    let setCtx: (next: PrimerCheckoutContextValue) => void = () => {};

    function Host() {
      const [ctx, setState] = useState(readyContext);
      setCtx = setState;
      return createElement(PrimerCheckoutContext.Provider, { value: ctx }, createElement(Inner));
    }
    function Inner() {
      hookResult = usePrimerPaymentMethods();
      return null;
    }

    act(() => {
      create(createElement(Host));
    });

    const originalPaypal = hookResult.paymentMethods.find((m) => m.type === 'PAYPAL')!;
    act(() => {
      hookResult.selectMethod(originalPaypal);
    });
    expect(hookResult.selectedMethod).toBe(originalPaypal);

    // Rebuild context with new array references — forces useMemo to rebuild paymentMethods
    act(() => {
      setCtx({ ...readyContext, paymentMethodResources: [...readyContext.paymentMethodResources] });
    });

    // Selection still valid, but now points to the freshly built item
    expect(hookResult.selectedMethod?.type).toBe('PAYPAL');
    expect(hookResult.selectedMethod).not.toBe(originalPaypal);
  });

  it('clears selection permanently when filtered out (does not come back after un-exclude)', () => {
    let hookResult: UsePrimerPaymentMethodsReturn = null as unknown as UsePrimerPaymentMethodsReturn;
    let setExclude: (next: string[]) => void = () => {};

    function Host() {
      const [exclude, setState] = useState<string[]>([]);
      setExclude = setState;
      return createElement(PrimerCheckoutContext.Provider, { value: readyContext }, createElement(Inner, { exclude }));
    }
    function Inner({ exclude }: { exclude: string[] }) {
      hookResult = usePrimerPaymentMethods({ exclude });
      return null;
    }

    act(() => {
      create(createElement(Host));
    });

    const paypal = hookResult.paymentMethods.find((m) => m.type === 'PAYPAL')!;
    act(() => {
      hookResult.selectMethod(paypal);
    });
    expect(hookResult.selectedMethod?.type).toBe('PAYPAL');

    // Filter out the selection
    act(() => {
      setExclude(['PAYPAL']);
    });
    expect(hookResult.selectedMethod).toBeNull();

    // Un-exclude — selection should stay cleared (not silently return)
    act(() => {
      setExclude([]);
    });
    expect(hookResult.selectedMethod).toBeNull();
  });

  it('maps non-card surcharges to kind=flat', () => {
    const ctx: PrimerCheckoutContextValue = {
      ...readyContext,
      clientSession: {
        paymentMethodOptions: {
          PAYPAL: { surcharge: { amount: 99 } },
          APPLE_PAY: { surcharge: { amount: 0 } },
          PAYMENT_CARD: {},
        },
      } as unknown as PrimerCheckoutContextValue['clientSession'],
    };
    const { result } = renderHook(() => usePrimerPaymentMethods(), contextWrapper(ctx));
    const byType = Object.fromEntries(result.current.paymentMethods.map((m) => [m.type, m]));
    expect(byType.PAYPAL!.surcharge).toEqual({ kind: 'flat', amount: 99 });
    expect(byType.APPLE_PAY!.surcharge).toEqual({ kind: 'flat', amount: 0 });
    expect(byType.PAYMENT_CARD!.surcharge).toBeUndefined();
  });

  it('maps PAYMENT_CARD per-network surcharges to kind=perNetwork', () => {
    const ctx: PrimerCheckoutContextValue = {
      ...readyContext,
      clientSession: {
        paymentMethodOptions: {
          PAYMENT_CARD: {
            networks: {
              VISA: { surcharge: { amount: 30 } },
              MASTERCARD: { surcharge: { amount: 50 } },
            },
          },
        },
      } as unknown as PrimerCheckoutContextValue['clientSession'],
    };
    const { result } = renderHook(() => usePrimerPaymentMethods(), contextWrapper(ctx));
    const card = result.current.paymentMethods.find((m) => m.type === 'PAYMENT_CARD')!;
    expect(card.surcharge).toEqual({ kind: 'perNetwork', amounts: { VISA: 30, MASTERCARD: 50 } });
  });

  it('ignores top-level surcharge on PAYMENT_CARD (backend quirk — networks are authoritative)', () => {
    const ctx: PrimerCheckoutContextValue = {
      ...readyContext,
      clientSession: {
        paymentMethodOptions: {
          PAYMENT_CARD: {
            surcharge: { amount: 100 }, // should be ignored — PAYMENT_CARD uses networks
            networks: { VISA: { surcharge: { amount: 30 } } },
          },
        },
      } as unknown as PrimerCheckoutContextValue['clientSession'],
    };
    const { result } = renderHook(() => usePrimerPaymentMethods(), contextWrapper(ctx));
    const card = result.current.paymentMethods.find((m) => m.type === 'PAYMENT_CARD')!;
    expect(card.surcharge).toEqual({ kind: 'perNetwork', amounts: { VISA: 30 } });
  });

  it('ignores networks on non-card methods', () => {
    const ctx: PrimerCheckoutContextValue = {
      ...readyContext,
      clientSession: {
        paymentMethodOptions: {
          PAYPAL: {
            surcharge: { amount: 99 },
            networks: { SOME_NETWORK: { surcharge: { amount: 5 } } },
          },
        },
      } as unknown as PrimerCheckoutContextValue['clientSession'],
    };
    const { result } = renderHook(() => usePrimerPaymentMethods(), contextWrapper(ctx));
    const paypal = result.current.paymentMethods.find((m) => m.type === 'PAYPAL')!;
    expect(paypal.surcharge).toEqual({ kind: 'flat', amount: 99 });
  });

  it('exposes native-view resource on the discriminated union', () => {
    const ctx: PrimerCheckoutContextValue = {
      ...readyContext,
      availablePaymentMethods: [makeMethod('IDEAL')],
      paymentMethodResources: [makeNativeViewResource('IDEAL', 'iDEAL', 'IdealNativeView')],
    };
    const { result } = renderHook(() => usePrimerPaymentMethods(), contextWrapper(ctx));
    const ideal = result.current.paymentMethods[0]!;
    // Consumers discriminate via `resource` directly.
    expect(ideal.resource && 'nativeViewName' in ideal.resource).toBe(true);
    expect(ideal.nativeViewName).toBe('IdealNativeView');
    expect(ideal.logo).toBeUndefined();
    expect(ideal.backgroundColor).toBeUndefined();
  });

  it.each<[string, PrimerColorScheme, { colored?: string; light?: string; dark?: string }, string]>([
    [
      'prefers colored logo when available regardless of color scheme',
      'dark',
      { colored: 'c.png', light: 'l.png', dark: 'd.png' },
      'c.png',
    ],
    [
      'picks dark logo when color scheme is dark and colored is absent',
      'dark',
      { light: 'l.png', dark: 'd.png' },
      'd.png',
    ],
    [
      'picks light logo when color scheme is light and colored is absent',
      'light',
      { light: 'l.png', dark: 'd.png' },
      'l.png',
    ],
    ['falls back across variants when theme-matching variant is missing', 'dark', { light: 'l.png' }, 'l.png'],
  ])('%s', (_, colorScheme, variants, expected) => {
    scheme = colorScheme;
    const ctx: PrimerCheckoutContextValue = {
      ...readyContext,
      availablePaymentMethods: [makeMethod('PAYPAL')],
      paymentMethodResources: [makeResourceWithVariants('PAYPAL', 'PayPal', variants)],
    };
    const { result } = renderHook(() => usePrimerPaymentMethods(), contextWrapper(ctx));
    expect(result.current.paymentMethods[0]!.logo).toBe(expected);
  });

  it('fires onLoad once after initial load with the built list', () => {
    const onLoad = jest.fn();
    renderHook(() => usePrimerPaymentMethods({ onLoad }), contextWrapper(readyContext));
    expect(onLoad).toHaveBeenCalledTimes(1);
    const calledWith = onLoad.mock.calls[0]![0];
    expect(calledWith.map((m: { type: string }) => m.type).sort()).toEqual(['APPLE_PAY', 'PAYMENT_CARD', 'PAYPAL']);
  });

  it('does not fire onLoad while loading', () => {
    const onLoad = jest.fn();
    const ctx: PrimerCheckoutContextValue = { ...readyContext, isReady: false };
    renderHook(() => usePrimerPaymentMethods({ onLoad }), contextWrapper(ctx));
    expect(onLoad).not.toHaveBeenCalled();
  });

  it('re-fires onLoad when the set of payment method types changes', () => {
    const onLoad = jest.fn();
    let setCtx: (next: PrimerCheckoutContextValue) => void = () => {};

    function Host() {
      const [ctx, setState] = useState(readyContext);
      setCtx = setState;
      return createElement(PrimerCheckoutContext.Provider, { value: ctx }, createElement(Inner));
    }
    function Inner() {
      usePrimerPaymentMethods({ onLoad });
      return null;
    }

    act(() => {
      create(createElement(Host));
    });
    expect(onLoad).toHaveBeenCalledTimes(1);

    // Rebuild context with same types — should NOT re-fire
    act(() => {
      setCtx({ ...readyContext, paymentMethodResources: [...readyContext.paymentMethodResources] });
    });
    expect(onLoad).toHaveBeenCalledTimes(1);

    // Change the set of types — SHOULD re-fire
    act(() => {
      setCtx({
        ...readyContext,
        availablePaymentMethods: [makeMethod('PAYMENT_CARD'), makeMethod('PAYPAL')],
      });
    });
    expect(onLoad).toHaveBeenCalledTimes(2);
  });
});
