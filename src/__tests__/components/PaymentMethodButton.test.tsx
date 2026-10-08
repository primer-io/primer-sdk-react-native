// @ts-expect-error -- React 19 concurrent act environment
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

import { createElement } from 'react';
// @ts-expect-error -- react-test-renderer has no types for React 19
import renderer, { act } from 'react-test-renderer';

import { PaymentMethodButton } from '../../Components/internal/ui/PaymentMethodButton';
import { splitKlarnaLabel } from '../../Components/internal/klarnaLabel';
import { resolveLocale } from '../../Components/internal/localization/locale-resolver';
import { translate } from '../../Components/internal/localization/translate';
import type { TranslationParams } from '../../Components/internal/localization/types';
import { ThemeContext, type PrimerColorScheme } from '../../Components/internal/theme/ThemeContext';
import { defaultDarkTokens, defaultLightTokens } from '../../Components/internal/theme/tokens';
import type { PrimerTokens } from '../../Components/internal/theme';
import type { PaymentMethodItem } from '../../Components/types/PaymentMethodTypes';
import type { IPrimerAsset } from '../../models/PrimerPaymentMethodResource';

const rnMock = require('react-native');
const creditCardIcon = require('../../Components/internal/screens/assets/credit-card.png');
const klarnaWordmark = require('../../Components/internal/screens/assets/klarna-wordmark.png');

// The button translates for the host's locale, so the expected text does too.
const { locale } = resolveLocale();
const tr = (key: string, params?: TranslationParams) => translate(key, locale, params);

// react-test-renderer instance — typed loosely because the package ships no React 19 types.
type Props = Record<string, any>;
type TestInstance = {
  type: unknown;
  props: Props;
  children: TestInstance[];
  findAllByType: (type: string) => TestInstance[];
  findByType: (type: string) => TestInstance;
};

const LOGOS = { colored: 'file:///colored.png', light: 'file:///light.png', dark: 'file:///dark.png' };

function makeItem(type: string, overrides: Partial<PaymentMethodItem> = {}): PaymentMethodItem {
  return {
    type,
    name: type,
    categories: ['NATIVE_UI'],
    intents: ['CHECKOUT'],
    paymentMethod: {
      paymentMethodType: type,
      paymentMethodManagerCategories: ['NATIVE_UI'],
      supportedPrimerSessionIntents: ['CHECKOUT'],
    },
    ...overrides,
  };
}

function withAssets(
  type: string,
  name: string,
  logo: IPrimerAsset,
  background: IPrimerAsset,
  overrides: Partial<PaymentMethodItem> = {}
): PaymentMethodItem {
  return makeItem(type, {
    name,
    resource: {
      paymentMethodType: type,
      paymentMethodName: name,
      paymentMethodLogo: logo,
      paymentMethodBackgroundColor: background,
    },
    ...overrides,
  });
}

interface RenderOptions {
  scheme?: PrimerColorScheme;
  tokens?: PrimerTokens;
  onPress?: () => void;
}

function render(item: PaymentMethodItem, { scheme = 'light', tokens, onPress = jest.fn() }: RenderOptions = {}) {
  const value = { scheme, tokens: tokens ?? (scheme === 'dark' ? defaultDarkTokens : defaultLightTokens) };
  let tree: { root: TestInstance } | undefined;
  act(() => {
    tree = renderer.create(
      createElement(ThemeContext.Provider, { value }, createElement(PaymentMethodButton, { item, onPress }))
    );
  });
  return tree!.root;
}

const flat = (style: unknown): Props => Object.assign({}, ...[style].flat(Infinity).filter(Boolean));
const row = (root: TestInstance) => root.findByType('TouchableOpacity');
const rowStyle = (root: TestInstance) => flat(row(root).props.style);
const texts = (root: TestInstance) => root.findAllByType('Text');

afterEach(() => {
  rnMock.Platform.OS = 'ios';
  rnMock.useColorScheme.mockReturnValue('light');
});

describe('PaymentMethodButton — partner', () => {
  it.each([
    ['light', '#f0f0f0', LOGOS.light],
    ['dark', '#101010', LOGOS.dark],
  ] as const)('fills with the %s background, no outline, and draws the matching logo', (scheme, fill, logo) => {
    const root = render(withAssets('PAYPAL', 'PayPal', LOGOS, { light: '#f0f0f0', dark: '#101010' }), { scheme });

    expect(rowStyle(root)).toMatchObject({ backgroundColor: fill });
    expect(rowStyle(root).borderWidth).toBeUndefined();
    const image = root.findByType('Image');
    expect(image.props.source).toEqual({ uri: logo });
    expect(image.props.resizeMode).toBe('contain');
    expect(flat(image.props.style)).toEqual({ height: 26, width: '100%' });
    expect(texts(root)).toHaveLength(0);
  });

  it('takes the sheet colour when the backend has no background', () => {
    const root = render(withAssets('PAYPAL', 'PayPal', { light: LOGOS.light }, {}));
    expect(rowStyle(root).backgroundColor).toBe(defaultLightTokens.colors.backgroundPrimary);
    expect(root.findByType('Image').props.source).toEqual({ uri: LOGOS.light });
  });

  it('shows the name in titleLarge when there is no logo', () => {
    const root = render(withAssets('ACME_PAY', 'Acme Pay', {}, {}));
    const { titleLarge } = defaultLightTokens.typography;

    expect(root.findAllByType('Image')).toHaveLength(0);
    const [name] = texts(root);
    expect(name!.props.children).toBe('Acme Pay');
    expect(flat(name!.props.style)).toMatchObject({
      color: defaultLightTokens.colors.textPrimary,
      fontSize: titleLarge.fontSize,
      fontWeight: titleLarge.fontWeight,
      lineHeight: titleLarge.lineHeight,
    });
  });

  it('keeps a merchant-supplied logo and colour when the item has no backend assets', () => {
    const root = render(makeItem('PAYPAL', { logo: 'file:///merchant.png', backgroundColor: '#123123' }));
    expect(rowStyle(root).backgroundColor).toBe('#123123');
    expect(root.findByType('Image').props.source).toEqual({ uri: 'file:///merchant.png' });
  });

  it('is a button labelled with the method name, and calls onPress', () => {
    const onPress = jest.fn();
    const root = render(withAssets('PAYPAL', 'PayPal', LOGOS, { colored: '#ffc439' }), { onPress });

    expect(row(root).props.accessibilityRole).toBe('button');
    expect(row(root).props.accessibilityLabel).toBe(
      tr('accessibility_screen_payment_method', { paymentMethodName: 'PayPal' })
    );
    act(() => row(root).props.onPress());
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('shows a flat surcharge in white on a backend fill and in textSecondary on the sheet colour', () => {
    const surcharge = { kind: 'flat', amount: 50 } as const;
    const onBrand = render(withAssets('PAYPAL', 'PayPal', LOGOS, { colored: '#ffc439' }, { surcharge }));
    const [onBrandLabel] = texts(onBrand);
    expect(onBrandLabel!.props.children).toBe('+50');
    expect(flat(onBrandLabel!.props.style)).toMatchObject({ color: '#ffffff', opacity: 0.8 });

    const onSheet = render(withAssets('PAYPAL', 'PayPal', LOGOS, {}, { surcharge }));
    const [onSheetLabel] = texts(onSheet);
    expect(flat(onSheetLabel!.props.style).color).toBe(defaultLightTokens.colors.textSecondary);
  });

  it('reads the flat surcharge after the method name', () => {
    const root = render(
      withAssets('PAYPAL', 'PayPal', LOGOS, { colored: '#ffc439' }, { surcharge: { kind: 'flat', amount: 50 } })
    );

    expect(row(root).props.accessibilityLabel).toBe(
      `${tr('accessibility_screen_payment_method', { paymentMethodName: 'PayPal' })}, +50`
    );
  });

  it('lets the name shrink so large text wraps instead of being cut off', () => {
    const root = render(withAssets('PAYPAL', 'PayPal', {}, { colored: '#ffc439' }));
    const [name] = texts(root);

    expect(flat(name!.props.style).flexShrink).toBe(1);
  });
});

describe('PaymentMethodButton — Google Pay', () => {
  it('keeps the SDK button and labels the row', () => {
    const root = render(makeItem('GOOGLE_PAY', { name: 'Google Pay', nativeViewName: 'PrimerGooglePayButton' }));

    expect(root.findAllByType('PrimerGooglePayButton')).toHaveLength(1);
    expect(row(root).props.accessibilityRole).toBe('button');
    expect(row(root).props.accessibilityLabel).toBe(
      tr('accessibility_screen_payment_method', { paymentMethodName: 'Google Pay' })
    );
  });
});

describe('PaymentMethodButton — card', () => {
  const tokens: PrimerTokens = {
    ...defaultLightTokens,
    colors: { ...defaultLightTokens.colors, backgroundOutlinedDefault: '#123456' },
  };
  const card = withAssets('PAYMENT_CARD', 'Card', { colored: 'file:///backend-card.png' }, { colored: '#000000' });

  it('fills with backgroundOutlinedDefault inside the default border', () => {
    expect(rowStyle(render(card, { tokens }))).toMatchObject({
      backgroundColor: '#123456',
      borderColor: tokens.colors.borderOutlinedDefault,
      borderWidth: tokens.widths.default,
    });
  });

  it('draws the bundled glyph tinted iconPrimary, not the backend logo', () => {
    const image = render(card, { tokens }).findByType('Image');
    expect(image.props.source).toBe(creditCardIcon);
    expect(flat(image.props.style)).toMatchObject({
      height: tokens.sizes.medium,
      tintColor: tokens.colors.iconPrimary,
      width: tokens.sizes.medium,
    });
  });

  it('reads "Pay with card" and is labelled as such', () => {
    const root = render(card, { tokens });
    expect(texts(root).map((t) => t.props.children)).toEqual([tr('primer_card_form_title')]);
    expect(row(root).props.accessibilityRole).toBe('button');
    expect(row(root).props.accessibilityLabel).toBe(tr('accessibility_payment_selection_pay_with_card'));
  });

  it('shows a flat surcharge in textSecondary', () => {
    const root = render({ ...card, surcharge: { kind: 'flat', amount: 50 } }, { tokens });
    const surcharge = texts(root).find((t) => t.props.children === '+50');
    expect(flat(surcharge!.props.style).color).toBe(tokens.colors.textSecondary);
  });
});

describe('PaymentMethodButton — Klarna', () => {
  const klarna = withAssets('KLARNA', 'Klarna', { colored: 'file:///backend-klarna.png' }, { colored: '#ffb3c7' });

  const label = tr('accessibility_payment_selection_pay_with_klarna');
  const { before, after } = splitKlarnaLabel(label);
  const words = [before, after].filter((word) => word != null);

  it.each(['light', 'dark'] as const)('draws "Pay with Klarna" with the pink badge on Klarna black (%s)', (scheme) => {
    const root = render(klarna, { scheme });
    const tokens = scheme === 'dark' ? defaultDarkTokens : defaultLightTokens;

    expect(rowStyle(root).backgroundColor).toBe('#0b051d');
    expect(words.length).toBeGreaterThan(0);
    expect(texts(root).map((text) => text.props.children)).toEqual(words);
    texts(root).forEach((text) => expect(flat(text.props.style).color).toBe('#ffffff'));
    expect(flat(root.findByType('View').props.style)).toEqual({
      backgroundColor: '#ffa8cd',
      borderRadius: tokens.radii.medium,
      padding: tokens.spacing.small,
    });
    const wordmark = root.findByType('Image');
    expect(wordmark.props.source).toBe(klarnaWordmark);
    expect(flat(wordmark.props.style).tintColor).toBe('#0b051d');
    expect(row(root).props.accessibilityLabel).toBe(label);
  });

  // Turkish puts the word first, German in the middle; the badge takes its place in each.
  it.each([
    ['tr', ['View', 'Text'], [{ marginLeft: defaultLightTokens.spacing.small }]],
    [
      'de',
      ['Text', 'View', 'Text'],
      [{ marginRight: defaultLightTokens.spacing.small }, { marginLeft: defaultLightTokens.spacing.small }],
    ],
  ])('puts the badge where %s puts the word', (deviceLocale, order, margins) => {
    const localeLabel = translate('accessibility_payment_selection_pay_with_klarna', deviceLocale);
    const pieces = splitKlarnaLabel(localeLabel);
    const dateTimeFormat = jest
      .spyOn(Intl, 'DateTimeFormat')
      .mockImplementation(() => ({ resolvedOptions: () => ({ locale: deviceLocale }) }) as Intl.DateTimeFormat);
    let root: TestInstance;
    try {
      root = render(klarna);
    } finally {
      dateTimeFormat.mockRestore();
    }

    expect(row(root).children.map((child) => child.type)).toEqual(order.map((name) => rnMock[name]));
    expect(texts(root).map((text) => text.props.children)).toEqual(
      [pieces.before, pieces.after].filter((word) => word != null)
    );
    texts(root).forEach((text, i) => expect(flat(text.props.style)).toMatchObject(margins[i]!));
    expect(row(root).props.accessibilityLabel).toBe(localeLabel);
  });

  it('shows a flat surcharge in white on the black, and reads it after the label', () => {
    const root = render({ ...klarna, surcharge: { kind: 'flat', amount: 50 } });
    const surcharge = texts(root).find((t) => t.props.children === '+50');
    expect(flat(surcharge!.props.style)).toMatchObject({ color: '#ffffff', opacity: 0.8 });
    expect(row(root).props.accessibilityLabel).toBe(`${label}, +50`);
  });

  it('lets the words shrink so large text wraps instead of being cut off', () => {
    texts(render(klarna)).forEach((text) => expect(flat(text.props.style).flexShrink).toBe(1));
  });
});

describe('PaymentMethodButton — Apple Pay', () => {
  const applePay = withAssets('APPLE_PAY', 'Apple Pay', LOGOS, { light: '#ffffff', dark: '#000000' });

  it("draws PassKit's button in the list's scheme with medium corners", () => {
    const root = render(applePay);
    expect(root.findByType('PrimerApplePayButton').props).toMatchObject({ colorScheme: 'light', cornerRadius: 8 });
    expect(root.findAllByType('Image')).toHaveLength(0);
    expect(row(root).props.accessibilityRole).toBe('button');
    expect(row(root).props.accessibilityLabel).toBe(
      tr('accessibility_screen_payment_method', { paymentMethodName: 'Apple Pay' })
    );
  });

  it.each([
    ['dark', 'light'],
    ['light', 'dark'],
  ] as const)('follows the SDK scheme %s over the phone %s', (scheme, phone) => {
    rnMock.useColorScheme.mockReturnValue(phone);
    expect(render(applePay, { scheme }).findByType('PrimerApplePayButton').props.colorScheme).toBe(scheme);
  });

  it('takes the corner radius from the theme', () => {
    const tokens = { ...defaultLightTokens, radii: { ...defaultLightTokens.radii, medium: 16 } };
    expect(render(applePay, { tokens }).findByType('PrimerApplePayButton').props.cornerRadius).toBe(16);
  });

  it('starts the method from the row and shows no surcharge', () => {
    const onPress = jest.fn();
    const root = render({ ...applePay, surcharge: { kind: 'flat', amount: 50 } }, { onPress });
    act(() => row(root).props.onPress());
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(texts(root)).toHaveLength(0);
  });

  it('never renders the native view on Android', () => {
    rnMock.Platform.OS = 'android';
    const root = render(applePay);
    expect(root.findAllByType('PrimerApplePayButton')).toHaveLength(0);
    expect(root.findByType('Image').props.source).toEqual({ uri: LOGOS.light });
  });
});

describe('PaymentMethodButton — height', () => {
  it.each([
    ['card', makeItem('PAYMENT_CARD')],
    ['Klarna', makeItem('KLARNA')],
    ['partner logo', withAssets('PAYPAL', 'PayPal', LOGOS, { colored: '#ffc439' })],
    ['partner name', withAssets('ACME_PAY', 'Acme Pay', {}, {})],
  ])('lets the %s button grow from 44 with large text', (_, item) => {
    expect(rowStyle(render(item))).toMatchObject({ minHeight: 44, paddingVertical: defaultLightTokens.spacing.small });
    expect(rowStyle(render(item)).height).toBeUndefined();
  });

  it.each([
    ['Apple Pay', withAssets('APPLE_PAY', 'Apple Pay', LOGOS, {})],
    ['Google Pay', makeItem('GOOGLE_PAY', { nativeViewName: 'PrimerGooglePayButton' })],
  ])('keeps the native %s button at 44', (_, item) => {
    expect(rowStyle(render(item)).height).toBe(44);
  });
});
