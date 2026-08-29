import { createElement } from 'react';
// @ts-expect-error -- react-test-renderer has no types for React 19
import renderer, { act } from 'react-test-renderer';
import { usePrimerLocalization } from '../../../Components/internal/localization/usePrimerLocalization';

let hookResult: ReturnType<typeof usePrimerLocalization>;

function TestComponent() {
  hookResult = usePrimerLocalization();
  return null;
}

describe('usePrimerLocalization', () => {
  it('t() resolves translations with interpolation', () => {
    act(() => {
      renderer.create(createElement(TestComponent));
    });

    expect(hookResult.t('primer_common_button_pay')).toBe('Pay');
    expect(hookResult.t('primer_common_button_pay_amount', { amount: '$10' })).toBe('Pay $10');
  });
});
