import { createElement, type ReactNode } from 'react';
// @ts-expect-error -- react-test-renderer has no types for React 19
import { act, create } from 'react-test-renderer';
import { PrimerCheckoutContext } from '../../Components/internal/PrimerCheckoutContext';
import { usePrimerCard } from '../../Components/hooks/usePrimerCard';
import type { PrimerCheckoutContextValue } from '../../Components/types/PrimerCheckoutProviderTypes';

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

const baseContext: PrimerCheckoutContextValue = {
  isReady: true,
  error: null,
  clientSession: null,
  availablePaymentMethods: [],
  paymentMethodResources: [],
  isLoadingResources: false,
  resourcesError: null,
  settings: undefined,
  acceptedCardNetworks: null,
  paymentOutcome: null,
  activeMethod: 'PAYMENT_CARD',
  cardFormState: { isValid: false, errors: {}, binData: null, metadata: null, requiredFields: [] },
  vaultedMethods: [],
  vaultedIconUrisById: {},
  isLoadingVaulted: false,
  vaultedError: null,
  activeVaultedMethodId: null,
  vaultDisplayOverride: null,
  setActiveMethod: () => {},
  setRawData: async () => {},
  setBillingAddress: async () => {},
  submit: async () => {},
  retry: async () => {},
  clearPaymentOutcome: () => {},
  payFromVault: async () => {},
  deleteVaultedPaymentMethod: async () => {},
  selectVaultedMethodId: () => {},
  requestExpandedVaultDisplay: () => {},
};

describe('usePrimerCard', () => {
  it('throws when used outside provider', () => {
    expect(() => renderHook(() => usePrimerCard())).toThrow(
      'usePrimerCard must be used within a <PrimerCheckoutProvider>'
    );
  });

  it('exposes the card slice fields and actions', () => {
    const { result } = renderHook(() => usePrimerCard(), contextWrapper(baseContext));
    expect(result.current.activeMethod).toBe('PAYMENT_CARD');
    expect(result.current.cardFormState.isValid).toBe(false);
    expect(typeof result.current.setRawData).toBe('function');
    expect(typeof result.current.setBillingAddress).toBe('function');
    expect(typeof result.current.submit).toBe('function');
  });
});
