import { createElement, type ReactNode } from 'react';
// @ts-expect-error -- react-test-renderer has no types for React 19
import { act, create } from 'react-test-renderer';
import { PrimerCheckoutContext } from '../../Components/internal/PrimerCheckoutContext';
import { usePaymentMethods } from '../../Components/hooks/usePaymentMethods';
import type { PrimerCheckoutContextValue } from '../../models/components/PrimerCheckoutProviderTypes';
import type { IPrimerHeadlessUniversalCheckoutPaymentMethod } from '../../models/PrimerHeadlessUniversalCheckoutPaymentMethod';
import type { PrimerPaymentMethodAsset } from '../../models/PrimerPaymentMethodResource';

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

    // PAYMENT_CARD is first by default (showCardFirst)
    const card = result.current.paymentMethods[0]!;
    expect(card.type).toBe('PAYMENT_CARD');
    expect(card.name).toBe('Card');
    expect(card.logo).toBe('https://logo/PAYMENT_CARD');
    expect(card.backgroundColor).toBe('#000');
    expect(card.categories).toEqual(['NATIVE_UI']);
    expect(card.intents).toEqual(['CHECKOUT']);
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

  it('sorts PAYMENT_CARD first by default', () => {
    const { result } = renderHook(() => usePaymentMethods(), contextWrapper(readyContext));
    expect(result.current.paymentMethods[0]!.type).toBe('PAYMENT_CARD');
  });

  it('preserves API order when showCardFirst is false', () => {
    const { result } = renderHook(() => usePaymentMethods({ showCardFirst: false }), contextWrapper(readyContext));
    expect(result.current.paymentMethods.map((m) => m.type)).toEqual(['PAYMENT_CARD', 'PAYPAL', 'APPLE_PAY']);
  });

  it('handles methods without matching resources', () => {
    const ctx: PrimerCheckoutContextValue = {
      ...readyContext,
      paymentMethodResources: [], // no resources
    };
    const { result } = renderHook(() => usePaymentMethods(), contextWrapper(ctx));
    expect(result.current.paymentMethods).toHaveLength(3);
    // falls back to formatted type name
    const paypal = result.current.paymentMethods.find((m) => m.type === 'PAYPAL');
    expect(paypal?.name).toBe('PAYPAL');
    expect(paypal?.logo).toBeUndefined();
    expect(paypal?.resource).toBeUndefined();
  });

  it('silently ignores non-existent include types', () => {
    const { result } = renderHook(
      () => usePaymentMethods({ include: ['DOES_NOT_EXIST'] }),
      contextWrapper(readyContext)
    );
    expect(result.current.paymentMethods).toHaveLength(0);
  });
});
