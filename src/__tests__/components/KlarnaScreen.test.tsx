// @ts-expect-error -- React 19 concurrent act environment
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

import { createElement } from 'react';
// @ts-expect-error -- react-test-renderer has no types for React 19
import renderer, { act } from 'react-test-renderer';

let mockKlarnaState: Record<string, unknown> = {};
jest.mock('../../Components/hooks/usePrimerPaymentMethod', () => ({
  usePrimerPaymentMethod: () => ({
    kind: 'klarna',
    start: jest.fn(),
    paymentCategories: [{ identifier: 'pay_later', name: 'Pay later', descriptiveAssetUrl: '', standardAssetUrl: '' }],
    selectedCategoryId: null,
    isViewLoaded: false,
    isLoading: false,
    selectCategory: jest.fn(),
    authorize: jest.fn(),
    ...mockKlarnaState,
  }),
}));

jest.mock('../../HeadlessUniversalCheckout/Components/PrimerKlarnaPaymentView', () => ({
  PrimerKlarnaPaymentView: 'PrimerKlarnaPaymentView',
}));
jest.mock('../../Components/status', () => ({ PrimerLoadingScreen: 'PrimerLoadingScreen' }));
jest.mock('../../Components/internal/checkout-flow/CheckoutFlowContext', () => ({
  useCheckoutFlow: () => ({ onCancel: jest.fn() }),
}));
jest.mock('../../Components/internal/localization', () => ({
  usePrimerLocalization: () => ({ t: (key: string) => key }),
}));
jest.mock('../../Components/internal/navigation/NavigationHeader', () => ({
  NavigationHeader: 'NavigationHeader',
}));
jest.mock('../../Components/internal/navigation/useNavigation', () => ({
  useNavigation: () => ({ pop: jest.fn(), replace: jest.fn(), canGoBack: true }),
}));
jest.mock('../../Components/internal/navigation/useRoute', () => ({
  useRoute: () => ({ params: { paymentMethodType: 'KLARNA' } }),
}));
jest.mock('../../Components/internal/theme', () => ({
  usePrimerTheme: () => ({
    colors: {},
    spacing: { xxsmall: 2, xsmall: 4, small: 8, medium: 12, large: 16, xlarge: 20, xxlarge: 24 },
    radii: { xsmall: 2, small: 4, medium: 8, large: 12 },
    sizes: { small: 16, medium: 20, large: 24, xlarge: 32, xxlarge: 40, xxxlarge: 56, base: 4 },
    widths: { default: 1, focus: 2, selected: 2, error: 2 },
    typography: {
      bodySmall: { lineHeight: 16 },
      bodyMedium: { lineHeight: 18 },
      bodyLarge: { lineHeight: 20 },
      titleLarge: { lineHeight: 20 },
      titleXlarge: { lineHeight: 22 },
    },
  }),
}));
jest.mock('../../Components/internal/ui/PrimerButton', () => ({ PrimerButton: 'PrimerButton' }));
jest.mock('../../Components/internal/checkout-sheet', () => ({
  useSheetHeight: () => ({ requestHeight: () => () => {} }),
}));
jest.mock('../../Components/internal/screens/LoadingScreen', () => ({ CONTENT_HEIGHT: 200 }));
jest.mock('../../Components/internal/screens/useBottomSafeArea', () => ({ useBottomSafeArea: () => 0 }));

import { KlarnaScreen } from '../../Components/internal/screens/KlarnaScreen';

function render() {
  let tree: any;
  act(() => {
    tree = renderer.create(createElement(KlarnaScreen));
  });
  return tree;
}

beforeEach(() => {
  mockKlarnaState = {};
});

describe('KlarnaScreen — header', () => {
  it('titles the screen "Klarna" in the middle of the back row, like the native SDKs', () => {
    const tree = render();

    expect(tree.root.findByType('NavigationHeader').props.title).toBe('primer_vault_default_klarna');
    expect(tree.root.findByType('NavigationHeader').props.titleAlignment).toBe('center');
  });
});

describe('KlarnaScreen — Continue button', () => {
  const button = () => render().root.findByType('PrimerButton').props;

  it('is named by its title, with no hint, once the Klarna view is ready', () => {
    mockKlarnaState = { selectedCategoryId: 'pay_later', isViewLoaded: true };

    expect(button().title).toBe('primer_klarna_button_authorize');
    expect(button().loading).toBe(false);
    expect(button().accessibilityLabel).toBeUndefined();
    expect(button().accessibilityHint).toBeUndefined();
  });

  it('gets the disabled hint before a category is chosen', () => {
    expect(button().disabled).toBe(true);
    expect(button().loading).toBe(false);
    expect(button().accessibilityHint).toBe('accessibility_card_form_submit_disabled');
  });

  it('reads loading, not processing, as its value while the Klarna view builds', () => {
    mockKlarnaState = { selectedCategoryId: 'pay_later', isViewLoaded: false };

    expect(button().loading).toBe(true);
    expect(button().accessibilityHint).toBeUndefined();
    expect(button().loadingAccessibilityValue).toBe('accessibility_common_loading');
  });

  it('reads processing as its value while it pays', () => {
    mockKlarnaState = { selectedCategoryId: 'pay_later', isViewLoaded: true, isLoading: true };

    expect(button().loading).toBe(true);
    expect(button().accessibilityHint).toBeUndefined();
    expect(button().loadingAccessibilityValue).toBe('accessibility_card_form_submit_loading');
  });
});
