// @ts-expect-error -- React 19 concurrent act environment
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

import { createElement } from 'react';
// @ts-expect-error -- react-test-renderer has no types for React 19
import renderer, { act } from 'react-test-renderer';

// `mock`-prefixed names so the hoisted jest.mock factories may reference them.
const mockMethods = [
  { id: 'pm_1', paymentMethodType: 'PAYMENT_CARD' },
  { id: 'pm_2', paymentMethodType: 'PAYMENT_CARD' },
];
jest.mock('../../Components/hooks/usePrimerVaultManager', () => ({
  usePrimerVaultManager: () => ({
    vaultedMethods: mockMethods,
    activeMethod: mockMethods[0],
    selectVaultedMethodId: jest.fn(),
    deleteVaultedPaymentMethod: jest.fn(),
  }),
}));

jest.mock('../../Components/internal/vaultRowDisplay', () => ({
  getVaultRowDisplay: (method: { id: string }) => ({ accessibilityLabel: method.id }),
}));

jest.mock('../../Components/internal/theme', () => ({
  usePrimerTheme: () => ({
    colors: {},
    spacing: { xxsmall: 2, xsmall: 4, small: 8, medium: 12, large: 16, xlarge: 20, xxlarge: 24 },
    radii: { xsmall: 2, small: 4, medium: 8, large: 12 },
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

jest.mock('../../Components/internal/localization', () => ({
  usePrimerLocalization: () => ({ t: (key: string) => key }),
}));

const mockPop = jest.fn();
jest.mock('../../Components/internal/navigation/useNavigation', () => ({
  useNavigation: () => ({ pop: mockPop }),
}));

jest.mock('../../Components/internal/navigation/NavigationHeader', () => ({
  NavigationHeader: 'NavigationHeader',
}));
jest.mock('../../Components/internal/ui/PrimerButton', () => ({ PrimerButton: 'PrimerButton' }));
jest.mock('../../Components/internal/screens/useBottomSafeArea', () => ({ useBottomSafeArea: () => 0 }));
jest.mock('../../Components/internal/screens/useStatusScreenHeight', () => ({ useStatusScreenHeight: () => {} }));
jest.mock('../../Components/analytics', () => ({ PrimerAnalytics: { trackEvent: jest.fn() } }));

import { VaultedMethodsScreen } from '../../Components/internal/screens/VaultedMethodsScreen';

const rnMock = require('react-native');

function renderInEditMode() {
  let tree: any;
  act(() => {
    tree = renderer.create(createElement(VaultedMethodsScreen));
  });
  const header = () => tree.root.findByType('NavigationHeader');
  act(() => header().props.rightAction.onPress()); // Edit
  // The shared mock's FlatList does not draw its rows; draw the second one to reach its delete button.
  const list = tree.root.findByType('FlatList');
  let row: any;
  act(() => {
    row = renderer.create(list.props.renderItem({ item: list.props.data[1], index: 1 }));
  });
  const deleteButton = row.root.findByProps({ accessibilityLabel: 'accessibility_vault_delete_payment_method' });
  return { tree, header, deleteButton };
}

function renderOnDeleteQuestion() {
  const { tree, header, deleteButton } = renderInEditMode();
  act(() => deleteButton.props.onPress());
  const isOnQuestion = () =>
    tree.root.findAll((node: any) => node.type === 'Text' && node.props.children === 'primer_vault_delete_message')
      .length > 0;
  const isEditing = () => header().props.rightAction.label === 'primer_vault_manage_button_done';
  return { header, isOnQuestion, isEditing };
}

describe('VaultedMethodsScreen — leaving the delete question', () => {
  beforeEach(() => {
    mockPop.mockClear();
  });

  it('Back returns to the saved list still in edit mode, like Cancel', () => {
    const { header, isOnQuestion, isEditing } = renderOnDeleteQuestion();
    expect(isOnQuestion()).toBe(true);

    act(() => header().props.onBackPress());

    expect(isOnQuestion()).toBe(false);
    expect(isEditing()).toBe(true);
    expect(mockPop).not.toHaveBeenCalled();
    expect(header().props.onBackPress).toBeUndefined();
  });
});

describe('VaultedMethodsScreen — delete button touch area', () => {
  afterEach(() => {
    rnMock.Platform.OS = 'ios';
  });

  function touchArea() {
    const { deleteButton } = renderInEditMode();
    const { style, hitSlop } = deleteButton.props;
    return {
      width: style.width + hitSlop.left + hitSlop.right,
      height: style.height + hitSlop.top + hitSlop.bottom,
      left: hitSlop.left,
    };
  }

  it.each([
    ['ios', 44],
    ['android', 48],
  ])('is at least the %s minimum and stays out of the card next to it', (os, minimum) => {
    rnMock.Platform.OS = os;

    const area = touchArea();

    expect(area.width).toBeGreaterThanOrEqual(minimum);
    expect(area.height).toBeGreaterThanOrEqual(minimum);
    expect(area.left).toBeLessThanOrEqual(12); // the gap between the card and the button
  });
});
