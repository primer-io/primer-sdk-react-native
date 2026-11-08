import { createElement, type ReactNode } from 'react';
// @ts-expect-error -- react-test-renderer has no types for React 19
import { act, create } from 'react-test-renderer';
import { PrimerCheckoutContext } from '../../../Components/internal/PrimerCheckoutContext';
import { PrimerCardFormProvider } from '../../../Components/internal/form-state/CardFormStateProvider';
import { usePrimerCardForm } from '../../../Components/hooks/usePrimerCardForm';
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
jest.mock('../../../Components/hooks/usePrimerCardNetwork', () => ({
  usePrimerCardNetwork: () => ({ network: mockDescriptor.id, descriptor: mockDescriptor, iconSource: null }),
}));

beforeEach(() => {
  mockDescriptor = DEFAULT_DESCRIPTOR;
});

const baseContext: PrimerCheckoutContextValue = {
  isReady: true,
  error: null,
  clientSession: null,
  acceptedCardNetworks: null,
  availablePaymentMethods: [],
  paymentMethodResources: [],
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
  activeMethod: 'PAYMENT_CARD',
  cardFormState: { isValid: false, errors: {}, errorIds: {}, binData: null, metadata: null, requiredFields: [] },
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

function withErrors(errors: CardFormErrors): PrimerCheckoutContextValue {
  return { ...baseContext, cardFormState: { ...baseContext.cardFormState, errors } };
}

function contextWrapper(value: PrimerCheckoutContextValue) {
  return ({ children }: { children: ReactNode }) =>
    createElement(PrimerCheckoutContext.Provider, { value }, createElement(PrimerCardFormProvider, null, children));
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

describe('usePrimerCardForm — error visibility', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  const settleNativeCheck = () => act(() => jest.runOnlyPendingTimers());

  it('hides errors before any field has been focused', () => {
    const { result } = renderHook(() => usePrimerCardForm(), contextWrapper(withErrors(ALL_FIELD_ERRORS)));
    expect(result.current.errors).toEqual({});
  });

  it('hides errors on a focused-but-not-yet-blurred field', () => {
    const { result } = renderHook(() => usePrimerCardForm(), contextWrapper(withErrors(ALL_FIELD_ERRORS)));
    act(() => result.current.markFieldFocused('cardNumber'));
    expect(result.current.errors).toEqual({});
  });

  it('keeps the field error when re-focused', () => {
    const { result } = renderHook(() => usePrimerCardForm(), contextWrapper(withErrors(ALL_FIELD_ERRORS)));
    act(() => result.current.updateCVV('12'));
    settleNativeCheck();
    act(() => result.current.markFieldFocused('cvv'));
    act(() => result.current.markFieldBlurred('cvv'));
    expect(result.current.errors).toEqual({ cvv: 'CVV must be 3 digits' });
    act(() => result.current.markFieldFocused('cvv'));
    expect(result.current.errors).toEqual({ cvv: 'CVV must be 3 digits' });
  });

  it('hides the error of a field left empty', () => {
    const { result } = renderHook(() => usePrimerCardForm(), contextWrapper(withErrors(ALL_FIELD_ERRORS)));
    act(() => result.current.markFieldFocused('expiryDate'));
    act(() => result.current.markFieldBlurred('expiryDate'));
    expect(result.current.errors).toEqual({});
  });

  it('hides the error of a left field once its value is cleared', () => {
    const { result } = renderHook(() => usePrimerCardForm(), contextWrapper(withErrors(ALL_FIELD_ERRORS)));
    act(() => result.current.updateCardholderName('J'));
    settleNativeCheck();
    act(() => result.current.markFieldFocused('cardholderName'));
    act(() => result.current.markFieldBlurred('cardholderName'));
    expect(result.current.errors).toEqual({ cardholderName: 'Name must have between 2 and 45 characters' });
    act(() => result.current.updateCardholderName(''));
    expect(result.current.errors).toEqual({});
  });

  it('keeps the errors reference and skips onValidationChange while typing in a filled field', () => {
    const onValidationChange = jest.fn();
    const { result } = renderHook(
      () => usePrimerCardForm({ onValidationChange }),
      contextWrapper(withErrors(ALL_FIELD_ERRORS))
    );
    act(() => result.current.updateCardholderName('J'));
    settleNativeCheck();
    act(() => result.current.markFieldFocused('cardholderName'));
    act(() => result.current.markFieldBlurred('cardholderName'));
    const errorsBeforeTyping = result.current.errors;
    onValidationChange.mockClear();
    act(() => result.current.updateCardholderName('Jo'));
    act(() => result.current.updateCardholderName('Joe'));
    settleNativeCheck();
    expect(result.current.errors).toBe(errorsBeforeTyping);
    expect(onValidationChange).not.toHaveBeenCalled();
  });

  it('shows every error after markSubmitAttempted regardless of focus state', () => {
    const { result } = renderHook(() => usePrimerCardForm(), contextWrapper(withErrors(ALL_FIELD_ERRORS)));
    act(() => result.current.markSubmitAttempted());
    expect(result.current.errors).toEqual({
      cardNumber: 'Card number is required',
      expiryDate: 'Expiry date is required',
      cvv: 'CVV number is required',
      cardholderName: 'Name on card is required',
    });
    expect(result.current.submitAttempted).toBe(true);
  });

  it('keeps errors visible when user re-focuses a field after submit attempt', () => {
    const { result } = renderHook(() => usePrimerCardForm(), contextWrapper(withErrors(ALL_FIELD_ERRORS)));
    act(() => result.current.markSubmitAttempted());
    act(() => result.current.markFieldFocused('cardNumber'));
    expect(result.current.errors.cardNumber).toBe('Card number is required');
  });

  it('reset() clears submitAttempted and focus/blur state', () => {
    const { result } = renderHook(() => usePrimerCardForm(), contextWrapper(withErrors(ALL_FIELD_ERRORS)));
    act(() => result.current.markSubmitAttempted());
    act(() => result.current.reset());
    expect(result.current.submitAttempted).toBe(false);
    expect(result.current.errors).toEqual({});
  });
});

describe('usePrimerCardForm — descriptor-driven dimensions', () => {
  it.each<[string, CardNetworkDescriptor, number]>([
    ['tracks descriptor (default 22 = 19 digits + 3 gaps within)', DEFAULT_DESCRIPTOR, 22],
    [
      'shrinks for Amex (15 digits + 2 gaps = 17)',
      {
        id: 'AMEX',
        displayName: 'American Express',
        panLengths: [15],
        gapPattern: [4, 10],
        cvvLength: 4,
        cvvLabel: 'CID',
      },
      17,
    ],
  ])('cardNumberMaxLength %s', (_, descriptor, expected) => {
    mockDescriptor = descriptor;
    const { result } = renderHook(() => usePrimerCardForm(), contextWrapper(baseContext));
    expect(result.current.cardNumberMaxLength).toBe(expected);
  });
});
