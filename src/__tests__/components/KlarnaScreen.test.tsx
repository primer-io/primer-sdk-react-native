// @ts-expect-error -- React 19 concurrent act environment
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

import { createElement } from 'react';
// @ts-expect-error -- react-test-renderer has no types for React 19
import renderer, { act } from 'react-test-renderer';

const mockSelectCategory = jest.fn();
let mockKlarna: Record<string, unknown> = {};
jest.mock('../../Components/hooks/usePrimerPaymentMethod', () => ({
  usePrimerPaymentMethod: () => mockKlarna,
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

const KLARNA_BADGE = require('../../Components/internal/screens/assets/klarna-badge.png');

function klarnaState(overrides: Record<string, unknown> = {}) {
  return {
    kind: 'klarna',
    start: jest.fn(),
    paymentCategories: [
      { identifier: 'pay_later', name: 'Pay later', descriptiveAssetUrl: '', standardAssetUrl: '' },
      { identifier: 'pay_now', name: 'Pay in full today', descriptiveAssetUrl: '', standardAssetUrl: '' },
    ],
    selectedCategoryId: null,
    isViewLoaded: false,
    isLoading: false,
    selectCategory: mockSelectCategory,
    authorize: jest.fn(),
    ...overrides,
  };
}

const mounted: any[] = [];

function render(overrides: Record<string, unknown> = {}) {
  mockKlarna = klarnaState(overrides);
  let tree: any;
  act(() => {
    tree = renderer.create(createElement(KlarnaScreen));
  });
  mounted.push(tree);
  const rows = () =>
    tree.root.findAll((n: any) => n.type === 'TouchableOpacity' && n.props.accessibilityRole === 'radio');
  const row = (name: string) => rows().find((r: any) => texts(r).includes(name));
  const button = () => tree.root.findByType('PrimerButton');
  const klarnaViews = () => ofType(tree.root, 'PrimerKlarnaPaymentView');
  const klarnaStyle = () => flatten(klarnaViews()[0].props.style);
  const reportHeight = (height: number) =>
    act(() => klarnaViews()[0].props.onContentHeightChange({ nativeEvent: { height } }));
  const update = (next: Record<string, unknown>) => {
    mockKlarna = klarnaState(next);
    act(() => tree.update(createElement(KlarnaScreen)));
  };
  return { tree, rows, row, button, klarnaViews, klarnaStyle, reportHeight, update };
}

function flatten(style: unknown): Record<string, unknown> {
  return Array.isArray(style) ? Object.assign({}, ...style.map(flatten)) : ((style ?? {}) as Record<string, unknown>);
}

function ofType(node: any, type: string): any[] {
  return node.findAll((n: any) => n.type === type);
}

function texts(node: any): string[] {
  return ofType(node, 'Text').map((n: any) => n.props.children);
}

beforeEach(() => {
  mockSelectCategory.mockClear();
});

afterEach(() => {
  act(() => mounted.splice(0).forEach((tree) => tree.unmount()));
  jest.useRealTimers();
});

describe('KlarnaScreen — header', () => {
  it('titles the screen "Klarna" in the middle of the back row, like the native SDKs', () => {
    const { tree } = render();

    expect(tree.root.findByType('NavigationHeader').props.title).toBe('primer_vault_default_klarna');
    expect(tree.root.findByType('NavigationHeader').props.titleAlignment).toBe('center');
  });
});

describe('KlarnaScreen — option list', () => {
  it('shows each option as the Klarna badge and its name, with no radio and no description line', () => {
    const { tree, rows } = render();

    expect(rows()).toHaveLength(2);
    for (const r of rows()) {
      const [badge] = ofType(r, 'Image');
      expect(ofType(r, 'Image')).toHaveLength(1);
      expect(badge.props.source).toBe(KLARNA_BADGE);
      expect(flatten(badge.props.style)).toEqual({ height: 24, width: 56 });
      expect(badge.props.importantForAccessibility).toBe('no-hide-descendants');
      expect(badge.props.accessibilityElementsHidden).toBe(true);
      expect(r.props.accessibilityState).toEqual({ checked: false });
      expect(ofType(r, 'ActivityIndicator')).toHaveLength(0);
    }
    expect(rows().map((r: any) => texts(r))).toEqual([['Pay later'], ['Pay in full today']]);
    expect(texts(tree.root)).not.toContain('primer_klarna_select_category_description');
  });

  it('selects an option on tap, and ignores a tap on the option already loaded', () => {
    const { row } = render({ selectedCategoryId: 'pay_later', isViewLoaded: true });

    expect(row('Pay later').props.accessibilityState).toEqual({ checked: true });
    act(() => row('Pay later').props.onPress());
    expect(mockSelectCategory).not.toHaveBeenCalled();

    act(() => row('Pay in full today').props.onPress());
    expect(mockSelectCategory).toHaveBeenCalledWith('pay_now');
  });

  it('retries an option still loading only 3 s after it was asked for, so a double tap starts one load', () => {
    jest.useFakeTimers();
    const { row, update } = render();
    act(() => row('Pay later').props.onPress());
    update({ selectedCategoryId: 'pay_later' });
    expect(mockSelectCategory).toHaveBeenCalledTimes(1);

    act(() => row('Pay later').props.onPress());
    act(() => jest.advanceTimersByTime(2999));
    act(() => row('Pay later').props.onPress());
    expect(mockSelectCategory).toHaveBeenCalledTimes(1);

    act(() => jest.advanceTimersByTime(1));
    act(() => row('Pay later').props.onPress());
    expect(mockSelectCategory).toHaveBeenCalledTimes(2);
    expect(mockSelectCategory).toHaveBeenLastCalledWith('pay_later');

    act(() => row('Pay later').props.onPress());
    expect(mockSelectCategory).toHaveBeenCalledTimes(2);
  });

  it('while the chosen option loads: a spinner in its row, no Klarna view, Continue disabled without a spinner', () => {
    const { row, button, klarnaViews } = render({ selectedCategoryId: 'pay_later' });

    expect(ofType(row('Pay later'), 'ActivityIndicator')).toHaveLength(1);
    expect(ofType(row('Pay later'), 'Image')).toHaveLength(1);
    expect(ofType(row('Pay in full today'), 'ActivityIndicator')).toHaveLength(0);
    expect(klarnaViews()).toHaveLength(0);
    expect(button().props.title).toBe('primer_klarna_button_authorize');
    expect(button().props.disabled).toBe(true);
    expect(button().props.loading).toBe(false);
  });

  it("once loaded, Klarna's view mounts collapsed inside that option's card, outside its touchable", () => {
    const { row, button, klarnaViews, klarnaStyle } = render({ selectedCategoryId: 'pay_later', isViewLoaded: true });

    expect(klarnaViews()).toHaveLength(1);
    const card = klarnaViews()[0].parent;
    const cardRow = ofType(card, 'TouchableOpacity');
    expect(cardRow).toHaveLength(1);
    expect(cardRow[0]).toBe(row('Pay later'));
    expect(ofType(cardRow[0], 'PrimerKlarnaPaymentView')).toHaveLength(0);

    expect(klarnaStyle()).toMatchObject({ height: 0, width: '100%' });
    expect(klarnaStyle().marginTop).toBeUndefined();
    expect(ofType(row('Pay later'), 'ActivityIndicator')).toHaveLength(1);
    expect(ofType(row('Pay later'), 'Image')).toHaveLength(1);
    expect(button().props.disabled).toBe(true);
  });

  it('expands to the height Klarna reports, rounded up, and follows it when it changes', () => {
    const { row, button, klarnaStyle, reportHeight } = render({ selectedCategoryId: 'pay_later', isViewLoaded: true });

    reportHeight(52.95);
    expect(klarnaStyle()).toMatchObject({ height: 53, marginTop: 12 });
    expect(ofType(row('Pay later'), 'ActivityIndicator')).toHaveLength(0);
    expect(ofType(row('Pay later'), 'Image')).toHaveLength(2);
    expect(ofType(row('Pay in full today'), 'Image')).toHaveLength(1);
    expect(button().props.disabled).toBe(false);
    expect(button().props.loading).toBe(false);

    reportHeight(86);
    expect(klarnaStyle().height).toBe(86);
    reportHeight(0);
    expect(klarnaStyle().height).toBe(86);
  });

  it('starts collapsed again for the next option or a reload, never with the previous height', () => {
    const { row, klarnaViews, klarnaStyle, reportHeight, update } = render({
      selectedCategoryId: 'pay_later',
      isViewLoaded: true,
    });
    reportHeight(86);

    update({ selectedCategoryId: 'pay_now' });
    expect(klarnaViews()).toHaveLength(0);
    update({ selectedCategoryId: 'pay_now', isViewLoaded: true });
    expect(klarnaStyle().height).toBe(0);
    expect(ofType(row('Pay in full today'), 'ActivityIndicator')).toHaveLength(1);
    reportHeight(53);
    expect(klarnaStyle().height).toBe(53);

    update({ selectedCategoryId: 'pay_now' });
    update({ selectedCategoryId: 'pay_now', isViewLoaded: true });
    expect(klarnaStyle().height).toBe(0);
  });

  it('falls back to a fixed 250 when Klarna reports no height within 1.5 s, until it does', () => {
    jest.useFakeTimers();
    const { row, button, klarnaStyle, reportHeight } = render({ selectedCategoryId: 'pay_later', isViewLoaded: true });

    act(() => jest.advanceTimersByTime(1499));
    expect(klarnaStyle().height).toBe(0);
    act(() => jest.advanceTimersByTime(1));
    expect(klarnaStyle()).toMatchObject({ height: 250, marginTop: 12 });
    expect(ofType(row('Pay later'), 'ActivityIndicator')).toHaveLength(0);
    expect(button().props.disabled).toBe(false);

    reportHeight(53);
    expect(klarnaStyle().height).toBe(53);
  });

  it('keeps a reported height when the 1.5 s fallback comes due', () => {
    jest.useFakeTimers();
    const { klarnaStyle, reportHeight } = render({ selectedCategoryId: 'pay_later', isViewLoaded: true });

    reportHeight(52.95);
    act(() => jest.advanceTimersByTime(1500));
    expect(klarnaStyle().height).toBe(53);
  });

  it('spins Continue only while an authorize is in flight', () => {
    const { button } = render({ selectedCategoryId: 'pay_later', isViewLoaded: true, isLoading: true });

    expect(button().props.loading).toBe(true);
  });
});
