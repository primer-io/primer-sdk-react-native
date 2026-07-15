/**
 * Prebuilt ACH screen tests (specs/004-stripe-ach-components):
 *   - user-details: gated Continue, waiting state during the native bank link,
 *     back and Cancel are hidden/no-op while waiting (U1), inline per-field errors + editable prefills (US3)
 *   - mandate: renders the resolved text, accept/decline wiring, buttons disable while answering
 *   - pending: distinct confirmation with the ported completion copy + auto-dismiss
 */
// @ts-expect-error -- React 19 concurrent act environment
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

import { createElement } from 'react';
import type { ReactElement } from 'react';
// @ts-expect-error -- react-test-renderer has no types for React 19
import renderer, { act } from 'react-test-renderer';

jest.mock(
  'react-native',
  () => ({
    ActivityIndicator: 'ActivityIndicator',
    ScrollView: 'ScrollView',
    StyleSheet: { create: (s: unknown) => s, flatten: (s: unknown) => s, hairlineWidth: 1 },
    Text: 'Text',
    TouchableOpacity: 'TouchableOpacity',
    View: 'View',
    Platform: { OS: 'ios', select: (o: { ios?: unknown; default?: unknown }) => o.ios ?? o.default },
    useWindowDimensions: () => ({ width: 375, height: 812, scale: 2, fontScale: 1 }),
  }),
  { virtual: true }
);

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

const mockPop = jest.fn();
const mockPopToRoot = jest.fn();
jest.mock('../../Components/internal/navigation/useNavigation', () => ({
  useNavigation: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    pop: mockPop,
    popToRoot: mockPopToRoot,
    canGoBack: true,
  }),
}));
jest.mock('../../Components/internal/navigation/useRoute', () => ({
  useRoute: () => ({ params: { paymentMethodType: 'STRIPE_ACH' } }),
}));

jest.mock('../../Components/internal/screens/useBottomSafeArea', () => ({ useBottomSafeArea: () => 0 }));
jest.mock('../../Components/internal/screens/useKeyboardPadding', () => ({ useKeyboardPadding: () => 0 }));
jest.mock('../../Components/internal/screens/useStatusScreenHeight', () => ({ useStatusScreenHeight: () => {} }));
jest.mock('../../Components/internal/checkout-sheet', () => ({
  useSheetHeight: () => ({ requestHeight: () => () => {}, requestHeightRatio: () => () => {} }),
}));

// Capture NavigationHeader + PrimerTextInput + PrimerSuccessScreen props instead of rendering them.
let mockHeaderProps: Record<string, unknown> | null = null;
jest.mock('../../Components/internal/navigation/NavigationHeader', () => ({
  NavigationHeader: (props: Record<string, unknown>) => {
    mockHeaderProps = props;
    return null;
  },
}));

const mockInputPropsByLabel = new Map<string, Record<string, unknown>>();
jest.mock('../../Components/inputs', () => ({
  PrimerTextInput: (props: Record<string, unknown> & { label?: string }) => {
    mockInputPropsByLabel.set(props.label ?? '', props);
    return null;
  },
}));

let mockSuccessScreenProps: Record<string, unknown> | null = null;
jest.mock('../../Components/status', () => ({
  PrimerSuccessScreen: (props: Record<string, unknown>) => {
    mockSuccessScreenProps = props;
    return null;
  },
}));

// Controllable hook/context doubles.
import type { StripeAchPaymentMethod } from '../../Components/types/PrimerPaymentMethodTypes';
import type { PrimerCheckoutContextValue } from '../../Components/types/PrimerCheckoutProviderTypes';

const mockStopAch = jest.fn();
let mockAchVariant: StripeAchPaymentMethod;
let mockCheckoutContext: Partial<PrimerCheckoutContextValue>;

jest.mock('../../Components/hooks/usePrimerPaymentMethod', () => ({
  usePrimerPaymentMethod: () => mockAchVariant,
}));
jest.mock('../../Components/hooks/usePrimerCheckout', () => ({
  usePrimerCheckout: () => mockCheckoutContext,
}));

import { StripeAchUserDetailsScreen } from '../../Components/internal/screens/StripeAchUserDetailsScreen';
import { StripeAchMandateScreen } from '../../Components/internal/screens/StripeAchMandateScreen';
import { PendingScreen } from '../../Components/internal/screens/PendingScreen';

function baseVariant(overrides: Partial<StripeAchPaymentMethod>): StripeAchPaymentMethod {
  return {
    kind: 'stripeAch',
    isAvailable: true,
    step: 'collectingDetails',
    userDetails: { firstName: '', lastName: '', emailAddress: '' },
    fieldErrors: {},
    isValid: false,
    mandate: null,
    paymentOutcome: null,
    start: jest.fn().mockResolvedValue(undefined),
    setFirstName: jest.fn().mockResolvedValue(undefined),
    setLastName: jest.fn().mockResolvedValue(undefined),
    setEmailAddress: jest.fn().mockResolvedValue(undefined),
    submit: jest.fn().mockResolvedValue(undefined),
    acceptMandate: jest.fn().mockResolvedValue(undefined),
    declineMandate: jest.fn().mockResolvedValue(undefined),
    clearPaymentOutcome: jest.fn(),
    ...overrides,
  };
}

// react-test-renderer instance — typed loosely because the package ships no React 19 types.
type TestInstance = {
  findAllByType: (type: string) => Array<{ props: Record<string, unknown> }>;
};

function render(element: ReactElement): TestInstance {
  let tree: { root: TestInstance } | undefined;
  act(() => {
    tree = renderer.create(element);
  });
  return tree!.root;
}

function continueButton(root: TestInstance) {
  // The footer Continue is the only TouchableOpacity on the details screen.
  const touchables = root.findAllByType('TouchableOpacity');
  expect(touchables).toHaveLength(1);
  return touchables[0]!;
}

beforeEach(() => {
  jest.clearAllMocks();
  mockHeaderProps = null;
  mockSuccessScreenProps = null;
  mockInputPropsByLabel.clear();
  mockCheckoutContext = { stopAch: mockStopAch };
});

describe('StripeAchUserDetailsScreen', () => {
  it('gates Continue until the variant reports valid', () => {
    mockAchVariant = baseVariant({ isValid: false });
    const root = render(createElement(StripeAchUserDetailsScreen));
    const button = continueButton(root);
    expect(button.props.disabled).toBe(true);

    (button.props.onPress as () => void)();
    expect(mockAchVariant.submit).not.toHaveBeenCalled();
  });

  it('submits when valid and collecting', () => {
    mockAchVariant = baseVariant({ isValid: true, step: 'collectingDetails' });
    const root = render(createElement(StripeAchUserDetailsScreen));
    const button = continueButton(root);
    expect(button.props.disabled).toBe(false);

    (button.props.onPress as () => void)();
    expect(mockAchVariant.submit).toHaveBeenCalledTimes(1);
  });

  it('renders prefilled, editable values and inline per-field errors (US3)', () => {
    mockAchVariant = baseVariant({
      userDetails: { firstName: 'John', lastName: 'Smith', emailAddress: 'j@s.com' },
      fieldErrors: { emailAddress: 'Bad email' },
    });
    render(createElement(StripeAchUserDetailsScreen));

    const first = mockInputPropsByLabel.get('primer_ach_first_name_label');
    const email = mockInputPropsByLabel.get('primer_ach_email_address_label');
    expect(first?.value).toBe('John');
    expect(first?.editable).toBe(true);
    expect(email?.value).toBe('j@s.com');
    expect(email?.error).toBe('Bad email');

    (first?.onChangeText as (text: string) => void)('Johnny');
    expect(mockAchVariant.setFirstName).toHaveBeenCalledWith('Johnny');
  });

  it('shows the waiting state and blocks back while the native bank link runs (U1)', () => {
    mockAchVariant = baseVariant({ isValid: true, step: 'awaitingBankLink' });
    const root = render(createElement(StripeAchUserDetailsScreen));

    // Spinner replaces the Continue label; the button is disabled.
    const button = continueButton(root);
    expect(button.props.disabled).toBe(true);
    expect(root.findAllByType('ActivityIndicator')).toHaveLength(1);

    // Back affordance is hidden, and a stray back press is a no-op.
    expect(mockHeaderProps?.showBackButton).toBe(false);
    (mockHeaderProps?.onBackPress as () => void)();
    expect(mockStopAch).not.toHaveBeenCalled();
    expect(mockPop).not.toHaveBeenCalled();

    // Cancel is hidden too — no dismiss affordance while the native payment is in flight.
    expect(mockHeaderProps?.rightAction).toBeUndefined();
  });

  it('back disarms the flow and pops while collecting', () => {
    mockAchVariant = baseVariant({ step: 'collectingDetails' });
    render(createElement(StripeAchUserDetailsScreen));

    expect(mockHeaderProps?.rightAction).toBeDefined(); // Cancel is offered while editing
    (mockHeaderProps?.onBackPress as () => void)();
    expect(mockStopAch).toHaveBeenCalledTimes(1);
    expect(mockPop).toHaveBeenCalledTimes(1);
  });
});

describe('StripeAchMandateScreen', () => {
  it('renders the resolved mandate text with accept/decline wiring', () => {
    const acceptAchMandate = jest.fn().mockResolvedValue(undefined);
    const declineAchMandate = jest.fn().mockResolvedValue(undefined);
    mockCheckoutContext = {
      achMandate: { text: 'THE LEGAL TEXT', source: 'template' },
      achStep: 'mandatePending',
      acceptAchMandate,
      declineAchMandate,
    };
    const root = render(createElement(StripeAchMandateScreen));

    const texts = root.findAllByType('Text').map((t) => t.props.children);
    expect(texts).toContain('THE LEGAL TEXT');

    const [accept, decline] = root.findAllByType('TouchableOpacity');
    expect(accept!.props.disabled).toBe(false);
    (accept!.props.onPress as () => void)();
    expect(acceptAchMandate).toHaveBeenCalledTimes(1);

    (decline!.props.onPress as () => void)();
    expect(declineAchMandate).toHaveBeenCalledTimes(1);
    expect(mockPopToRoot).toHaveBeenCalledTimes(1);
  });

  it('disables both buttons while the answer is in flight', () => {
    mockCheckoutContext = {
      achMandate: { text: 'T', source: 'fullMandateText' },
      achStep: 'answeringMandate',
      acceptAchMandate: jest.fn(),
      declineAchMandate: jest.fn(),
    };
    const root = render(createElement(StripeAchMandateScreen));
    const buttons = root.findAllByType('TouchableOpacity');
    expect(buttons).toHaveLength(2);
    for (const button of buttons) {
      expect(button.props.disabled).toBe(true);
    }
  });

  it('renders nothing without a mandate (defensive)', () => {
    mockCheckoutContext = {
      achMandate: null,
      achStep: 'idle',
      acceptAchMandate: jest.fn(),
      declineAchMandate: jest.fn(),
    };
    const root = render(createElement(StripeAchMandateScreen));
    expect(root.findAllByType('TouchableOpacity')).toHaveLength(0);
  });
});

describe('PendingScreen', () => {
  it('shows the ported completion copy; dismissal is owned by the flow-level wrapper (no inner timer)', () => {
    render(createElement(PendingScreen));
    expect(mockSuccessScreenProps?.title).toBe('primer_ach_pay_with_title');
    expect(mockSuccessScreenProps?.subtitle).toBe('primer_ach_payment_request_completed');
    expect(mockSuccessScreenProps?.autoDismissMs).toBeUndefined();
    expect(mockSuccessScreenProps?.onDismiss).toBeUndefined();
  });
});
