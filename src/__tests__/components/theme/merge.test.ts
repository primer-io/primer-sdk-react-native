import { mergeTokens } from '../../../Components/internal/theme/merge';
import { defaultLightTokens } from '../../../Components/internal/theme/tokens';

const base = defaultLightTokens;

describe('mergeTokens', () => {
  it.each([undefined, null])('returns base unchanged (referential equality) when override is %p', (override) => {
    expect(mergeTokens(base, override as any)).toBe(base);
  });

  it('applies partial colors override — only specified fields change', () => {
    const result = mergeTokens(base, { colors: { brand: '#ff0000' } });
    expect(result.colors.brand).toBe('#ff0000');
    expect(result.colors.backgroundPrimary).toBe(base.colors.backgroundPrimary);
    expect(result.colors.textPrimary).toBe(base.colors.textPrimary);
  });

  it('falls back to base value when override color field is null', () => {
    const result = mergeTokens(base, { colors: { brand: null as any } });
    expect(result.colors.brand).toBe(base.colors.brand);
  });

  it('applies overrides across all five categories simultaneously', () => {
    const result = mergeTokens(base, {
      colors: { brand: '#aabbcc' },
      spacing: { large: 20 },
      typography: { fontFamily: 'Roboto' },
      radii: { medium: 10 },
      sizes: { small: 16, medium: 20, large: 24, xlarge: 32, xxlarge: 40, xxxlarge: 56 },
      widths: { focus: 3 },
    });

    expect(result.colors.brand).toBe('#aabbcc');
    expect(result.colors.backgroundPrimary).toBe(base.colors.backgroundPrimary);
    expect(result.spacing.large).toBe(20);
    expect(result.spacing.small).toBe(base.spacing.small);
    expect(result.typography.fontFamily).toBe('Roboto');
    expect(result.typography.titleXlarge).toEqual({ ...base.typography.titleXlarge, fontFamily: 'Roboto' });
    expect(result.radii.medium).toBe(10);
    expect(result.radii.small).toBe(base.radii.small);
    expect(result.widths.focus).toBe(3);
    expect(result.widths.default).toBe(base.widths.default);
  });

  it('moves every colour built on the brand, the background or the text when that one is overridden', () => {
    const result = mergeTokens(base, { colors: { brand: '#123456' } });

    expect(result.colors.focus).toBe('#123456');
    expect(result.colors.loader).toBe('#123456');
    expect(result.colors.borderOutlinedSelected).toBe('#123456');

    const background = mergeTokens(base, { colors: { backgroundPrimary: '#101010' } });

    expect(background.colors.backgroundPrimary).toBe('#101010');
    expect(background.colors.backgroundOutlinedDefault).toBe('#101010');
    expect(background.colors.onBrand).toBe('#101010');

    const text = mergeTokens(base, { colors: { textPrimary: '#fafafa' } });

    expect(text.colors.textPrimary).toBe('#fafafa');
    expect(text.colors.textOutlinedDefault).toBe('#fafafa');
  });

  it('carries a brand override two hops, through focus into the field border', () => {
    const result = mergeTokens(base, { colors: { brand: '#0b0b0b' } });

    expect(result.colors.focus).toBe('#0b0b0b');
    expect(result.colors.borderOutlinedFocus).toBe('#0b0b0b');
  });

  it('lets an explicit colour win over the brand it derives from', () => {
    const result = mergeTokens(base, { colors: { brand: '#123456', focus: '#654321' } });

    expect(result.colors.focus).toBe('#654321');
  });
});

describe('brand font', () => {
  const STYLES = ['titleXlarge', 'titleLarge', 'bodyLarge', 'bodyMedium', 'bodySmall', 'error'] as const;

  it('moves every style the merchant left alone to the brand font', () => {
    const result = mergeTokens(base, { typography: { fontFamily: 'Roboto' } });

    expect(result.typography.fontFamily).toBe('Roboto');
    for (const style of STYLES) {
      expect(result.typography[style]).toEqual({ ...base.typography[style], fontFamily: 'Roboto' });
    }
  });

  it("lets a style's own font win over the brand font", () => {
    const result = mergeTokens(base, {
      typography: { fontFamily: 'Roboto', error: { ...base.typography.error, fontFamily: 'Menlo' } },
    });

    expect(result.typography.error.fontFamily).toBe('Menlo');
    expect(result.typography.bodySmall.fontFamily).toBe('Roboto');
  });

  it('changes one typography field and leaves the rest alone', () => {
    const result = mergeTokens(base, { typography: { bodyLarge: { fontSize: 18 } } });

    expect(result.typography.bodyLarge).toEqual({ ...base.typography.bodyLarge, fontSize: 18 });
    expect(result.typography.bodyMedium).toEqual(base.typography.bodyMedium);
  });

  it('lets a one-field override still pick up a new brand font', () => {
    const result = mergeTokens(base, { typography: { fontFamily: 'Roboto', bodyLarge: { fontSize: 18 } } });

    expect(result.typography.bodyLarge.fontSize).toBe(18);
    expect(result.typography.bodyLarge.fontFamily).toBe('Roboto');
    expect(result.typography.bodyLarge.lineHeight).toBe(base.typography.bodyLarge.lineHeight);
  });

  it('keeps a style own font when only a metric is overridden', () => {
    const withOwnFont = mergeTokens(base, { typography: { bodyLarge: { fontFamily: 'Menlo' } } });
    const result = mergeTokens(withOwnFont, {
      typography: { fontFamily: 'Roboto', bodyLarge: { fontSize: 22 } },
    });

    expect(result.typography.bodyLarge.fontFamily).toBe('Menlo');
    expect(result.typography.bodyLarge.fontSize).toBe(22);
  });
});

describe('error typography follows bodySmall', () => {
  it('carries a bodySmall change onto the error text', () => {
    const result = mergeTokens(base, { typography: { bodySmall: { fontSize: 14, lineHeight: 18 } } });

    expect(result.typography.bodySmall.fontSize).toBe(14);
    expect(result.typography.error.fontSize).toBe(14);
    expect(result.typography.error.lineHeight).toBe(18);
  });

  it('is per field, so error keeps inheriting what it did not override', () => {
    const result = mergeTokens(base, {
      typography: { bodySmall: { fontSize: 14, lineHeight: 18 }, error: { fontSize: 10 } },
    });

    expect(result.typography.error.fontSize).toBe(10);
    expect(result.typography.error.lineHeight).toBe(18);
  });

  it('leaves error alone when only the error style moves', () => {
    const result = mergeTokens(base, { typography: { error: { fontSize: 10 } } });

    expect(result.typography.bodySmall.fontSize).toBe(base.typography.bodySmall.fontSize);
    expect(result.typography.error.fontSize).toBe(10);
  });
});

describe('non-finite theme numbers', () => {
  const WARNING = '[PrimerCheckoutTheme] A NaN or infinite theme number is ignored.';
  const BAD_VALUES = [NaN, Infinity];
  let warn: jest.SpyInstance;

  beforeEach(() => {
    warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    warn.mockRestore();
  });

  const poison = (tokens: object, bad: number) => Object.fromEntries(Object.keys(tokens).map((key) => [key, bad]));

  it.each(BAD_VALUES)('ignores %p in spacing, radii, sizes, widths and typography and keeps the defaults', (bad) => {
    const result = mergeTokens(base, {
      spacing: poison(base.spacing, bad),
      radii: poison(base.radii, bad),
      sizes: poison(base.sizes, bad),
      widths: poison(base.widths, bad),
    });

    expect(result.spacing).toEqual(base.spacing);
    expect(result.radii).toEqual(base.radii);
    expect(result.sizes).toEqual(base.sizes);
    expect(result.widths).toEqual(base.widths);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(WARNING);

    const style = { fontSize: bad, lineHeight: bad, letterSpacing: bad };
    const typed = mergeTokens(base, {
      typography: {
        titleXlarge: style,
        titleLarge: style,
        bodyLarge: style,
        bodyMedium: style,
        bodySmall: style,
        error: style,
      },
    });

    expect(typed.typography).toEqual(base.typography);
    expect(warn).toHaveBeenCalledTimes(2);
    expect(warn).toHaveBeenLastCalledWith(WARNING);
  });

  it('keeps the finite values set next to a bad one', () => {
    const result = mergeTokens(base, { spacing: { small: NaN, large: 24 } });

    expect(result.spacing.small).toBe(base.spacing.small);
    expect(result.spacing.large).toBe(24);
  });

  it('does not warn for finite numbers or colours', () => {
    mergeTokens(base, { spacing: { small: 0 }, colors: { brand: '#ff0000' } });

    expect(warn).not.toHaveBeenCalled();
  });
});
