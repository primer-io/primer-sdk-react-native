// @ts-expect-error -- React 19 concurrent act environment
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

import { createElement } from 'react';
// @ts-expect-error -- react-test-renderer has no types for React 19
import renderer, { act } from 'react-test-renderer';
import { PrimerButton } from '../../Components/internal/ui/PrimerButton';
import type { PrimerButtonProps } from '../../Components/internal/ui/PrimerButton';

function render(props: Partial<PrimerButtonProps> = {}) {
  let tree: any;
  act(() => {
    tree = renderer.create(
      createElement(PrimerButton, { title: 'Pay', onPress: () => {}, variant: 'primary', ...props })
    );
  });
  return tree.root.findByType('TouchableOpacity').props;
}

describe('PrimerButton accessible name', () => {
  it('stays the title while loading, when only the spinner is drawn', () => {
    const button = render({ loading: true });

    expect(button.accessibilityLabel).toBe('Pay');
    expect(button.accessibilityState).toEqual({ disabled: true, busy: true });
  });
});

describe('PrimerButton loading value', () => {
  it('reads the loading text as the value, not a hint, while loading', () => {
    const button = render({ loading: true, loadingAccessibilityValue: 'Processing payment, please wait' });

    expect(button.accessibilityValue).toEqual({ text: 'Processing payment, please wait' });
    expect(button.accessibilityHint).toBeUndefined();
  });

  it('has no value when not loading', () => {
    expect(render({ loadingAccessibilityValue: 'Processing payment, please wait' }).accessibilityValue).toBeUndefined();
  });
});
