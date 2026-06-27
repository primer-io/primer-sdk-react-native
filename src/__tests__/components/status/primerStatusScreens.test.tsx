// @ts-expect-error -- React 19 concurrent act environment
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

import { createElement } from 'react';
// @ts-expect-error -- react-test-renderer has no types for React 19
import { act, create } from 'react-test-renderer';

// react-native is provided by the global mock at <rootDir>/__mocks__/react-native.js.

// PNG assets can't be loaded by jest (no asset transformer / moduleNameMapper).
jest.mock('../../../Components/internal/screens/assets/check-circle-large.png', () => 1, { virtual: true });
jest.mock('../../../Components/internal/screens/assets/error-large.png', () => 2, { virtual: true });

import {
  PrimerStatusScreenLayout,
  PrimerLoadingScreen,
  PrimerSuccessScreen,
  PrimerErrorScreen,
} from '../../../Components/status';
import { CheckoutButton } from '../../../Components/internal/ui';

function render(element: ReturnType<typeof createElement>) {
  let testRenderer: ReturnType<typeof create>;
  act(() => {
    testRenderer = create(element);
  });
  return testRenderer;
}

describe('public status components (standalone, no checkout/navigation provider)', () => {
  it('PrimerStatusScreenLayout renders title, subtitle, icon and children without throwing', () => {
    const r = render(
      createElement(
        PrimerStatusScreenLayout,
        { icon: createElement('Icon'), title: 'Hello', subtitle: 'World' },
        createElement('Child')
      )
    );
    expect(r.toJSON()).not.toBeNull();
  });

  it('PrimerLoadingScreen renders with default copy', () => {
    const r = render(createElement(PrimerLoadingScreen, {}));
    expect(r.toJSON()).not.toBeNull();
  });

  it('PrimerLoadingScreen renders with overridden copy', () => {
    const r = render(createElement(PrimerLoadingScreen, { title: 'Wait', subtitle: 'Almost there' }));
    expect(r.toJSON()).not.toBeNull();
  });

  it('PrimerSuccessScreen renders without throwing', () => {
    const r = render(createElement(PrimerSuccessScreen, { title: 'Done', subtitle: 'Paid' }));
    expect(r.toJSON()).not.toBeNull();
  });

  it('PrimerSuccessScreen fires onDismiss after autoDismissMs and clears on unmount', () => {
    jest.useFakeTimers();
    try {
      const onDismiss = jest.fn();
      const r = render(createElement(PrimerSuccessScreen, { onDismiss, autoDismissMs: 3000 }));
      expect(onDismiss).not.toHaveBeenCalled();
      act(() => {
        jest.advanceTimersByTime(3000);
      });
      expect(onDismiss).toHaveBeenCalledTimes(1);
      act(() => {
        r.unmount();
      });
    } finally {
      jest.useRealTimers();
    }
  });

  it('PrimerSuccessScreen does not schedule dismiss when autoDismissMs is omitted', () => {
    jest.useFakeTimers();
    try {
      const onDismiss = jest.fn();
      render(createElement(PrimerSuccessScreen, { onDismiss }));
      act(() => {
        jest.advanceTimersByTime(10000);
      });
      expect(onDismiss).not.toHaveBeenCalled();
    } finally {
      jest.useRealTimers();
    }
  });

  it('PrimerErrorScreen renders without throwing', () => {
    const r = render(createElement(PrimerErrorScreen, { title: 'Failed', subtitle: 'Oops' }));
    expect(r.toJSON()).not.toBeNull();
  });

  it('PrimerErrorScreen renders no buttons when no callbacks are passed', () => {
    const r = render(createElement(PrimerErrorScreen, {}));
    expect(r.root.findAllByType(CheckoutButton)).toHaveLength(0);
  });

  it('PrimerErrorScreen renders only the retry button when only onRetry is passed', () => {
    const onRetry = jest.fn();
    const r = render(createElement(PrimerErrorScreen, { onRetry }));
    const buttons = r.root.findAllByType(CheckoutButton);
    expect(buttons).toHaveLength(1);
    expect(buttons[0].props.variant).toBe('primary');
    act(() => {
      buttons[0].props.onPress();
    });
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('PrimerErrorScreen renders only the other-method button when only onChooseOtherMethod is passed', () => {
    const onChooseOtherMethod = jest.fn();
    const r = render(createElement(PrimerErrorScreen, { onChooseOtherMethod }));
    const buttons = r.root.findAllByType(CheckoutButton);
    expect(buttons).toHaveLength(1);
    expect(buttons[0].props.variant).toBe('outlined');
  });

  it('PrimerErrorScreen renders both buttons when both callbacks are passed', () => {
    const r = render(createElement(PrimerErrorScreen, { onRetry: jest.fn(), onChooseOtherMethod: jest.fn() }));
    expect(r.root.findAllByType(CheckoutButton)).toHaveLength(2);
  });
});
