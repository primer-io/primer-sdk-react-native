/**
 * AchMandateTransitioner tests: the flow-level watcher is the only path to the mandate screen —
 * route once per mandate, hold while a transition animates, re-latch when the slice resets so a
 * second attempt's mandate routes again.
 */
// @ts-expect-error -- React 19 concurrent act environment
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

import { createElement, type ReactNode } from 'react';
// @ts-expect-error -- react-test-renderer has no types for React 19
import { act, create } from 'react-test-renderer';

import type { StripeAchMandateDisplay } from '../../Components/types/PrimerCheckoutProviderTypes';

// Hook doubles (the achScreens.test approach): the transitioner reads only achMandate and
// { replace, isAnimating }.
let mockAchMandate: StripeAchMandateDisplay | null = null;
jest.mock('../../Components/hooks/usePrimerCheckout', () => ({
  usePrimerCheckout: () => ({ achMandate: mockAchMandate }),
}));
const mockReplace = jest.fn();
let mockIsAnimating = false;
jest.mock('../../Components/internal/navigation/useNavigation', () => ({
  useNavigation: () => ({ replace: mockReplace, isAnimating: mockIsAnimating }),
}));

import { AchMandateTransitioner } from '../../Components/internal/checkout-flow/AchMandateTransitioner';
import { CheckoutRoute } from '../../Components/internal/navigation/types';

type TestRoot = { update: (el: ReactNode) => void };

function render(): TestRoot {
  let root: TestRoot | undefined;
  act(() => {
    root = create(createElement(AchMandateTransitioner));
  });
  return root!;
}

function rerender(root: TestRoot) {
  act(() => {
    root.update(createElement(AchMandateTransitioner));
  });
}

const mandate = (text: string): StripeAchMandateDisplay => ({ text, source: 'template' });

beforeEach(() => {
  jest.clearAllMocks();
  mockAchMandate = null;
  mockIsAnimating = false;
});

describe('AchMandateTransitioner', () => {
  it('routes to the mandate screen when the mandate arrives', () => {
    mockAchMandate = mandate('LEGAL');
    render();
    expect(mockReplace).toHaveBeenCalledTimes(1);
    expect(mockReplace).toHaveBeenCalledWith(CheckoutRoute.stripeAchMandate);
  });

  it('routes exactly once while the mandate stays set (its own replace() animation re-runs the effect)', () => {
    mockAchMandate = mandate('LEGAL');
    const root = render();
    mockIsAnimating = true;
    rerender(root);
    mockIsAnimating = false;
    rerender(root);
    expect(mockReplace).toHaveBeenCalledTimes(1);
  });

  it('holds while a transition is animating, then routes exactly once when it clears', () => {
    mockAchMandate = mandate('LEGAL');
    mockIsAnimating = true;
    const root = render();
    // replace() would no-op mid-transition — the transitioner must wait, not drop the mandate.
    expect(mockReplace).not.toHaveBeenCalled();

    mockIsAnimating = false;
    rerender(root);
    expect(mockReplace).toHaveBeenCalledTimes(1);
    expect(mockReplace).toHaveBeenCalledWith(CheckoutRoute.stripeAchMandate);
  });

  it('re-latches when the mandate clears so a second attempt routes again', () => {
    mockAchMandate = mandate('FIRST');
    const root = render();
    expect(mockReplace).toHaveBeenCalledTimes(1);

    // Terminal outcome (decline/error) resets the ACH slice → the mandate clears.
    mockAchMandate = null;
    rerender(root);

    mockAchMandate = mandate('SECOND');
    rerender(root);
    expect(mockReplace).toHaveBeenCalledTimes(2);
  });
});
