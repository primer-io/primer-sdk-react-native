// @ts-expect-error -- React 19 concurrent act environment
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

import { createElement } from 'react';
// @ts-expect-error -- react-test-renderer has no types for React 19
import renderer, { act } from 'react-test-renderer';

jest.mock('../../Components/internal/localization', () => ({
  usePrimerLocalization: () => ({ t: (key: string) => key }),
}));
jest.mock('../../Components/internal/navigation/useRoute', () => ({
  useRoute: () => ({ params: undefined }),
}));
jest.mock('../../Components/internal/navigation/useNavigation', () => ({
  useNavigation: () => ({ replace: jest.fn() }),
}));
jest.mock('../../Components/hooks/usePrimerCheckout', () => ({
  usePrimerCheckout: () => ({
    retry: jest.fn().mockResolvedValue(undefined),
    clearPaymentOutcome: jest.fn(),
    requestExpandedVaultDisplay: jest.fn(),
  }),
}));
jest.mock('../../Components/internal/screens/useStatusScreenHeight', () => ({ useStatusScreenHeight: jest.fn() }));
jest.mock('../../Components/internal/screens/useBottomPadding', () => ({ useBottomPadding: () => 0 }));

import { ErrorScreen } from '../../Components/internal/screens/ErrorScreen';

function renderedTexts() {
  let tree: any;
  act(() => {
    tree = renderer.create(createElement(ErrorScreen));
  });
  return tree.root.findAllByType('Text').map((node: any) => node.props.children);
}

describe('ErrorScreen', () => {
  it('shows the localized title and subtitle', () => {
    expect(renderedTexts()).toEqual(
      expect.arrayContaining(['primer_checkout_error_title', 'primer_checkout_error_subtitle'])
    );
  });
});
