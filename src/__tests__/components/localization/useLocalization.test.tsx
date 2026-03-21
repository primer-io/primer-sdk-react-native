import { createElement } from 'react';
// @ts-expect-error -- react-test-renderer has no types for React 19
import renderer, { act } from 'react-test-renderer';
import { useLocalization } from '../../../Components/internal/localization/useLocalization';
import { PrimerCheckoutContext } from '../../../Components/internal/PrimerCheckoutContext';

// Capture hook results
let hookResult: ReturnType<typeof useLocalization>;

function TestComponent() {
  hookResult = useLocalization();
  return null;
}

describe('useLocalization', () => {
  it('returns locale and t', () => {
    act(() => {
      renderer.create(createElement(TestComponent));
    });

    expect(hookResult).toBeDefined();
    expect(hookResult.locale).toBeDefined();
    expect(hookResult.locale.locale).toBe('en');
    expect(typeof hookResult.t).toBe('function');
  });

  it('t() returns translated string', () => {
    act(() => {
      renderer.create(createElement(TestComponent));
    });

    expect(hookResult.t('checkout.pay_button')).toBe('Pay');
    expect(hookResult.t('checkout.pay_amount', { amount: '$10' })).toBe('Pay $10');
  });

  it('works within PrimerCheckoutContext', () => {
    const contextValue = {
      isReady: true,
      error: null,
      clientSession: null,
      availablePaymentMethods: [],
    };

    act(() => {
      renderer.create(
        createElement(PrimerCheckoutContext.Provider, { value: contextValue }, createElement(TestComponent))
      );
    });

    expect(hookResult.locale).toBeDefined();
    expect(hookResult.t('checkout.cancel')).toBe('Cancel');
  });

  it('uses localeData override from context', () => {
    const contextValue = {
      isReady: true,
      error: null,
      clientSession: null,
      availablePaymentMethods: [],
      localeData: { localeCode: 'fr-FR' },
    };

    act(() => {
      renderer.create(
        createElement(PrimerCheckoutContext.Provider, { value: contextValue }, createElement(TestComponent))
      );
    });

    expect(hookResult.locale.locale).toBe('fr');
    expect(hookResult.locale.source).toBe('override');
    expect(hookResult.t('checkout.pay_button')).toBe('Payer');
  });

  it('falls back to device locale when localeData has no override', () => {
    const contextValue = {
      isReady: true,
      error: null,
      clientSession: null,
      availablePaymentMethods: [],
      localeData: undefined,
    };

    act(() => {
      renderer.create(
        createElement(PrimerCheckoutContext.Provider, { value: contextValue }, createElement(TestComponent))
      );
    });

    // No override → device locale or fallback
    expect(hookResult.locale).toBeDefined();
    expect(hookResult.locale.source).not.toBe('override');
  });
});
