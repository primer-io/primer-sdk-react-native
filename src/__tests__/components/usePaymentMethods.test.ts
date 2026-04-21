import { createElement, useState, type ReactNode } from 'react';
// @ts-expect-error -- react-test-renderer has no types for React 19
import { act, create } from 'react-test-renderer';
import { PrimerCheckoutContext } from '../../Components/internal/PrimerCheckoutContext';
import { usePaymentMethods } from '../../Components/hooks/usePaymentMethods';
import type { PrimerCheckoutContextValue } from '../../Components/types/PrimerCheckoutProviderTypes';
import type { IPrimerHeadlessUniversalCheckoutPaymentMethod } from '../../models/PrimerHeadlessUniversalCheckoutPaymentMethod';
import type { PrimerPaymentMethodAsset, PrimerPaymentMethodNativeView } from '../../models/PrimerPaymentMethodResource';
import type { UsePaymentMethodsReturn } from '../../Components/types/PaymentMethodTypes';

// @ts-expect-error -- React 19 concurrent act environment
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

jest.mock('react-native', () => ({}), { virtual: true });

function renderHook<T>(hook: () => T, Wrapper?: (props: { children: ReactNode }) => ReactNode | null) {
  const result = { current: null as unknown as T };

  function HookComponent() {
    result.current = hook();
    return null;
  }

  act(() => {
    create(Wrapper ? createElement(Wrapper, { children: createElement(HookComponent) }) : createElement(HookComponent));
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

function makeNativeViewResource(type: string, name: string, nativeViewName: string): PrimerPaymentMethodNativeView {
  return {
    paymentMethodType: type,
    paymentMethodName: name,
    nativeViewName,
  };
}

function contextWrapper(value: PrimerCheckoutContextValue) {
  return ({ children }: { children: ReactNode }) => createElement(PrimerCheckoutContext.Provider, { value }, children);
}

const readyContext: PrimerCheckoutContextValue = {
  isReady: true,
  error: null,
  clientSession: null,
  availablePaymentMethods: [makeMethod('PAYMENT_CARD'), makeMethod('PAYPAL'), makeMethod('APPLE_PAY')],
  paymentMethodResources: [
    makeResource('PAYMENT_CARD', 'Card'),
    makeResource('PAYPAL', 'PayPal'),
    makeResource('APPLE_PAY', 'Apple Pay'),
  ],
  isLoadingResources: false,
  resourcesError: null,
};

describe('usePaymentMethods', () => {
  it('throws when used outside provider', () => {
    expect(() => renderHook(() => usePaymentMethods())).toThrow(
      'usePrimerCheckout must be used within a <PrimerCheckoutProvider>'
    );
  });

  it('returns isLoading true when SDK is not ready', () => {
    const ctx: PrimerCheckoutContextValue = {
      ...readyContext,
      isReady: false,
    };
    const { result } = renderHook(() => usePaymentMethods(), contextWrapper(ctx));
    expect(result.current.isLoading).toBe(true);
    expect(result.current.paymentMethods).toEqual([]);
  });

  it('returns isLoading true while resources are loading', () => {
    const ctx: PrimerCheckoutContextValue = {
      ...readyContext,
      isLoadingResources: true,
    };
    const { result } = renderHook(() => usePaymentMethods(), contextWrapper(ctx));
    expect(result.current.isLoading).toBe(true);
    expect(result.current.paymentMethods).toEqual([]);
  });

  it('merges methods with resources when ready', () => {
    const { result } = renderHook(() => usePaymentMethods(), contextWrapper(readyContext));
    expect(result.current.isLoading).toBe(false);
    expect(result.current.paymentMethods).toHaveLength(3);

    const card = result.current.paymentMethods.find((m) => m.type === 'PAYMENT_CARD')!;
    expect(card.name).toBe('Card');
    expect(card.logo).toBe('https://logo/PAYMENT_CARD');
    expect(card.backgroundColor).toBe('#000');
    expect(card.categories).toEqual(['NATIVE_UI']);
    expect(card.intents).toEqual(['CHECKOUT']);
  });

  it('preserves API order (no implicit sort)', () => {
    const { result } = renderHook(() => usePaymentMethods(), contextWrapper(readyContext));
    expect(result.current.paymentMethods.map((m) => m.type)).toEqual(['PAYMENT_CARD', 'PAYPAL', 'APPLE_PAY']);
  });

  it('filters by include', () => {
    const { result } = renderHook(() => usePaymentMethods({ include: ['PAYPAL'] }), contextWrapper(readyContext));
    expect(result.current.paymentMethods).toHaveLength(1);
    expect(result.current.paymentMethods[0]!.type).toBe('PAYPAL');
  });

  it('filters by exclude', () => {
    const { result } = renderHook(() => usePaymentMethods({ exclude: ['APPLE_PAY'] }), contextWrapper(readyContext));
    expect(result.current.paymentMethods).toHaveLength(2);
    expect(result.current.paymentMethods.find((m) => m.type === 'APPLE_PAY')).toBeUndefined();
  });

  it('applies include then exclude', () => {
    const { result } = renderHook(
      () => usePaymentMethods({ include: ['PAYMENT_CARD', 'PAYPAL'], exclude: ['PAYPAL'] }),
      contextWrapper(readyContext)
    );
    expect(result.current.paymentMethods).toHaveLength(1);
    expect(result.current.paymentMethods[0]!.type).toBe('PAYMENT_CARD');
  });

  it('handles methods without matching resources', () => {
    const ctx: PrimerCheckoutContextValue = {
      ...readyContext,
      paymentMethodResources: [], // no resources
    };
    const { result } = renderHook(() => usePaymentMethods(), contextWrapper(ctx));
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

  it('silently ignores non-existent include types', () => {
    const { result } = renderHook(
      () => usePaymentMethods({ include: ['DOES_NOT_EXIST'] }),
      contextWrapper(readyContext)
    );
    expect(result.current.paymentMethods).toHaveLength(0);
  });

  it('passes resourcesError through from context', () => {
    const err = new Error('assets fetch failed');
    const ctx: PrimerCheckoutContextValue = { ...readyContext, resourcesError: err };
    const { result } = renderHook(() => usePaymentMethods(), contextWrapper(ctx));
    expect(result.current.resourcesError).toBe(err);
  });

  it('selectMethod stores selection; selectedMethod resolves to current item', () => {
    const { result } = renderHook(() => usePaymentMethods(), contextWrapper(readyContext));
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
    let hookResult: UsePaymentMethodsReturn = null as unknown as UsePaymentMethodsReturn;
    let setCtx: (next: PrimerCheckoutContextValue) => void = () => {};

    function Host() {
      const [ctx, setState] = useState(readyContext);
      setCtx = setState;
      return createElement(PrimerCheckoutContext.Provider, { value: ctx }, createElement(Inner));
    }
    function Inner() {
      hookResult = usePaymentMethods();
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

  it('selectedMethod becomes null when selection is filtered out', () => {
    let hookResult: UsePaymentMethodsReturn = null as unknown as UsePaymentMethodsReturn;
    let setExclude: (next: string[]) => void = () => {};

    function Host() {
      const [exclude, setState] = useState<string[]>([]);
      setExclude = setState;
      return createElement(PrimerCheckoutContext.Provider, { value: readyContext }, createElement(Inner, { exclude }));
    }
    function Inner({ exclude }: { exclude: string[] }) {
      hookResult = usePaymentMethods({ exclude });
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

    act(() => {
      setExclude(['PAYPAL']);
    });

    expect(hookResult.selectedMethod).toBeNull();
  });

  it('clears selection permanently when filtered out (does not come back after un-exclude)', () => {
    let hookResult: UsePaymentMethodsReturn = null as unknown as UsePaymentMethodsReturn;
    let setExclude: (next: string[]) => void = () => {};

    function Host() {
      const [exclude, setState] = useState<string[]>([]);
      setExclude = setState;
      return createElement(PrimerCheckoutContext.Provider, { value: readyContext }, createElement(Inner, { exclude }));
    }
    function Inner({ exclude }: { exclude: string[] }) {
      hookResult = usePaymentMethods({ exclude });
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
    const { result } = renderHook(() => usePaymentMethods(), contextWrapper(ctx));
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
    const { result } = renderHook(() => usePaymentMethods(), contextWrapper(ctx));
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
    const { result } = renderHook(() => usePaymentMethods(), contextWrapper(ctx));
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
    const { result } = renderHook(() => usePaymentMethods(), contextWrapper(ctx));
    const paypal = result.current.paymentMethods.find((m) => m.type === 'PAYPAL')!;
    expect(paypal.surcharge).toEqual({ kind: 'flat', amount: 99 });
  });

  it('exposes native-view resource on the discriminated union', () => {
    const ctx: PrimerCheckoutContextValue = {
      ...readyContext,
      availablePaymentMethods: [makeMethod('IDEAL')],
      paymentMethodResources: [makeNativeViewResource('IDEAL', 'iDEAL', 'IdealNativeView')],
    };
    const { result } = renderHook(() => usePaymentMethods(), contextWrapper(ctx));
    const ideal = result.current.paymentMethods[0]!;
    // Consumers discriminate via `resource` directly.
    expect(ideal.resource && 'nativeViewName' in ideal.resource).toBe(true);
    expect(ideal.nativeViewName).toBe('IdealNativeView');
    expect(ideal.logo).toBeUndefined();
    expect(ideal.backgroundColor).toBeUndefined();
  });

  it('exposes asset resource on the discriminated union', () => {
    const { result } = renderHook(() => usePaymentMethods(), contextWrapper(readyContext));
    const card = result.current.paymentMethods.find((m) => m.type === 'PAYMENT_CARD')!;
    expect(card.resource && 'paymentMethodLogo' in card.resource).toBe(true);
    expect(card.nativeViewName).toBeUndefined();
  });

  it('fires onLoad once after initial load with the built list', () => {
    const onLoad = jest.fn();
    renderHook(() => usePaymentMethods({ onLoad }), contextWrapper(readyContext));
    expect(onLoad).toHaveBeenCalledTimes(1);
    const calledWith = onLoad.mock.calls[0]![0];
    expect(calledWith.map((m: { type: string }) => m.type).sort()).toEqual(['APPLE_PAY', 'PAYMENT_CARD', 'PAYPAL']);
  });

  it('does not fire onLoad while loading', () => {
    const onLoad = jest.fn();
    const ctx: PrimerCheckoutContextValue = { ...readyContext, isReady: false };
    renderHook(() => usePaymentMethods({ onLoad }), contextWrapper(ctx));
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
      usePaymentMethods({ onLoad });
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
