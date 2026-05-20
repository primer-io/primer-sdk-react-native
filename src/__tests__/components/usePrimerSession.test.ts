import { createElement, type ReactNode } from 'react';
// @ts-expect-error -- react-test-renderer has no types for React 19
import { act, create } from 'react-test-renderer';
import { PrimerCheckoutContext } from '../../Components/internal/PrimerCheckoutContext';
import { usePrimerSession } from '../../Components/hooks/usePrimerSession';
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
  activeMethod: null,
  cardFormState: { isValid: false, errors: {}, binData: null, metadata: null, requiredFields: [] },
  selectedCardNetwork: null,
  vaultedMethods: [],
  vaultedIconUrisById: {},
  isLoadingVaulted: false,
  vaultedError: null,
  activeVaultedMethodId: null,
  vaultDisplayOverride: null,
  setActiveMethod: () => {},
  setRawData: async () => {},
  setBillingAddress: async () => {},
  selectCardNetwork: async () => {},
  submit: async () => {},
  retry: async () => {},
  clearPaymentOutcome: () => {},
  payFromVault: async () => {},
  deleteVaultedPaymentMethod: async () => {},
  selectVaultedMethodId: () => {},
  requestExpandedVaultDisplay: () => {},
};

describe('usePrimerSession', () => {
  it('throws when used outside provider', () => {
    expect(() => renderHook(() => usePrimerSession())).toThrow(
      'usePrimerSession must be used within a <PrimerCheckoutProvider>'
    );
  });

  it('exposes the session slice fields', () => {
    const ctx: PrimerCheckoutContextValue = {
      ...baseContext,
      isReady: true,
      isLoadingResources: true,
    };
    const { result } = renderHook(() => usePrimerSession(), contextWrapper(ctx));
    expect(result.current.isReady).toBe(true);
    expect(result.current.isLoadingResources).toBe(true);
    expect(result.current.error).toBeNull();
  });
});
