// @ts-expect-error -- React 19 concurrent act environment
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

import { createElement } from 'react';
// @ts-expect-error -- react-test-renderer has no types for React 19
import renderer, { act } from 'react-test-renderer';

jest.mock(
  'react-native',
  () => ({
    ScrollView: 'ScrollView',
    StyleSheet: { create: (s: unknown) => s, flatten: (s: unknown) => s, hairlineWidth: 1 },
    Text: 'Text',
    TextInput: 'TextInput',
    TouchableOpacity: 'TouchableOpacity',
    View: 'View',
  }),
  { virtual: true }
);

// `mock`-prefixed so the hoisted jest.mock factories may reference them.
const mockStart = jest.fn().mockResolvedValue(undefined);
const mockSetData = jest.fn().mockResolvedValue(undefined);
const mockSubmit = jest.fn().mockResolvedValue(undefined);
const mockReplace = jest.fn();
// The payment-method hook's return value — swapped per test.
let mockMethod: any;

jest.mock('../../Components/hooks/usePrimerPaymentMethod', () => ({
  usePrimerPaymentMethod: () => mockMethod,
}));

jest.mock('../../Components/internal/theme', () => ({
  usePrimerTheme: () => ({
    colors: { background: '#fff', border: '#ccc', primary: '#08f', textPrimary: '#000' },
    spacing: { xsmall: 4, small: 8, medium: 12, large: 16 },
    radii: { medium: 8 },
    typography: {
      titleLarge: { fontFamily: 'system', fontSize: 16, fontWeight: '500', letterSpacing: 0, lineHeight: 20 },
    },
  }),
}));

jest.mock('../../Components/internal/localization', () => ({
  usePrimerLocalization: () => ({ t: (key: string) => key }),
}));

jest.mock('../../Components/internal/navigation/useRoute', () => ({
  useRoute: () => ({ params: { paymentMethodType: 'ADYEN_MBWAY' } }),
}));

jest.mock('../../Components/internal/navigation/useNavigation', () => ({
  useNavigation: () => ({ pop: jest.fn(), replace: mockReplace, canGoBack: false }),
}));

jest.mock('../../Components/internal/checkout-flow/CheckoutFlowContext', () => ({
  useCheckoutFlow: () => ({ onCancel: jest.fn() }),
}));

jest.mock('../../Components/internal/screens/useBottomSafeArea', () => ({ useBottomSafeArea: () => 0 }));
jest.mock('../../Components/internal/navigation/NavigationHeader', () => ({ NavigationHeader: () => null }));

import { RawDataFormScreen } from '../../Components/internal/screens/RawDataFormScreen';

function rawDataForm(overrides: Record<string, unknown> = {}) {
  return {
    kind: 'rawDataForm',
    isAvailable: true,
    requiredInputs: ['PHONE_NUMBER'],
    validationErrors: [],
    isValid: false,
    paymentOutcome: null,
    start: mockStart,
    setData: mockSetData,
    submit: mockSubmit,
    clearPaymentOutcome: jest.fn(),
    ...overrides,
  };
}

// Mount inside act, then read the tree after commit (accessing `.root` mid-act throws "unmounted").
function render() {
  let instance: any;
  act(() => {
    instance = renderer.create(createElement(RawDataFormScreen));
  });
  return instance;
}

const textInputs = (root: any) => root.findAll((n: any) => n.type === 'TextInput');
const payButton = (root: any) => root.findAll((n: any) => n.type === 'TouchableOpacity')[0];

describe('RawDataFormScreen (ORC-6514)', () => {
  beforeEach(() => jest.clearAllMocks());

  it('activates the raw-data manager on mount and picks a keyboard per field', () => {
    mockMethod = rawDataForm({ requiredInputs: ['PHONE_NUMBER', 'OTP', 'CARDHOLDER_NAME'] });
    const root = render().root;

    expect(mockStart).toHaveBeenCalledTimes(1);
    const inputs = textInputs(root);
    expect(inputs).toHaveLength(3);
    // PHONE_NUMBER → phone-pad (so '+' works); other numeric fields → number-pad; text → default.
    expect(inputs.map((i: any) => i.props.keyboardType)).toEqual(['phone-pad', 'number-pad', 'default']);
  });

  it('forwards typed input to the SDK in the right raw-data shape', () => {
    mockMethod = rawDataForm({ requiredInputs: ['PHONE_NUMBER'] });
    const root = render().root;

    act(() => textInputs(root)[0].props.onChangeText('912345678'));
    expect(mockSetData).toHaveBeenCalledWith({ phoneNumber: '912345678' });
  });

  it('blocks submit until the data is valid', () => {
    mockMethod = rawDataForm({ isValid: false });
    const root = render().root;

    expect(payButton(root).props.disabled).toBe(true);
    act(() => payButton(root).props.onPress());
    expect(mockSubmit).not.toHaveBeenCalled();
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it('submits and advances to processing once valid', () => {
    mockMethod = rawDataForm({ isValid: true });
    const root = render().root;

    expect(payButton(root).props.disabled).toBe(false);
    act(() => payButton(root).props.onPress());
    expect(mockReplace).toHaveBeenCalledWith('processing');
    expect(mockSubmit).toHaveBeenCalledTimes(1);
  });

  it('renders nothing when the method is not a raw-data form', () => {
    mockMethod = { kind: 'card', isAvailable: true, start: jest.fn(), clearPaymentOutcome: jest.fn() };

    expect(render().toJSON()).toBeNull();
    expect(mockStart).not.toHaveBeenCalled();
  });
});
