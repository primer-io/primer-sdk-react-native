// @ts-expect-error -- React 19 concurrent act environment
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

import { createElement } from 'react';
// @ts-expect-error -- react-test-renderer has no types for React 19
import renderer, { act } from 'react-test-renderer';

const mockSetActiveMethod = jest.fn();
jest.mock('../../Components/hooks/usePrimerCheckout', () => ({
  usePrimerCheckout: () => ({ setActiveMethod: mockSetActiveMethod }),
}));

let mockSheetProps: { onDismiss: () => void } | undefined;
jest.mock('../../Components/internal/checkout-sheet/CheckoutSheet', () => ({
  CheckoutSheet: (props: { onDismiss: () => void }) => {
    mockSheetProps = props;
    return null;
  },
}));

jest.mock('../../Components/internal/checkout-flow/CheckoutFlow', () => ({
  CheckoutFlow: () => null,
}));

import { PrimerCheckoutSheet } from '../../Components/PrimerCheckoutSheet';

describe('PrimerCheckoutSheet', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function render(props: { onDismiss?: () => void } = {}) {
    let tree: any;
    act(() => {
      tree = renderer.create(createElement(PrimerCheckoutSheet, { visible: true, ...props }));
    });
    return tree;
  }

  it('keeps the card session until the sheet is fully dismissed', () => {
    const tree = render();

    act(() => {
      tree.update(createElement(PrimerCheckoutSheet, { visible: false }));
    });

    expect(mockSetActiveMethod).not.toHaveBeenCalled();
  });

  it('closes the card session once the sheet is dismissed', () => {
    const onDismiss = jest.fn();
    render({ onDismiss });

    act(() => {
      mockSheetProps!.onDismiss();
    });

    expect(mockSetActiveMethod).toHaveBeenCalledWith(null);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('closes the card session when the sheet unmounts', () => {
    const tree = render();

    act(() => {
      tree.unmount();
    });

    expect(mockSetActiveMethod).toHaveBeenCalledWith(null);
  });
});
