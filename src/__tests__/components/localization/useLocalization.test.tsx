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
  it('returns t function', () => {
    act(() => {
      renderer.create(createElement(TestComponent));
    });

    expect(hookResult).toBeDefined();
    expect(typeof hookResult.t).toBe('function');
  });

  it('t() returns translated string', () => {
    act(() => {
      renderer.create(createElement(TestComponent));
    });

    expect(hookResult.t('primer_common_button_pay')).toBe('Pay');
    expect(hookResult.t('primer_common_button_pay_amount', { param1: '$10' })).toBe('Pay $10');
  });
});
