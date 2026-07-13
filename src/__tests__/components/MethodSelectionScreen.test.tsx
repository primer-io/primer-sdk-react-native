// @ts-expect-error -- React 19 concurrent act environment
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

import { createElement } from 'react';
// @ts-expect-error -- react-test-renderer has no types for React 19
import renderer, { act } from 'react-test-renderer';

jest.mock(
  'react-native',
  () => ({
    Image: 'Image',
    StyleSheet: { create: (s: unknown) => s, flatten: (s: unknown) => s },
    Text: 'Text',
    TouchableOpacity: 'TouchableOpacity',
    View: 'View',
    Platform: { OS: 'ios', select: (o: any) => o.ios ?? o.default },
  }),
  { virtual: true }
);

// stopBanks is the disarm we assert on; the rest of the context surface is stubbed.
// `mock`-prefixed name so the hoisted jest.mock factory may reference it.
const mockStopBanks = jest.fn();
const mockStopKlarna = jest.fn();
jest.mock('../../Components/hooks/usePrimerCheckout', () => ({
  usePrimerCheckout: () => ({
    setActiveMethod: jest.fn(),
    startNativeUI: jest.fn(),
    stopBanks: mockStopBanks,
    stopKlarna: mockStopKlarna,
  }),
}));

jest.mock('../../Components/hooks/usePrimerPaymentMethods', () => ({
  usePrimerPaymentMethods: () => ({ paymentMethods: [] }),
}));

jest.mock('../../Components/hooks/usePrimerVaultManager', () => ({
  usePrimerVaultManager: () => ({
    activeMethod: null,
    vaultDisplayMode: 'none',
    requestExpandedVaultDisplay: jest.fn(),
    cvvInputVisible: false,
  }),
}));

jest.mock('../../Components/internal/theme', () => ({
  usePrimerTheme: () => ({
    colors: {
      background: '#fff',
      surface: '#fafafa',
      border: '#ccc',
      primary: '#08f',
      textPrimary: '#000',
      textSecondary: '#666',
    },
    spacing: { xxsmall: 2, xsmall: 4, small: 8, medium: 12, large: 16, xlarge: 20, xxlarge: 24 },
    radii: { small: 4, medium: 8, large: 12 },
    borders: { input: 1, default: 1, strong: 2 },
    typography: {
      fontFamily: 'system',
      bodySmall: { fontFamily: 'system', fontSize: 12, fontWeight: '400', letterSpacing: 0, lineHeight: 16 },
      bodyMedium: { fontFamily: 'system', fontSize: 14, fontWeight: '400', letterSpacing: 0, lineHeight: 18 },
      bodyLarge: { fontFamily: 'system', fontSize: 16, fontWeight: '400', letterSpacing: 0, lineHeight: 20 },
      titleLarge: { fontFamily: 'system', fontSize: 16, fontWeight: '500', letterSpacing: 0, lineHeight: 20 },
      titleXLarge: { fontFamily: 'system', fontSize: 18, fontWeight: '600', letterSpacing: 0, lineHeight: 22 },
    },
  }),
}));

jest.mock('../../Components/internal/localization', () => ({
  usePrimerLocalization: () => ({ t: (key: string) => key }),
}));

jest.mock('../../Components/internal/checkout-flow/CheckoutFlowContext', () => ({
  useCheckoutFlow: () => ({ onCancel: jest.fn() }),
}));

jest.mock('../../Components/internal/navigation/useNavigation', () => ({
  useNavigation: () => ({ push: jest.fn(), replace: jest.fn() }),
}));

jest.mock('../../Components/internal/screens/useBottomSafeArea', () => ({ useBottomSafeArea: () => 0 }));
jest.mock('../../Components/internal/screens/useKeyboardHeight', () => ({
  useKeyboardHeight: () => 0,
  getLastSeenKeyboardHeight: () => 0,
}));
jest.mock('../../Components/internal/screens/useStatusScreenHeight', () => ({ useStatusScreenHeight: () => {} }));

// Child components + analytics are irrelevant to the disarm wiring — stub them out.
jest.mock('../../Components/PrimerPaymentMethodList', () => ({ PrimerPaymentMethodList: () => null }));
jest.mock('../../Components/PrimerVaultedPaymentMethod', () => ({ PrimerVaultedPaymentMethod: () => null }));
jest.mock('../../Components/internal/navigation/NavigationHeader', () => ({ NavigationHeader: () => null }));
jest.mock('../../Components/internal/ui/CheckoutButton', () => ({ CheckoutButton: () => null }));
jest.mock('../../Components/internal/ui/PaymentMethodButton', () => ({ PAYMENT_METHOD_BUTTON_HEIGHT: 56 }));
jest.mock('../../Components/analytics', () => ({ PrimerAnalytics: { trackEvent: jest.fn() } }));

import { MethodSelectionScreen } from '../../Components/internal/screens/MethodSelectionScreen';

describe('MethodSelectionScreen — flow disarm on mount (ORC-6514/6515)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('disarms any active bank flow on mount so re-picking the same method re-fetches', () => {
    act(() => {
      renderer.create(createElement(MethodSelectionScreen));
    });
    // Landing on the method list is the "shopper left the bank flow" signal — it must disarm,
    // and it must do so here (not on bank-screen unmount, which would fire mid-submit).
    expect(mockStopBanks).toHaveBeenCalledTimes(1);
  });

  it('disarms any active Klarna flow on mount so an abandoned session is torn down', () => {
    act(() => {
      renderer.create(createElement(MethodSelectionScreen));
    });
    expect(mockStopKlarna).toHaveBeenCalledTimes(1);
  });
});
