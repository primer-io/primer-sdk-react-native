import { createElement, type ReactNode } from 'react';
// @ts-expect-error -- react-test-renderer has no types for React 19
import { act, create } from 'react-test-renderer';
import { PrimerCheckoutContext } from '../../Components/internal/PrimerCheckoutContext';
import { usePrimerVaultManager } from '../../Components/hooks/usePrimerVaultManager';
import type { PrimerCheckoutContextValue } from '../../Components/types/PrimerCheckoutProviderTypes';
import type { PrimerVaultedPaymentMethod } from '../../models/PrimerVaultedPaymentMethod';

// @ts-expect-error -- React 19 concurrent act environment
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

jest.mock('react-native', () => ({ useColorScheme: () => 'light' }), { virtual: true });

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

function contextWrapper(value: PrimerCheckoutContextValue) {
  return ({ children }: { children: ReactNode }) => createElement(PrimerCheckoutContext.Provider, { value }, children);
}

function makeCardVault(overrides: Partial<PrimerVaultedPaymentMethod> = {}): PrimerVaultedPaymentMethod {
  return {
    id: 'vault-1',
    analyticsId: 'a1',
    paymentInstrumentType: 'PAYMENT_CARD',
    paymentMethodType: 'PAYMENT_CARD',
    paymentInstrumentData: {
      cardholderName: 'John Appleseed',
      network: 'MASTERCARD',
      last4Digits: 1234,
      expirationMonth: 5,
      expirationYear: 2026,
    },
    ...overrides,
  };
}

const payFromVault = jest.fn().mockResolvedValue(undefined);
const deleteVaultedPaymentMethodFn = jest.fn().mockResolvedValue(undefined);

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
  activeMethod: null,
  cardFormState: { isValid: false, errors: {}, binData: null, metadata: null, requiredFields: [] },
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
  payFromVault,
  activeVaultedMethodId: null,
  vaultDisplayOverride: null,
  selectVaultedMethodId: () => {},
  requestExpandedVaultDisplay: () => {},
  deleteVaultedPaymentMethod: deleteVaultedPaymentMethodFn,
  requiresVaultedCardCvv: false,
  cvvInputVisible: false,
  setCvvInputVisible: () => {},
};

beforeEach(() => {
  payFromVault.mockClear();
  deleteVaultedPaymentMethodFn.mockClear();
});

describe('usePrimerVaultManager', () => {
  it('returns empty list and null primary when there are no vaulted methods', () => {
    const { result } = renderHook(() => usePrimerVaultManager(), contextWrapper(baseContext));
    expect(result.current.vaultedMethods).toEqual([]);
    expect(result.current.primaryMethod).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('derives card-vault display fields (last4, expiry, brand)', () => {
    const vault = makeCardVault();
    const ctx: PrimerCheckoutContextValue = {
      ...baseContext,
      vaultedMethods: [vault],
      vaultedIconUrisById: { 'vault-1': 'file:///tmp/mastercard.png' },
    };
    const { result } = renderHook(() => usePrimerVaultManager(), contextWrapper(ctx));
    const item = result.current.primaryMethod;
    expect(item?.kind).toBe('card');
    if (item?.kind !== 'card') throw new Error('expected a card vault');
    expect(item.id).toBe('vault-1');
    expect(item.cardholderName).toBe('John Appleseed');
    expect(item.last4).toBe('1234');
    expect(item.expiryMonth).toBe('05');
    expect(item.expiryYear).toBe('26');
    expect(item.brandName).toBe('Mastercard');
    expect(item.network).toBe('MASTERCARD');
    expect(item.iconUri).toBe('file:///tmp/mastercard.png');
  });

  it('parses a bank (ACH) vault: kind, bankName, accountLast4, displayName', () => {
    const bank: PrimerVaultedPaymentMethod = {
      id: 'ach-1',
      analyticsId: 'a',
      paymentInstrumentType: 'AUTOMATED_CLEARING_HOUSE',
      paymentMethodType: 'STRIPE_ACH',
      paymentInstrumentData: { bankName: 'STRIPE TEST BANK', accountNumberLast4Digits: 6789 },
    };
    const ctx: PrimerCheckoutContextValue = {
      ...baseContext,
      vaultedMethods: [bank],
      vaultedNamesById: { 'ach-1': 'ACH Direct Debit' },
    };
    const { result } = renderHook(() => usePrimerVaultManager(), contextWrapper(ctx));
    const item = result.current.primaryMethod;
    expect(item?.kind).toBe('bank');
    if (item?.kind !== 'bank') throw new Error('expected a bank vault');
    expect(item.bankName).toBe('STRIPE TEST BANK');
    expect(item.accountLast4).toBe('6789');
    expect(item.displayName).toBe('ACH Direct Debit');
  });

  it('picks the first method as primary', () => {
    const first = makeCardVault({ id: 'first' });
    const second = makeCardVault({ id: 'second' });
    const ctx: PrimerCheckoutContextValue = { ...baseContext, vaultedMethods: [first, second] };
    const { result } = renderHook(() => usePrimerVaultManager(), contextWrapper(ctx));
    expect(result.current.primaryMethod?.id).toBe('first');
    expect(result.current.vaultedMethods).toHaveLength(2);
  });

  it('pay() is a no-op when no primary method exists', async () => {
    const { result } = renderHook(() => usePrimerVaultManager(), contextWrapper(baseContext));
    await result.current.pay();
    expect(payFromVault).not.toHaveBeenCalled();
  });

  it('pay() delegates to payFromVault with primary method id', async () => {
    const vault = makeCardVault();
    const ctx: PrimerCheckoutContextValue = { ...baseContext, vaultedMethods: [vault] };
    const { result } = renderHook(() => usePrimerVaultManager(), contextWrapper(ctx));
    await result.current.pay();
    expect(payFromVault).toHaveBeenCalledWith('vault-1', undefined);
  });

  it('payById() delegates to payFromVault with the passed id', async () => {
    const { result } = renderHook(() => usePrimerVaultManager(), contextWrapper(baseContext));
    await result.current.payById('explicit-id');
    expect(payFromVault).toHaveBeenCalledWith('explicit-id', undefined);
  });

  it('surfaces isLoading / error from context', () => {
    const err = new Error('boom');
    const ctx: PrimerCheckoutContextValue = {
      ...baseContext,
      isLoadingVaulted: true,
      vaultedError: err,
    };
    const { result } = renderHook(() => usePrimerVaultManager(), contextWrapper(ctx));
    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBe(err);
  });

  it('parses a non-card vault (PayPal) as kind "other" with detail + displayName', () => {
    const paypal: PrimerVaultedPaymentMethod = {
      id: 'pp-1',
      analyticsId: 'a',
      paymentInstrumentType: 'PAYPAL',
      paymentMethodType: 'PAYPAL',
      paymentInstrumentData: { externalPayerInfo: { email: 'a@b.c' } },
    };
    const ctx: PrimerCheckoutContextValue = {
      ...baseContext,
      vaultedMethods: [paypal],
      vaultedNamesById: { 'pp-1': 'PayPal' },
    };
    const { result } = renderHook(() => usePrimerVaultManager(), contextWrapper(ctx));
    const item = result.current.primaryMethod;
    expect(item?.kind).toBe('other');
    if (item?.kind !== 'other') throw new Error('expected an other-kind vault');
    expect(item.detail).toBe('a••••@b.c');
    expect(item.displayName).toBe('PayPal');
  });

  describe('originalDefault & activeMethod', () => {
    it('originalDefault is the first method on the session', () => {
      const ctx: PrimerCheckoutContextValue = {
        ...baseContext,
        vaultedMethods: [makeCardVault({ id: 'first' }), makeCardVault({ id: 'second' })],
      };
      const { result } = renderHook(() => usePrimerVaultManager(), contextWrapper(ctx));
      expect(result.current.originalDefault?.id).toBe('first');
    });

    it('activeMethod falls back to originalDefault when no override is set', () => {
      const ctx: PrimerCheckoutContextValue = {
        ...baseContext,
        vaultedMethods: [makeCardVault({ id: 'first' }), makeCardVault({ id: 'second' })],
      };
      const { result } = renderHook(() => usePrimerVaultManager(), contextWrapper(ctx));
      expect(result.current.activeMethod?.id).toBe('first');
    });

    it('activeMethod resolves to the user-selected method when activeVaultedMethodId is set', () => {
      const ctx: PrimerCheckoutContextValue = {
        ...baseContext,
        vaultedMethods: [makeCardVault({ id: 'first' }), makeCardVault({ id: 'second' })],
        activeVaultedMethodId: 'second',
      };
      const { result } = renderHook(() => usePrimerVaultManager(), contextWrapper(ctx));
      expect(result.current.activeMethod?.id).toBe('second');
    });

    it('activeMethod falls back to originalDefault when activeVaultedMethodId is missing from the list', () => {
      const ctx: PrimerCheckoutContextValue = {
        ...baseContext,
        vaultedMethods: [makeCardVault({ id: 'first' }), makeCardVault({ id: 'second' })],
        activeVaultedMethodId: 'gone',
      };
      const { result } = renderHook(() => usePrimerVaultManager(), contextWrapper(ctx));
      expect(result.current.activeMethod?.id).toBe('first');
    });
  });

  describe('vaultDisplayMode', () => {
    it('is expanded before any selection has been made (activeVaultedMethodId === null)', () => {
      const ctx: PrimerCheckoutContextValue = {
        ...baseContext,
        vaultedMethods: [makeCardVault({ id: 'a' }), makeCardVault({ id: 'b' })],
      };
      const { result } = renderHook(() => usePrimerVaultManager(), contextWrapper(ctx));
      expect(result.current.vaultDisplayMode).toBe('expanded');
    });

    it('is lite once activeVaultedMethodId is set, regardless of whether the chosen method is the default', () => {
      const ctxNonDefault: PrimerCheckoutContextValue = {
        ...baseContext,
        vaultedMethods: [makeCardVault({ id: 'a' }), makeCardVault({ id: 'b' })],
        activeVaultedMethodId: 'b',
      };
      const nonDefault = renderHook(() => usePrimerVaultManager(), contextWrapper(ctxNonDefault));
      expect(nonDefault.result.current.vaultDisplayMode).toBe('lite');

      const ctxDefault: PrimerCheckoutContextValue = {
        ...baseContext,
        vaultedMethods: [makeCardVault({ id: 'a' }), makeCardVault({ id: 'b' })],
        activeVaultedMethodId: 'a',
      };
      const def = renderHook(() => usePrimerVaultManager(), contextWrapper(ctxDefault));
      expect(def.result.current.vaultDisplayMode).toBe('lite');
    });

    it('is expanded when vaultDisplayOverride is set to expanded (revert via Show other ways to pay)', () => {
      const ctx: PrimerCheckoutContextValue = {
        ...baseContext,
        vaultedMethods: [makeCardVault({ id: 'a' }), makeCardVault({ id: 'b' })],
        activeVaultedMethodId: 'b',
        vaultDisplayOverride: 'expanded',
      };
      const { result } = renderHook(() => usePrimerVaultManager(), contextWrapper(ctx));
      expect(result.current.vaultDisplayMode).toBe('expanded');
      // Selection itself is preserved.
      expect(result.current.activeMethod?.id).toBe('b');
    });
  });

  describe('pay() with active selection', () => {
    it('charges the user-selected method when activeVaultedMethodId is set', async () => {
      const ctx: PrimerCheckoutContextValue = {
        ...baseContext,
        vaultedMethods: [makeCardVault({ id: 'a' }), makeCardVault({ id: 'b' })],
        activeVaultedMethodId: 'b',
      };
      const { result } = renderHook(() => usePrimerVaultManager(), contextWrapper(ctx));
      await result.current.pay();
      expect(payFromVault).toHaveBeenCalledWith('b', undefined);
    });

    it('charges originalDefault when no selection has been made', async () => {
      const ctx: PrimerCheckoutContextValue = {
        ...baseContext,
        vaultedMethods: [makeCardVault({ id: 'a' }), makeCardVault({ id: 'b' })],
      };
      const { result } = renderHook(() => usePrimerVaultManager(), contextWrapper(ctx));
      await result.current.pay();
      expect(payFromVault).toHaveBeenCalledWith('a', undefined);
    });
  });

  describe('deleteVaultedPaymentMethod', () => {
    it('exposes the context method', () => {
      const { result } = renderHook(() => usePrimerVaultManager(), contextWrapper(baseContext));
      expect(typeof result.current.deleteVaultedPaymentMethod).toBe('function');
    });

    it('forwards the call to the context with the given id', async () => {
      const ctx: PrimerCheckoutContextValue = {
        ...baseContext,
        vaultedMethods: [makeCardVault({ id: 'a' })],
      };
      const { result } = renderHook(() => usePrimerVaultManager(), contextWrapper(ctx));
      await result.current.deleteVaultedPaymentMethod('a');
      expect(deleteVaultedPaymentMethodFn).toHaveBeenCalledWith('a');
    });

    it('propagates rejection from the context implementation', async () => {
      const err = { errorId: 'BRIDGE_FAILURE', description: 'boom' };
      deleteVaultedPaymentMethodFn.mockRejectedValueOnce(err);
      const { result } = renderHook(() => usePrimerVaultManager(), contextWrapper(baseContext));
      await expect(result.current.deleteVaultedPaymentMethod('x')).rejects.toEqual(err);
    });
  });
});
