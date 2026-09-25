// @ts-expect-error -- React 19 concurrent act environment
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

import { createElement } from 'react';
// @ts-expect-error -- react-test-renderer has no types for React 19
import renderer, { act } from 'react-test-renderer';
import { CheckoutRoute } from '../../Components/internal/navigation/types';

jest.mock(
  'react-native',
  () => ({
    Platform: { OS: 'ios', select: (o: { ios?: unknown; default?: unknown }) => o.ios ?? o.default },
    ScrollView: 'ScrollView',
    StyleSheet: { create: (s: unknown) => s, flatten: (s: unknown) => s, hairlineWidth: 1 },
    Text: 'Text',
    View: 'View',
    useWindowDimensions: () => ({ width: 400, height: 800 }),
  }),
  { virtual: true }
);

// `mock`-prefixed so the hoisted jest.mock factories may reference them.
const mockReplace = jest.fn();
const mockSubmit = jest.fn().mockResolvedValue(undefined);
let mockResolveFlush: () => void = () => {};
const mockFlush = jest.fn(
  () =>
    new Promise<void>((resolve) => {
      mockResolveFlush = resolve;
    })
);

jest.mock('../../Components/internal/theme', () => ({
  usePrimerTheme: () => ({
    colors: { backgroundPrimary: '#fff', borderOutlinedDefault: '#ccc', textPrimary: '#000' },
    spacing: { small: 8, medium: 12, large: 16 },
    typography: {
      titleLarge: { fontFamily: 'system', fontSize: 16, fontWeight: '500', letterSpacing: 0, lineHeight: 20 },
    },
  }),
}));

jest.mock('../../Components/internal/localization', () => ({
  usePrimerLocalization: () => ({ t: (key: string) => key }),
}));

jest.mock('../../Components/internal/navigation/useNavigation', () => ({
  useNavigation: () => ({ pop: jest.fn(), replace: mockReplace, canGoBack: false }),
}));

jest.mock('../../Components/internal/navigation/NavigationHeader', () => ({
  NavigationHeader: 'NavigationHeader',
}));

jest.mock('../../Components/internal/checkout-flow/CheckoutFlowContext', () => ({
  useCheckoutFlow: () => ({ onCancel: jest.fn() }),
}));

jest.mock('../../Components/internal/checkout-sheet', () => ({
  useSheetHeight: () => ({ requestHeight: () => () => {} }),
}));

jest.mock('../../Components/internal/screens/useBottomSafeArea', () => ({
  useBottomSafeArea: () => 0,
}));

jest.mock('../../Components/internal/screens/useKeyboardPadding', () => ({
  useKeyboardPadding: () => 0,
}));

jest.mock('../../Components/hooks/usePrimerCardForm', () => ({
  usePrimerCardForm: () => ({ isValid: true, isSubmitting: false, submit: mockSubmit }),
}));

jest.mock('../../Components/hooks/usePrimerBillingAddressForm', () => ({
  usePrimerBillingAddressForm: () => ({ isValid: true, sectionVisible: true, flush: mockFlush }),
}));

jest.mock('../../Components/PrimerCardForm', () => ({ PrimerCardForm: 'PrimerCardForm' }));
jest.mock('../../Components/PrimerBillingAddressForm', () => ({
  PrimerBillingAddressForm: 'PrimerBillingAddressForm',
}));
jest.mock('../../Components/internal/ui/PrimerButton', () => ({ PrimerButton: 'PrimerButton' }));

import { CardFormScreen } from '../../Components/internal/screens/CardFormScreen';

describe('CardFormScreen Pay', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  function render() {
    let tree: any;
    act(() => {
      tree = renderer.create(createElement(CardFormScreen));
    });
    const props = (type: string) => tree.root.findByType(type).props;
    return {
      cardForm: () => props('PrimerCardForm'),
      billingForm: () => props('PrimerBillingAddressForm'),
      pay: () => props('PrimerButton'),
    };
  }

  it('locks both forms and spins Pay from the tap, while the billing address is still being sent', async () => {
    const screen = render();
    expect(screen.cardForm().editable).toBe(true);
    expect(screen.billingForm().editable).toBe(true);
    expect(screen.pay().loading).toBe(false);

    await act(async () => {
      void screen.pay().onPress();
    });

    expect(mockFlush).toHaveBeenCalledTimes(1);
    expect(screen.cardForm().editable).toBe(false);
    expect(screen.billingForm().editable).toBe(false);
    expect(screen.pay().loading).toBe(true);
    expect(mockReplace).not.toHaveBeenCalled();
    expect(mockSubmit).not.toHaveBeenCalled();

    await act(async () => {
      mockResolveFlush();
    });

    expect(mockReplace).toHaveBeenCalledWith(CheckoutRoute.processing);
    expect(mockSubmit).toHaveBeenCalledTimes(1);
  });

  it('ignores a second tap while the first one is running', async () => {
    const screen = render();
    const onPress = screen.pay().onPress;

    await act(async () => {
      void onPress();
      void onPress();
    });
    await act(async () => {
      mockResolveFlush();
    });

    expect(mockFlush).toHaveBeenCalledTimes(1);
    expect(mockReplace).toHaveBeenCalledTimes(1);
    expect(mockSubmit).toHaveBeenCalledTimes(1);
  });
});
