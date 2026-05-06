import { createElement, type ReactNode } from 'react';
// @ts-expect-error -- react-test-renderer has no types for React 19
import { act, create } from 'react-test-renderer';
import { PrimerCheckoutContext } from '../../../Components/internal/PrimerCheckoutContext';
import { useCardForm } from '../../../Components/hooks/useCardForm';
import type { CardNetworkDescriptor } from '../../../Components/internal/cardNetwork';
import type { PrimerCheckoutContextValue } from '../../../Components/types/PrimerCheckoutProviderTypes';
import type { CardFormErrors } from '../../../Components/types/CardFormTypes';

const DEFAULT_DESCRIPTOR: CardNetworkDescriptor = {
  id: 'OTHER',
  displayName: 'Card',
  panLengths: [16, 17, 18, 19],
  gapPattern: [4, 8, 12],
  cvvLength: 3,
  cvvLabel: 'CVV',
};

// @ts-expect-error -- React 19 concurrent act environment
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

jest.mock('react-native', () => ({ useColorScheme: () => 'light' }), { virtual: true });

let mockDescriptor: CardNetworkDescriptor = DEFAULT_DESCRIPTOR;
jest.mock('../../../Components/hooks/useCardNetwork', () => ({
  useCardNetwork: () => ({ network: mockDescriptor.id, descriptor: mockDescriptor, iconSource: null }),
}));

beforeEach(() => {
  mockDescriptor = DEFAULT_DESCRIPTOR;
});

const baseContext: PrimerCheckoutContextValue = {
  isReady: true,
  error: null,
  clientSession: null,
  availablePaymentMethods: [],
  paymentMethodResources: [],
  isLoadingResources: false,
  resourcesError: null,
  settings: undefined,
  paymentOutcome: null,
  activeMethod: 'PAYMENT_CARD',
  cardFormState: { isValid: false, errors: {}, binData: null, metadata: null, requiredFields: [] },
  vaultedMethods: [],
  vaultedIconUrisById: {},
  isLoadingVaulted: false,
  vaultedError: null,
  setActiveMethod: () => {},
  setRawData: async () => {},
  submit: async () => {},
  retry: async () => {},
  clearPaymentOutcome: () => {},
  payFromVault: async () => {},
};

function withErrors(errors: CardFormErrors): PrimerCheckoutContextValue {
  return { ...baseContext, cardFormState: { ...baseContext.cardFormState, errors } };
}

function contextWrapper(value: PrimerCheckoutContextValue) {
  return ({ children }: { children: ReactNode }) => createElement(PrimerCheckoutContext.Provider, { value }, children);
}

function renderHook<T>(hook: () => T, Wrapper: (props: { children: ReactNode }) => ReactNode) {
  const result = { current: null as unknown as T };
  function HookComponent() {
    result.current = hook();
    return null;
  }
  let renderer: { update: (el: ReactNode) => void } | null = null;
  act(() => {
    renderer = create(createElement(Wrapper, { children: createElement(HookComponent) }));
  });
  function rerender(value: PrimerCheckoutContextValue) {
    act(() => {
      renderer!.update(createElement(contextWrapper(value), { children: createElement(HookComponent) }));
    });
  }
  return { result, rerender };
}

const ALL_FIELD_ERRORS: CardFormErrors = {
  cardNumber: 'Invalid card number',
  expiryDate: 'Invalid expiry',
  cvv: 'Invalid CVV',
  cardholderName: 'Cardholder required',
};

describe('useCardForm — error visibility', () => {
  it('hides errors before any field has been focused', () => {
    const { result } = renderHook(() => useCardForm(), contextWrapper(withErrors(ALL_FIELD_ERRORS)));
    expect(result.current.errors).toEqual({});
  });

  it('hides errors on a focused-but-not-yet-blurred field', () => {
    const { result } = renderHook(() => useCardForm(), contextWrapper(withErrors(ALL_FIELD_ERRORS)));
    act(() => result.current.markFieldFocused('cardNumber'));
    expect(result.current.errors).toEqual({});
  });

  it('shows the field error after focus + blur', () => {
    const { result } = renderHook(() => useCardForm(), contextWrapper(withErrors(ALL_FIELD_ERRORS)));
    act(() => result.current.markFieldFocused('cardNumber'));
    act(() => result.current.markFieldBlurred('cardNumber'));
    expect(result.current.errors).toEqual({ cardNumber: 'Invalid card number' });
  });

  it('hides the field error when re-focused (on-focus-clear)', () => {
    const { result } = renderHook(() => useCardForm(), contextWrapper(withErrors(ALL_FIELD_ERRORS)));
    act(() => result.current.markFieldFocused('cvv'));
    act(() => result.current.markFieldBlurred('cvv'));
    expect(result.current.errors).toEqual({ cvv: 'Invalid CVV' });
    act(() => result.current.markFieldFocused('cvv'));
    expect(result.current.errors).toEqual({});
  });

  it('shows every error after markSubmitAttempted regardless of focus state', () => {
    const { result } = renderHook(() => useCardForm(), contextWrapper(withErrors(ALL_FIELD_ERRORS)));
    act(() => result.current.markSubmitAttempted());
    expect(result.current.errors).toEqual(ALL_FIELD_ERRORS);
    expect(result.current.submitAttempted).toBe(true);
  });

  it('keeps errors visible when user re-focuses a field after submit attempt', () => {
    const { result } = renderHook(() => useCardForm(), contextWrapper(withErrors(ALL_FIELD_ERRORS)));
    act(() => result.current.markSubmitAttempted());
    act(() => result.current.markFieldFocused('cardNumber'));
    expect(result.current.errors.cardNumber).toBe('Invalid card number');
  });

  it('reset() clears submitAttempted and focus/blur state', () => {
    const { result } = renderHook(() => useCardForm(), contextWrapper(withErrors(ALL_FIELD_ERRORS)));
    act(() => result.current.markSubmitAttempted());
    act(() => result.current.reset());
    expect(result.current.submitAttempted).toBe(false);
    expect(result.current.errors).toEqual({});
  });
});

describe('useCardForm — descriptor-driven dimensions', () => {
  it('cardNumberMaxLength tracks descriptor (default 22 = 19 digits + 3 gaps within)', () => {
    const { result } = renderHook(() => useCardForm(), contextWrapper(baseContext));
    expect(result.current.cardNumberMaxLength).toBe(22);
  });

  it('cardNumberMaxLength shrinks for Amex (15 digits + 2 gaps = 17)', () => {
    mockDescriptor = {
      id: 'AMEX',
      displayName: 'American Express',
      panLengths: [15],
      gapPattern: [4, 10],
      cvvLength: 4,
      cvvLabel: 'CID',
    };
    const { result } = renderHook(() => useCardForm(), contextWrapper(baseContext));
    expect(result.current.cardNumberMaxLength).toBe(17);
  });

  it('descriptor.cvvLength on Amex is 4', () => {
    mockDescriptor = {
      id: 'AMEX',
      displayName: 'American Express',
      panLengths: [15],
      gapPattern: [4, 10],
      cvvLength: 4,
      cvvLabel: 'CID',
    };
    const { result } = renderHook(() => useCardForm(), contextWrapper(baseContext));
    expect(result.current.descriptor.cvvLength).toBe(4);
    expect(result.current.descriptor.cvvLabel).toBe('CID');
  });
});
