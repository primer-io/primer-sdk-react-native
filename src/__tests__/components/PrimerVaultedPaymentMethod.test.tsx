import { createElement } from 'react';
// @ts-expect-error -- react-test-renderer has no types for React 19
import renderer, { act } from 'react-test-renderer';
import type {
  UsePrimerVaultManagerReturn,
  VaultedPaymentMethodItem,
} from '../../Components/types/VaultedPaymentMethodTypes';
import type { PrimerVaultedPaymentMethod as RawVaultedMethod } from '../../models/PrimerVaultedPaymentMethod';

// @ts-expect-error -- React 19 concurrent act environment
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

jest.mock(
  'react-native',
  () => ({
    Image: 'Image',
    StyleSheet: { create: (s: unknown) => s, flatten: (s: unknown) => s },
    Text: 'Text',
    TextInput: 'TextInput',
    TouchableOpacity: 'TouchableOpacity',
    ActivityIndicator: 'ActivityIndicator',
    View: 'View',
    Platform: { OS: 'ios' },
    useColorScheme: () => 'light',
  }),
  { virtual: true }
);

jest.mock('../../Components/internal/theme', () => ({
  usePrimerTheme: () => ({
    colors: {
      background: '#fff',
      surface: '#fafafa',
      border: '#ccc',
      borderDisabled: '#eee',
      borderError: '#f00',
      borderFocused: '#08f',
      primary: '#08f',
      textPrimary: '#000',
      textSecondary: '#666',
      textPlaceholder: '#999',
      textDisabled: '#aaa',
      textNegative: '#f00',
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
  usePrimerLocalization: () => ({
    t: (key: string, params?: Record<string, unknown>) => (params ? `${key}:${JSON.stringify(params)}` : key),
  }),
}));

jest.mock('../../Components/internal/navigation/useNavigation', () => ({
  useNavigation: jest.fn(),
}));

jest.mock('../../Components/analytics', () => ({
  PrimerAnalytics: { trackEvent: jest.fn() },
}));

jest.mock('../../Components/hooks/usePrimerVaultManager', () => ({
  usePrimerVaultManager: jest.fn(),
}));

jest.mock('../../Components/hooks/usePrimerCheckout', () => ({
  usePrimerCheckout: jest.fn(),
}));

jest.mock('../../Components/hooks/useCardNetworkDescriptor', () => ({
  useCardNetworkDescriptor: (network: string | null | undefined) => ({
    id: network ?? 'OTHER',
    panLengths: [16],
    gapPattern: [4, 8, 12],
    cvvLength: network === 'AMEX' ? 4 : 3,
    cvvLabel: network === 'AMEX' ? 'CID' : 'CVV',
  }),
}));

import { PrimerVaultedPaymentMethod } from '../../Components/PrimerVaultedPaymentMethod';
import { useNavigation } from '../../Components/internal/navigation/useNavigation';
import { PrimerAnalytics } from '../../Components/analytics';
import { usePrimerVaultManager } from '../../Components/hooks/usePrimerVaultManager';
import { usePrimerCheckout } from '../../Components/hooks/usePrimerCheckout';

const mockReplace = jest.fn();
(useNavigation as jest.Mock).mockReturnValue({ replace: mockReplace, push: jest.fn(), pop: jest.fn() });
const mockTrackEvent = PrimerAnalytics.trackEvent as jest.Mock;
const mockUseVault = usePrimerVaultManager as jest.Mock;
const mockUseProvider = usePrimerCheckout as jest.Mock;
const mockHookState: { current: UsePrimerVaultManagerReturn } = {
  current: undefined as unknown as UsePrimerVaultManagerReturn,
};
const mockSetCvvInputVisible = jest.fn((visible: boolean) => {
  if (mockHookState.current) {
    mockHookState.current = { ...mockHookState.current, cvvInputVisible: visible };
  }
});
mockUseVault.mockImplementation(() => mockHookState.current);
mockUseProvider.mockImplementation(() => ({ setCvvInputVisible: mockSetCvvInputVisible }));

function makeRawCard(overrides: Partial<RawVaultedMethod> = {}): RawVaultedMethod {
  return {
    id: 'vault-1',
    analyticsId: 'a1',
    paymentInstrumentType: 'PAYMENT_CARD',
    paymentMethodType: 'PAYMENT_CARD',
    paymentInstrumentData: {
      cardholderName: 'John Appleseed',
      network: 'MASTERCARD',
      last4Digits: 1234,
      expirationMonth: 5,
      expirationYear: 2026,
    },
    ...overrides,
  };
}

function makeItem(raw: RawVaultedMethod, overrides: Partial<VaultedPaymentMethodItem> = {}): VaultedPaymentMethodItem {
  return {
    id: raw.id,
    paymentMethodType: raw.paymentMethodType,
    paymentInstrumentType: raw.paymentInstrumentType,
    cardholderName: raw.paymentInstrumentData?.cardholderName,
    last4: raw.paymentInstrumentData?.last4Digits != null ? String(raw.paymentInstrumentData.last4Digits) : undefined,
    expiryMonth: '05',
    expiryYear: '26',
    brandName: 'Mastercard',
    rawMethod: raw,
    ...overrides,
  };
}

const mockPay = jest.fn();

function makeHook(overrides: Partial<UsePrimerVaultManagerReturn> = {}): UsePrimerVaultManagerReturn {
  const card = makeItem(makeRawCard());
  return {
    vaultedMethods: [card],
    primaryMethod: card,
    originalDefault: card,
    activeMethod: card,
    vaultDisplayMode: 'lite',
    isLoading: false,
    error: null,
    requiresVaultedCardCvv: false,
    cvvInputVisible: false,
    pay: mockPay,
    payById: jest.fn(),
    selectVaultedMethodId: jest.fn(),
    requestExpandedVaultDisplay: jest.fn(),
    deleteVaultedPaymentMethod: jest.fn(),
    ...overrides,
  };
}

function findByType(tree: any, type: string, results: any[] = []): any[] {
  if (tree == null) return results;
  if (typeof tree === 'object') {
    if (tree.type === type) results.push(tree);
    if (Array.isArray(tree.children)) {
      for (const child of tree.children) findByType(child, type, results);
    }
  }
  return results;
}

function findFirstByType(tree: any, type: string): any | null {
  return findByType(tree, type)[0] ?? null;
}

function findCheckoutButton(tree: any): any | null {
  const tos = findByType(tree, 'TouchableOpacity');
  return tos.find((t) => t.props?.accessibilityRole === 'button') ?? null;
}

// Force re-render so the component re-reads the mutated mockHookState (the mocks live outside
// React's state tracking, so React doesn't know to re-render on its own).
function rerender(tree: any) {
  act(() => {
    tree.update(createElement(PrimerVaultedPaymentMethod, {}));
  });
}

beforeEach(() => {
  mockReplace.mockClear();
  mockTrackEvent.mockClear();
  mockSetCvvInputVisible.mockClear();
  mockPay.mockReset();
  mockPay.mockResolvedValue(undefined);
});

describe('PrimerVaultedPaymentMethod — US1 trigger', () => {
  it('regression: Pay tap without CVV-recapture flag goes straight to processing route', () => {
    mockHookState.current = makeHook({ requiresVaultedCardCvv: false });
    let tree: any;
    act(() => {
      tree = renderer.create(createElement(PrimerVaultedPaymentMethod, {}));
    });
    const button = findCheckoutButton(tree.toJSON());
    expect(button).toBeTruthy();
    act(() => {
      (button.props.onPress as () => void)();
    });
    expect(mockReplace).toHaveBeenCalledWith('processing');
    expect(mockPay).toHaveBeenCalledWith();
    expect(mockTrackEvent).not.toHaveBeenCalledWith('VAULT_CVV_REQUIRED_RENDERED', expect.anything());
  });

  it('renders CVV row + emits VAULT_CVV_REQUIRED_RENDERED on Pay tap when flag is on AND method is a card', () => {
    mockHookState.current = makeHook({ requiresVaultedCardCvv: true });
    let tree: any;
    act(() => {
      tree = renderer.create(createElement(PrimerVaultedPaymentMethod, {}));
    });
    const button = findCheckoutButton(tree.toJSON());
    act(() => {
      (button.props.onPress as () => void)();
    });
    rerender(tree);
    expect(mockReplace).not.toHaveBeenCalled();
    expect(mockPay).not.toHaveBeenCalled();
    expect(mockTrackEvent).toHaveBeenCalledWith('VAULT_CVV_REQUIRED_RENDERED', {
      vaultedMethodId: 'vault-1',
      network: 'MASTERCARD',
      expectedCvvLength: '3',
    });
    const inputs = findByType(tree.toJSON(), 'TextInput');
    expect(inputs.length).toBeGreaterThanOrEqual(1);
  });

  it('FR-003: non-card vaulted method bypasses CVV state even when flag is true', () => {
    const paypalRaw = makeRawCard({
      id: 'vault-paypal',
      paymentInstrumentType: 'PAYPAL',
      paymentMethodType: 'PAYPAL',
      paymentInstrumentData: undefined,
    });
    const paypal = makeItem(paypalRaw, {
      brandName: undefined,
      last4: undefined,
      expiryMonth: undefined,
      expiryYear: undefined,
      cardholderName: undefined,
    });
    mockHookState.current = makeHook({
      requiresVaultedCardCvv: true,
      activeMethod: paypal,
      primaryMethod: paypal,
      originalDefault: paypal,
      vaultedMethods: [paypal],
    });
    let tree: any;
    act(() => {
      tree = renderer.create(createElement(PrimerVaultedPaymentMethod, {}));
    });
    const button = findCheckoutButton(tree.toJSON());
    act(() => {
      (button.props.onPress as () => void)();
    });
    expect(mockReplace).toHaveBeenCalledWith('processing');
    expect(mockPay).toHaveBeenCalledWith();
    expect(mockTrackEvent).not.toHaveBeenCalledWith('VAULT_CVV_REQUIRED_RENDERED', expect.anything());
  });
});

describe('PrimerVaultedPaymentMethod — US2 submit', () => {
  it('Pay button is disabled until CVV is complete', () => {
    mockHookState.current = makeHook({ requiresVaultedCardCvv: true });
    let tree: any;
    act(() => {
      tree = renderer.create(createElement(PrimerVaultedPaymentMethod, {}));
    });
    let button = findCheckoutButton(tree.toJSON());
    expect(button.props.accessibilityState?.disabled).toBe(false);
    act(() => {
      (button.props.onPress as () => void)();
    });
    rerender(tree);
    button = findCheckoutButton(tree.toJSON());
    expect(button.props.accessibilityState?.disabled).toBe(true);
    const input = findFirstByType(tree.toJSON(), 'TextInput');
    act(() => {
      (input.props.onChangeText as (s: string) => void)('12');
    });
    button = findCheckoutButton(tree.toJSON());
    expect(button.props.accessibilityState?.disabled).toBe(true);
    act(() => {
      (input.props.onChangeText as (s: string) => void)('123');
    });
    button = findCheckoutButton(tree.toJSON());
    expect(button.props.accessibilityState?.disabled).toBe(false);
  });

  it('submits with CVV on second Pay tap; emits VAULT_CVV_SUBMITTED', () => {
    mockHookState.current = makeHook({ requiresVaultedCardCvv: true });
    let tree: any;
    act(() => {
      tree = renderer.create(createElement(PrimerVaultedPaymentMethod, {}));
    });
    let button = findCheckoutButton(tree.toJSON());
    act(() => {
      (button.props.onPress as () => void)();
    });
    rerender(tree);
    const input = findFirstByType(tree.toJSON(), 'TextInput');
    act(() => {
      (input.props.onChangeText as (s: string) => void)('123');
    });
    button = findCheckoutButton(tree.toJSON());
    act(() => {
      (button.props.onPress as () => void)();
    });
    expect(mockTrackEvent).toHaveBeenCalledWith('VAULT_CVV_SUBMITTED', {
      vaultedMethodId: 'vault-1',
      network: 'MASTERCARD',
    });
    expect(mockReplace).toHaveBeenCalledWith('processing');
    expect(mockPay).toHaveBeenCalledWith({ cvv: '123' });
  });

  it('does not submit when CVV is incomplete', () => {
    mockHookState.current = makeHook({ requiresVaultedCardCvv: true });
    let tree: any;
    act(() => {
      tree = renderer.create(createElement(PrimerVaultedPaymentMethod, {}));
    });
    let button = findCheckoutButton(tree.toJSON());
    act(() => {
      (button.props.onPress as () => void)();
    });
    rerender(tree);
    // TouchableOpacity gates onPress on `disabled`, so asserting disabled covers the gate.
    button = findCheckoutButton(tree.toJSON());
    expect(button.props.accessibilityState?.disabled).toBe(true);
    expect(mockPay).not.toHaveBeenCalled();
  });

  it('SC-004 regression: even when payFromVault rejects, the component does not mutate provider list/active/display on rejection', async () => {
    // Self-handle the rejection so `void hook.pay(...)` doesn't surface an unhandled rejection
    // in tests; in production the provider routes errors to the merchant's onError callback.
    const rejection = { errorId: 'PAYMENT_FAILED', description: 'declined' };
    mockPay.mockReset();
    mockPay.mockImplementation(() =>
      Promise.reject(rejection).catch(() => {
        /* swallow */
      })
    );
    const select = jest.fn();
    const requestExpanded = jest.fn();
    mockHookState.current = makeHook({
      requiresVaultedCardCvv: true,
      selectVaultedMethodId: select,
      requestExpandedVaultDisplay: requestExpanded,
    });
    let tree: any;
    act(() => {
      tree = renderer.create(createElement(PrimerVaultedPaymentMethod, {}));
    });
    let button = findCheckoutButton(tree.toJSON());
    // First tap opens CVV state and legitimately commits the active method (forces lite layout).
    act(() => {
      (button.props.onPress as () => void)();
    });
    expect(select).toHaveBeenCalledTimes(1);
    expect(select).toHaveBeenCalledWith('vault-1');
    select.mockClear();
    requestExpanded.mockClear();
    rerender(tree);
    const input = findFirstByType(tree.toJSON(), 'TextInput');
    act(() => {
      (input.props.onChangeText as (s: string) => void)('123');
    });
    button = findCheckoutButton(tree.toJSON());
    await act(async () => {
      (button.props.onPress as () => void)();
      await Promise.resolve();
    });
    expect(select).not.toHaveBeenCalled();
    expect(requestExpanded).not.toHaveBeenCalled();
  });

  it('AMEX requires 4 digits before Pay enables', () => {
    const amexRaw = makeRawCard({
      paymentInstrumentData: {
        cardholderName: 'John Appleseed',
        network: 'AMEX',
        last4Digits: 5,
        expirationMonth: 5,
        expirationYear: 2026,
      },
    });
    const amex = makeItem(amexRaw, { brandName: 'Amex' });
    mockHookState.current = makeHook({
      requiresVaultedCardCvv: true,
      activeMethod: amex,
      primaryMethod: amex,
      originalDefault: amex,
      vaultedMethods: [amex],
    });
    let tree: any;
    act(() => {
      tree = renderer.create(createElement(PrimerVaultedPaymentMethod, {}));
    });
    let button = findCheckoutButton(tree.toJSON());
    act(() => {
      (button.props.onPress as () => void)();
    });
    rerender(tree);
    const input = findFirstByType(tree.toJSON(), 'TextInput');
    act(() => {
      (input.props.onChangeText as (s: string) => void)('123');
    });
    button = findCheckoutButton(tree.toJSON());
    expect(button.props.accessibilityState?.disabled).toBe(true);
    act(() => {
      (input.props.onChangeText as (s: string) => void)('1234');
    });
    button = findCheckoutButton(tree.toJSON());
    expect(button.props.accessibilityState?.disabled).toBe(false);
  });
});

describe('PrimerVaultedPaymentMethod — US3 exit', () => {
  it('emits VAULT_CVV_REQUIRED_DISMISSED and clears CVV state when vaultDisplayMode flips to expanded', () => {
    mockHookState.current = makeHook({ requiresVaultedCardCvv: true });
    let tree: any;
    act(() => {
      tree = renderer.create(createElement(PrimerVaultedPaymentMethod, {}));
    });
    const button = findCheckoutButton(tree.toJSON());
    act(() => {
      (button.props.onPress as () => void)();
    });
    rerender(tree);
    expect(findByType(tree.toJSON(), 'TextInput').length).toBeGreaterThanOrEqual(1);
    mockHookState.current = { ...mockHookState.current, vaultDisplayMode: 'expanded' };
    act(() => {
      tree.update(createElement(PrimerVaultedPaymentMethod, {}));
    });
    expect(mockTrackEvent).toHaveBeenCalledWith('VAULT_CVV_REQUIRED_DISMISSED', { vaultedMethodId: 'vault-1' });
    rerender(tree);
    expect(findByType(tree.toJSON(), 'TextInput').length).toBe(0);
  });

  it('re-tapping Pay after dismissal re-triggers CVV state with empty value', () => {
    mockHookState.current = makeHook({ requiresVaultedCardCvv: true });
    let tree: any;
    act(() => {
      tree = renderer.create(createElement(PrimerVaultedPaymentMethod, {}));
    });
    let button = findCheckoutButton(tree.toJSON());
    act(() => {
      (button.props.onPress as () => void)();
    });
    rerender(tree);
    let input = findFirstByType(tree.toJSON(), 'TextInput');
    act(() => {
      (input.props.onChangeText as (s: string) => void)('99');
    });
    mockHookState.current = { ...mockHookState.current, vaultDisplayMode: 'expanded' };
    act(() => {
      tree.update(createElement(PrimerVaultedPaymentMethod, {}));
    });
    mockHookState.current = makeHook({ requiresVaultedCardCvv: true, vaultDisplayMode: 'lite' });
    act(() => {
      tree.update(createElement(PrimerVaultedPaymentMethod, {}));
    });
    button = findCheckoutButton(tree.toJSON());
    act(() => {
      (button.props.onPress as () => void)();
    });
    rerender(tree);
    input = findFirstByType(tree.toJSON(), 'TextInput');
    expect(input.props.value).toBe('');
  });

  it('FR-014: changing the active method clears CVV state', () => {
    mockHookState.current = makeHook({ requiresVaultedCardCvv: true });
    let tree: any;
    act(() => {
      tree = renderer.create(createElement(PrimerVaultedPaymentMethod, {}));
    });
    const button = findCheckoutButton(tree.toJSON());
    act(() => {
      (button.props.onPress as () => void)();
    });
    rerender(tree);
    let input = findFirstByType(tree.toJSON(), 'TextInput');
    act(() => {
      (input.props.onChangeText as (s: string) => void)('12');
    });
    expect(findFirstByType(tree.toJSON(), 'TextInput').props.value).toBe('12');
    const otherRaw = makeRawCard({ id: 'vault-2' });
    const other = makeItem(otherRaw, { id: 'vault-2' });
    mockHookState.current = {
      ...mockHookState.current,
      activeMethod: other,
      primaryMethod: other,
      originalDefault: other,
      vaultedMethods: [other],
    };
    act(() => {
      tree.update(createElement(PrimerVaultedPaymentMethod, {}));
    });
    expect(findByType(tree.toJSON(), 'TextInput').length).toBe(0);
  });
});
