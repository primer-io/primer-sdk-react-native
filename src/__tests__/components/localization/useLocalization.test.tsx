import { createElement } from 'react';
// @ts-expect-error -- react-test-renderer has no types for React 19
import renderer, { act } from 'react-test-renderer';
import { useLocalization } from '../../../Components/internal/localization/useLocalization';

let hookResult: ReturnType<typeof useLocalization>;

function TestComponent() {
  hookResult = useLocalization();
  return null;
}

describe('useLocalization', () => {
  it('returns t, formatCurrency, and formatDate', () => {
    act(() => {
      renderer.create(createElement(TestComponent));
    });

    expect(hookResult).toBeDefined();
    expect(typeof hookResult.t).toBe('function');
    expect(typeof hookResult.formatCurrency).toBe('function');
    expect(typeof hookResult.formatDate).toBe('function');
  });

  it('t() returns translated string', () => {
    act(() => {
      renderer.create(createElement(TestComponent));
    });

    expect(hookResult.t('primer_common_button_pay')).toBe('Pay');
    expect(hookResult.t('primer_common_button_pay_amount', { param1: '$10' })).toBe('Pay $10');
  });

  it('formatCurrency() formats correctly', () => {
    act(() => {
      renderer.create(createElement(TestComponent));
    });

    const result = hookResult.formatCurrency(1000, 'USD');
    expect(result).toContain('10.00');
  });

  it('formatDate() formats correctly', () => {
    act(() => {
      renderer.create(createElement(TestComponent));
    });

    const date = new Date('2026-03-20T12:00:00Z');
    const result = hookResult.formatDate(date);
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });
});
