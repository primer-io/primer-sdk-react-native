// @ts-expect-error -- React 19 concurrent act environment
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

import { createElement } from 'react';
// @ts-expect-error -- react-test-renderer has no types for React 19
import renderer, { act } from 'react-test-renderer';

let mockSelectedBankId: string | null = null;
jest.mock('../../Components/hooks/usePrimerPaymentMethod', () => ({
  usePrimerPaymentMethod: () => ({
    kind: 'bankSelection',
    isAvailable: true,
    isLoading: false,
    paymentOutcome: null,
    banks: [{ id: 'ing', name: 'ING', disabled: false }],
    selectedBankId: mockSelectedBankId,
    start: jest.fn().mockResolvedValue(undefined),
    filter: jest.fn(),
    selectBank: jest.fn(),
    submit: jest.fn().mockResolvedValue(undefined),
    clearPaymentOutcome: jest.fn(),
  }),
}));
jest.mock('../../Components/internal/localization', () => ({
  usePrimerLocalization: () => ({ t: (key: string) => key }),
}));
jest.mock('../../Components/internal/navigation/useRoute', () => ({
  useRoute: () => ({ params: { paymentMethodType: 'ADYEN_IDEAL' } }),
}));
jest.mock('../../Components/internal/navigation/useNavigation', () => ({
  useNavigation: () => ({ pop: jest.fn(), replace: jest.fn(), canGoBack: true }),
}));
jest.mock('../../Components/internal/checkout-flow/CheckoutFlowContext', () => ({
  useCheckoutFlow: () => ({ onCancel: jest.fn() }),
}));
jest.mock('../../Components/internal/navigation/NavigationHeader', () => ({ NavigationHeader: () => null }));
jest.mock('../../Components/internal/screens/useBottomSafeArea', () => ({ useBottomSafeArea: () => 0 }));

import { BankSelectionScreen } from '../../Components/internal/screens/BankSelectionScreen';
import { PrimerButton } from '../../Components/internal/ui/PrimerButton';

function payButton() {
  let tree: any;
  act(() => {
    tree = renderer.create(createElement(BankSelectionScreen));
  });
  return tree.root.findByType(PrimerButton).findByType('TouchableOpacity').props;
}

describe('BankSelectionScreen Pay', () => {
  beforeEach(() => {
    mockSelectedBankId = null;
  });

  it('is named by its title and gets the disabled hint until a bank is chosen', () => {
    const pay = payButton();

    expect(pay.accessibilityLabel).toBe('primer_common_button_pay');
    expect(pay.accessibilityHint).toBe('accessibility_card_form_submit_disabled');
    expect(pay.accessibilityValue).toBeUndefined();

    mockSelectedBankId = 'ing';
    const chosen = payButton();

    expect(chosen.accessibilityLabel).toBe('primer_common_button_pay');
    expect(chosen.accessibilityHint).toBeUndefined();
    expect(chosen.accessibilityValue).toBeUndefined();
  });
});
