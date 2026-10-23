// @ts-expect-error -- React 19 concurrent act environment
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

import { createElement } from 'react';
// @ts-expect-error -- react-test-renderer has no types for React 19
import renderer, { act } from 'react-test-renderer';
import { PrimerError } from '../../models/PrimerError';

let mockParams: Record<string, unknown> | undefined;
jest.mock('../../Components/internal/localization', () => ({
  usePrimerLocalization: () => ({ t: (key: string) => key }),
}));
jest.mock('../../Components/internal/navigation/useRoute', () => ({
  useRoute: () => ({ params: mockParams }),
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
import { PrimerErrorScreen } from '../../Components/status';

function errorScreenProps() {
  let tree: any;
  act(() => {
    tree = renderer.create(createElement(ErrorScreen));
  });
  return tree.root.findByType(PrimerErrorScreen).props;
}

describe('ErrorScreen', () => {
  it('shows the shopper text, not the error description written for developers', () => {
    mockParams = {
      error: new PrimerError(
        'payment-failed',
        undefined,
        'The payment with id IhpbtLOxI was created but ended up in a FAILED status.',
        undefined,
        'diagnostics-id'
      ),
    };

    const props = errorScreenProps();

    expect(props.title).toBe('primer_checkout_error_title');
    expect(props.subtitle).toBe('primer_checkout_error_subtitle');
  });

  it('shows the same text when there is no error', () => {
    mockParams = undefined;

    expect(errorScreenProps().subtitle).toBe('primer_checkout_error_subtitle');
  });
});
