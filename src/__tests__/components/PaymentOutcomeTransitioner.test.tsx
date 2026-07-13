// @ts-expect-error -- React 19 concurrent act environment
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

jest.mock('react-native', () => ({ useColorScheme: () => 'light' }), { virtual: true });

import { createElement, type ReactNode } from 'react';
// @ts-expect-error -- react-test-renderer has no types for React 19
import { act, create } from 'react-test-renderer';
import { PrimerCheckoutContext } from '../../Components/internal/PrimerCheckoutContext';
import { NavigationContext } from '../../Components/internal/navigation/NavigationContext';
import type { NavigationContextValue } from '../../Components/internal/navigation/NavigationContext';
import { CheckoutRoute } from '../../Components/internal/navigation/types';
import { PaymentOutcomeTransitioner } from '../../Components/internal/checkout-flow/PaymentOutcomeTransitioner';
import { PrimerError } from '../../models/PrimerError';
import type { PrimerCheckoutData } from '../../models/PrimerCheckoutData';
import type { PrimerCheckoutContextValue } from '../../Components/types/PrimerCheckoutProviderTypes';

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

function makeNav() {
  const replace = jest.fn();
  const value = {
    state: { stack: [], isAnimating: false },
    push: jest.fn(),
    pop: jest.fn(),
    replace,
    popToRoot: jest.fn(),
    setAnimating: jest.fn(),
  } as NavigationContextValue;
  return { value, replace };
}

function wrap(ctx: PrimerCheckoutContextValue, nav: NavigationContextValue, node: ReactNode) {
  return createElement(
    PrimerCheckoutContext.Provider,
    { value: ctx },
    createElement(NavigationContext.Provider, { value: nav }, node)
  );
}

describe('PaymentOutcomeTransitioner', () => {
  it('navigates to the error screen when the outcome is an error (the stuck-flow guarantee)', () => {
    const { value, replace } = makeNav();
    const error = new PrimerError('declined', undefined, 'Card declined', undefined, undefined);
    act(() => {
      create(
        wrap(
          { ...baseContext, paymentOutcome: { status: 'error', error, data: null } },
          value,
          createElement(PaymentOutcomeTransitioner)
        )
      );
    });
    expect(replace).toHaveBeenCalledWith(CheckoutRoute.error, { error });
  });

  it('holds the outcome while isAnimating, then routes exactly once when it clears', () => {
    const replace = jest.fn();
    const error = new PrimerError('declined', undefined, 'Card declined', undefined, undefined);
    const navBase = { push: jest.fn(), pop: jest.fn(), replace, popToRoot: jest.fn(), setAnimating: jest.fn() };
    const animating = { ...navBase, state: { stack: [], isAnimating: true } } as NavigationContextValue;
    const idle = { ...navBase, state: { stack: [], isAnimating: false } } as NavigationContextValue;
    const ctx: PrimerCheckoutContextValue = {
      ...baseContext,
      paymentOutcome: { status: 'error', error, data: null },
    };
    let root: { update: (el: ReactNode) => void } | undefined;
    act(() => {
      root = create(wrap(ctx, animating, createElement(PaymentOutcomeTransitioner)));
    });
    // mid-transition replace() no-ops, so the transitioner must wait rather than drop the outcome
    expect(replace).not.toHaveBeenCalled();
    act(() => {
      root!.update(wrap(ctx, idle, createElement(PaymentOutcomeTransitioner)));
    });
    expect(replace).toHaveBeenCalledTimes(1);
    expect(replace).toHaveBeenCalledWith(CheckoutRoute.error, { error });
  });

  it('navigates to the success screen on a successful outcome', () => {
    const { value, replace } = makeNav();
    const data = {} as PrimerCheckoutData;
    act(() => {
      create(
        wrap(
          { ...baseContext, paymentOutcome: { status: 'success', data } },
          value,
          createElement(PaymentOutcomeTransitioner)
        )
      );
    });
    expect(replace).toHaveBeenCalledWith(CheckoutRoute.success, { checkoutData: data });
  });
});
