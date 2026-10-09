// @ts-expect-error -- React 19 concurrent act environment
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

import { createElement } from 'react';
// @ts-expect-error -- react-test-renderer has no types for React 19
import renderer, { act } from 'react-test-renderer';

jest.mock('../../Components/internal/theme', () => ({
  usePrimerTheme: () => ({
    colors: {
      backgroundOutlinedDefault: '#fdfdfd',
      backgroundOutlinedDisabled: '#eee',
      backgroundSecondary: '#fafafa',
      borderOutlinedDefault: '#ccc',
      borderOutlinedDisabled: '#ddd',
      borderOutlinedError: '#f00',
      borderOutlinedFocus: '#08c',
      iconPrimary: '#00f',
      textDisabled: '#aaa',
      textNegative: '#c00',
      textOutlinedDefault: '#111',
      textPlaceholder: '#999',
      textPrimary: '#000',
      textSecondary: '#666',
    },
    spacing: { xxsmall: 2, xsmall: 4, small: 8, medium: 12, large: 16, xlarge: 20, xxlarge: 24 },
    radii: { small: 4, medium: 8, large: 12 },
    sizes: { small: 16, medium: 20, large: 24, xlarge: 32, xxlarge: 40, xxxlarge: 56, base: 4 },
    widths: { default: 1, focus: 2, selected: 2, error: 2 },
    typography: {
      fontFamily: 'system',
      bodySmall: { fontFamily: 'system', fontSize: 12, fontWeight: '400', letterSpacing: 0, lineHeight: 16 },
      error: { fontFamily: 'system', fontSize: 12, fontWeight: '400', letterSpacing: 0, lineHeight: 16 },
      bodyLarge: { fontFamily: 'system', fontSize: 16, fontWeight: '400', letterSpacing: 0, lineHeight: 20 },
    },
  }),
}));

jest.mock('../../Components/internal/localization', () => ({
  usePrimerLocalization: () => ({ t: (key: string) => key, locale: 'en' }),
}));

jest.mock('../../Components/internal/navigation/useNavigation', () => ({
  useNavigation: () => ({ pop: jest.fn(), canGoBack: true, isAnimating: false }),
}));

jest.mock('../../Components/internal/navigation/useRoute', () => ({
  useRoute: () => ({ params: {} }),
}));

jest.mock('../../Components/internal/checkout-flow/CheckoutFlowContext', () => ({
  useCheckoutFlow: () => ({ onCancel: jest.fn() }),
}));

jest.mock('../../Components/hooks/usePrimerBillingAddressForm', () => ({
  usePrimerBillingAddressForm: () => ({ updateCountryCode: jest.fn() }),
}));

jest.mock('../../Components/internal/navigation/NavigationHeader', () => ({ NavigationHeader: () => null }));

import { CountrySelectorScreen } from '../../Components/internal/screens/CountrySelectorScreen';

// Mount inside act, then read the tree after commit (accessing `.root` mid-act throws "unmounted").
function render() {
  let instance: any;
  act(() => {
    instance = renderer.create(createElement(CountrySelectorScreen));
  });
  return instance;
}

const searchInput = (root: any) => root.find((n: any) => n.type === 'TextInput');
const byTestID = (root: any, testID: string) =>
  root.find((n: any) => n.props.testID === testID && typeof n.type === 'string');

// The bordered row the text sits in, as the native side receives it.
function hostParentOf(node: any, type: string): any {
  for (const child of node.children ?? []) {
    if (typeof child !== 'object') continue;
    if (child.type === type) return node;
    const found = hostParentOf(child, type);
    if (found) return found;
  }
  return null;
}

describe('CountrySelectorScreen search field (Figma 1152-65739)', () => {
  it('draws the search icon inside the field, before the text, in the icon colour', () => {
    const tree = render();
    const icon = byTestID(tree.root, 'primer-country-selector-search-icon');
    const field = hostParentOf(tree.toJSON(), 'TextInput');

    expect(icon.props.style.tintColor).toBe('#00f');
    expect(field.children.map((child: any) => child.type)).toEqual(['Image', 'TextInput']);
    expect(field.children[0].props.testID).toBe('primer-country-selector-search-icon');
  });

  it('draws the clear cross in the icon colour once there is a query', () => {
    const root = render().root;

    act(() => {
      searchInput(root).props.onChangeText('ger');
    });

    const cross = byTestID(root, 'primer-country-selector-clear').find((n: any) => n.type === 'Text');
    expect(cross.props.style.color).toBe('#00f');
  });
});
