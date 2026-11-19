// @ts-expect-error: React 19 concurrent act environment
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

import { createElement } from 'react';
// @ts-expect-error: react-test-renderer has no types for React 19
import { act, create } from 'react-test-renderer';
import { PanResponder } from 'react-native';

let mockIsPaymentInFlight = false;
jest.mock('../../Components/hooks/usePrimerCheckout', () => ({
  usePrimerCheckout: () => ({ isPaymentInFlight: mockIsPaymentInFlight }),
}));

let mockSetCardFormBusy: (busy: boolean) => void = () => {};
jest.mock('../../Components/internal/checkout-flow/CheckoutFlow', () => ({
  CheckoutFlow: (props: { onCardFormBusyChange: (busy: boolean) => void }) => {
    mockSetCardFormBusy = props.onCardFormBusyChange;
    return null;
  },
}));

import { PrimerCheckoutSheet } from '../../Components/PrimerCheckoutSheet';

describe('PrimerCheckoutSheet while a card payment runs (ORC-8672)', () => {
  const onRequestDismiss = jest.fn();
  const createPanResponder = jest.spyOn(PanResponder, 'create');

  function open() {
    let tree: any;
    const element = () => createElement(PrimerCheckoutSheet, { visible: true, onRequestDismiss });
    act(() => {
      tree = create(element());
    });
    const swipeDown = () => {
      const config = createPanResponder.mock.calls[createPanResponder.mock.calls.length - 1]![0];
      act(() => config.onPanResponderRelease!({} as never, { dx: 0, dy: 2000, vy: 2 } as never));
    };
    return {
      rerender: () => act(() => tree.update(element())),
      tryToClose: () => {
        act(() => tree.root.findByType('Modal').props.onRequestClose());
        act(() => tree.root.findByType('TouchableWithoutFeedback').props.onPress());
        swipeDown();
      },
    };
  }

  beforeEach(() => {
    jest.clearAllMocks();
    mockIsPaymentInFlight = false;
  });

  it('ignores Android back, the backdrop and a swipe down until the payment has its result', () => {
    mockIsPaymentInFlight = true;
    const sheet = open();

    sheet.tryToClose();
    expect(onRequestDismiss).not.toHaveBeenCalled();

    mockIsPaymentInFlight = false;
    sheet.rerender();
    sheet.tryToClose();
    expect(onRequestDismiss).toHaveBeenCalledTimes(3);
  });

  it('ignores them while the card form is busy', () => {
    const sheet = open();
    act(() => mockSetCardFormBusy(true));

    sheet.tryToClose();
    expect(onRequestDismiss).not.toHaveBeenCalled();

    act(() => mockSetCardFormBusy(false));
    sheet.tryToClose();
    expect(onRequestDismiss).toHaveBeenCalledTimes(3);
  });
});
