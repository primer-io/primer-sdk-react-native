// @ts-expect-error -- React 19 concurrent act environment
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

import { createElement } from 'react';
// @ts-expect-error -- react-test-renderer has no types for React 19
import renderer, { act } from 'react-test-renderer';

jest.mock('../../Components/internal/localization', () => ({
  usePrimerLocalization: () => ({ t: (key: string) => key }),
}));
const mockReplace = jest.fn();
const mockCheckout = {
  retry: jest.fn().mockResolvedValue(undefined),
  clearPaymentOutcome: jest.fn(),
  requestExpandedVaultDisplay: jest.fn(),
  setCvvInputVisible: jest.fn(),
  isVaultedPayment: false,
};
jest.mock('../../Components/internal/navigation/useNavigation', () => ({
  useNavigation: () => ({ replace: mockReplace }),
}));
jest.mock('../../Components/hooks/usePrimerCheckout', () => ({
  usePrimerCheckout: () => mockCheckout,
}));
jest.mock('../../Components/internal/screens/useStatusScreenHeight', () => ({ useStatusScreenHeight: jest.fn() }));
jest.mock('../../Components/internal/screens/useBottomPadding', () => ({ useBottomPadding: () => 0 }));

import { ErrorScreen } from '../../Components/internal/screens/ErrorScreen';
import { CheckoutRoute } from '../../Components/internal/navigation';
import { PrimerErrorScreen } from '../../Components/status';

function renderedTexts() {
  let tree: any;
  act(() => {
    tree = renderer.create(createElement(ErrorScreen));
  });
  return tree.root.findAllByType('Text').map((node: any) => node.props.children);
}

describe('ErrorScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCheckout.isVaultedPayment = false;
  });

  it('shows the localized title and subtitle', () => {
    expect(renderedTexts()).toEqual(
      expect.arrayContaining(['primer_checkout_error_title', 'primer_checkout_error_subtitle'])
    );
  });

  it('retries the payment on retry after any other payment failed', () => {
    let tree: any;
    act(() => {
      tree = renderer.create(createElement(ErrorScreen));
    });

    act(() => tree.root.findByType(PrimerErrorScreen).props.onRetry());

    expect(mockReplace).toHaveBeenCalledWith(CheckoutRoute.processing);
    expect(mockCheckout.retry).toHaveBeenCalled();
  });

  it('goes back to the payment list on retry after a saved card payment failed', () => {
    mockCheckout.isVaultedPayment = true;
    let tree: any;
    act(() => {
      tree = renderer.create(createElement(ErrorScreen));
    });

    act(() => tree.root.findByType(PrimerErrorScreen).props.onRetry());

    expect(mockCheckout.retry).not.toHaveBeenCalled();
    expect(mockCheckout.setCvvInputVisible).toHaveBeenCalledWith(false);
    expect(mockCheckout.clearPaymentOutcome).toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith(CheckoutRoute.methodSelection);
  });
});
