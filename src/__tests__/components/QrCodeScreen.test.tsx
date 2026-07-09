// @ts-expect-error -- React 19 concurrent act environment
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

import { createElement } from 'react';
// @ts-expect-error -- react-test-renderer has no types for React 19
import renderer, { act } from 'react-test-renderer';

jest.mock(
  'react-native',
  () => ({
    ActivityIndicator: 'ActivityIndicator',
    Image: 'Image',
    StyleSheet: { create: (s: unknown) => s, flatten: (s: unknown) => s, hairlineWidth: 1 },
    Text: 'Text',
    View: 'View',
  }),
  { virtual: true }
);

// The shared checkout context — swapped per test.
let mockCheckout: { qrCode: { url?: string; base64?: string } | null; isQrPending: boolean };

jest.mock('../../Components/hooks/usePrimerCheckout', () => ({
  usePrimerCheckout: () => mockCheckout,
}));
jest.mock('../../Components/internal/checkout-flow/CheckoutFlowContext', () => ({
  useCheckoutFlow: () => ({ onCancel: jest.fn() }),
}));
jest.mock('../../Components/internal/localization', () => ({
  usePrimerLocalization: () => ({ t: (key: string) => key }),
}));
jest.mock('../../Components/internal/navigation/NavigationHeader', () => ({
  NavigationHeader: () => null,
}));
jest.mock('../../Components/internal/theme', () => ({
  usePrimerTheme: () => ({
    colors: { textPrimary: '#000', textSecondary: '#666' },
    spacing: { large: 16, xxlarge: 32 },
    typography: {
      bodyMedium: { fontFamily: 'system', fontSize: 14, lineHeight: 18 },
      titleLarge: { fontFamily: 'system', fontSize: 16, fontWeight: '500', letterSpacing: 0, lineHeight: 20 },
    },
  }),
}));
jest.mock('../../Components/internal/screens/useBottomSafeArea', () => ({
  useBottomSafeArea: () => 0,
}));
jest.mock('../../Components/internal/screens/useStatusScreenHeight', () => ({
  useStatusScreenHeight: () => {},
}));

import { QrCodeScreen } from '../../Components/internal/screens/QrCodeScreen';

function renderScreen() {
  let tree: any;
  act(() => {
    tree = renderer.create(createElement(QrCodeScreen));
  });
  return tree;
}
const images = (tree: any) => tree.root.findAll((n: any) => n.type === 'Image');
const spinners = (tree: any) => tree.root.findAll((n: any) => n.type === 'ActivityIndicator');
const textValues = (tree: any) => tree.root.findAll((n: any) => n.type === 'Text').map((n: any) => n.props.children);

describe('QrCodeScreen', () => {
  it('renders a base64 QR as a png data-URI image', () => {
    mockCheckout = { qrCode: { base64: 'ABC' }, isQrPending: false };
    const tree = renderScreen();
    expect(images(tree)[0]!.props.source.uri).toBe('data:image/png;base64,ABC');
    expect(textValues(tree)).toContain('primer_checkout_qr_instruction');
  });

  it('renders a url QR as a remote image', () => {
    mockCheckout = { qrCode: { url: 'https://qr.example/x.png' }, isQrPending: false };
    const tree = renderScreen();
    expect(images(tree)[0]!.props.source.uri).toBe('https://qr.example/x.png');
  });

  it('shows a spinner and no image before a QR arrives', () => {
    mockCheckout = { qrCode: null, isQrPending: false };
    const tree = renderScreen();
    expect(images(tree)).toHaveLength(0);
    expect(spinners(tree)).toHaveLength(1);
  });

  it('shows the waiting message while the payment is pending', () => {
    mockCheckout = { qrCode: { base64: 'ABC' }, isQrPending: true };
    const tree = renderScreen();
    expect(textValues(tree)).toContain('primer_checkout_qr_waiting');
  });

  it('surfaces an error (not a blank image) when the QR image fails to load', () => {
    mockCheckout = { qrCode: { base64: 'ABC' }, isQrPending: false };
    const tree = renderScreen();
    act(() => {
      images(tree)[0]!.props.onError();
    });
    expect(images(tree)).toHaveLength(0);
    expect(textValues(tree)).toContain('primer_checkout_qr_error');
    expect(textValues(tree)).not.toContain('primer_checkout_qr_instruction');
  });
});
