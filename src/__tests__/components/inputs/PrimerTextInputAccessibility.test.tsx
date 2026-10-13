// @ts-expect-error -- React 19 concurrent act environment
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

import { createElement } from 'react';
// @ts-expect-error -- react-test-renderer has no types for React 19
import renderer, { act } from 'react-test-renderer';
import { PrimerTextInput } from '../../../Components/inputs/PrimerTextInput';

const rnMock = require('react-native');

function render(error?: string) {
  let instance: any;
  act(() => {
    instance = renderer.create(
      createElement(PrimerTextInput, { value: '', onChangeText: () => {}, label: 'Card number', error })
    );
  });
  return instance;
}

const input = (instance: any) => instance.root.find((n: any) => n.type === 'TextInput');

describe('PrimerTextInput screen reader error', () => {
  beforeEach(() => {
    rnMock.Platform.OS = 'ios';
    rnMock.AccessibilityInfo.announceForAccessibility.mockClear();
  });

  it('reads the error with the field, so focusing the field says it', () => {
    expect(input(render('Invalid card number')).props.accessibilityLabel).toBe('Card number, Invalid card number');
  });

  it('reads only the field without an error', () => {
    expect(input(render()).props.accessibilityLabel).toBe('Card number');
  });

  it('announces a new error on iOS, where the live region does nothing', () => {
    render('Invalid card number');

    expect(rnMock.AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith('Invalid card number');
  });

  it('leaves the announcement to the live region on Android', () => {
    rnMock.Platform.OS = 'android';

    render('Invalid card number');

    expect(rnMock.AccessibilityInfo.announceForAccessibility).not.toHaveBeenCalled();
  });

  it('announces nothing without an error', () => {
    render();

    expect(rnMock.AccessibilityInfo.announceForAccessibility).not.toHaveBeenCalled();
  });
});
