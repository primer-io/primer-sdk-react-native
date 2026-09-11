import { mergeTokens } from '../../../Components/internal/theme/merge';
import { defaultDarkTokens, defaultLightTokens } from '../../../Components/internal/theme/tokens';
import type { PrimerTypographyStyle } from '../../../Components/internal/theme/types';

const base = defaultLightTokens;

describe('mergeTokens', () => {
  it('returns base unchanged (referential equality) when override is undefined', () => {
    expect(mergeTokens(base, undefined)).toBe(base);
  });

  it('returns base unchanged (referential equality) when override is null', () => {
    expect(mergeTokens(base, null as any)).toBe(base);
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

  it('applies partial spacing override — only specified fields change', () => {
    const result = mergeTokens(base, { spacing: { large: 24 } });
    expect(result.spacing.large).toBe(24);
    expect(result.spacing.small).toBe(base.spacing.small);
    expect(result.spacing.medium).toBe(base.spacing.medium);
  });

  it('applies a full typography style override', () => {
    const customStyle: PrimerTypographyStyle = {
      fontSize: 28,
      fontWeight: '700',
      lineHeight: 36,
      letterSpacing: -1,
      fontFamily: 'Roboto',
    };
    const result = mergeTokens(base, { typography: { titleXLarge: customStyle } });
    expect(result.typography.titleXLarge).toEqual(customStyle);
    expect(result.typography.titleLarge).toEqual(base.typography.titleLarge);
  });

  it('applies overrides across all five categories simultaneously', () => {
    const result = mergeTokens(base, {
      colors: { brand: '#aabbcc' },
      spacing: { large: 20 },
      typography: { fontFamily: 'Roboto' },
      radii: { medium: 10 },
      sizes: { small: 16, medium: 20, large: 24, xlarge: 32, xxlarge: 40, xxxlarge: 56, base: 4 },
      widths: { focus: 3 },
    });

    expect(result.colors.brand).toBe('#aabbcc');
    expect(result.colors.backgroundPrimary).toBe(base.colors.backgroundPrimary);
    expect(result.spacing.large).toBe(20);
    expect(result.spacing.small).toBe(base.spacing.small);
    expect(result.typography.fontFamily).toBe('Roboto');
    expect(result.typography.titleXLarge).toEqual({ ...base.typography.titleXLarge, fontFamily: 'Roboto' });
    expect(result.radii.medium).toBe(10);
    expect(result.radii.small).toBe(base.radii.small);
    expect(result.widths.focus).toBe(3);
    expect(result.widths.default).toBe(base.widths.default);
  });

  it('keeps the error text style separate from the body-small label', () => {
    const result = mergeTokens(base, { typography: { error: { ...base.typography.error, fontSize: 20 } } });

    expect(result.typography.error.fontSize).toBe(20);
    expect(result.typography.bodySmall.fontSize).toBe(base.typography.bodySmall.fontSize);
  });

  it('carries the same colour vocabulary as the other SDKs', () => {
    // 39 shared tokens, plus onBrand and overlay which RN needs and the token files do not carry.
    expect(Object.keys(base.colors)).toHaveLength(41);
    expect(base.colors.borderOutlinedFocus).toBe(base.colors.brand);
    expect(base.colors.backgroundOutlinedDefault).toBe(base.colors.backgroundPrimary);
  });

  it('offers no colour named after the palette rather than its job', () => {
    const palette = /^(gray\d{3}|blue\d{3}|green\d{3}|red\d{3})$/;

    expect(Object.keys(base.colors).filter((name) => palette.test(name))).toEqual([]);
  });

  it('exposes size tokens so field height is themable', () => {
    expect(base.sizes).toEqual({ small: 16, medium: 20, large: 24, xlarge: 32, xxlarge: 40, xxxlarge: 56, base: 4 });

    const result = mergeTokens(base, { sizes: { xxlarge: 60 } });
    expect(result.sizes.xxlarge).toBe(60);
    expect(result.sizes.medium).toBe(base.sizes.medium);
  });

  it('names the widths after the field state, matching the other SDKs', () => {
    expect(base.widths).toEqual({ default: 1, focus: 2, selected: 2, error: 2 });
  });

  it('carries a background override into the input fill so inputs keep matching the sheet', () => {
    const result = mergeTokens(base, { colors: { backgroundPrimary: '#101010' } });

    expect(result.colors.backgroundPrimary).toBe('#101010');
    expect(result.colors.backgroundOutlinedDefault).toBe('#101010');
  });

  it('carries a text override into the input text', () => {
    const result = mergeTokens(base, { colors: { textPrimary: '#fafafa' } });

    expect(result.colors.textPrimary).toBe('#fafafa');
    expect(result.colors.textOutlinedDefault).toBe('#fafafa');
  });

  it('lets an explicit input colour win over the one it would inherit', () => {
    const result = mergeTokens(base, {
      colors: { backgroundPrimary: '#101010', backgroundOutlinedDefault: '#202020' },
    });

    expect(result.colors.backgroundPrimary).toBe('#101010');
    expect(result.colors.backgroundOutlinedDefault).toBe('#202020');
  });

  it('leaves the input colours alone when neither is overridden', () => {
    const result = mergeTokens(base, { colors: { brand: '#aabbcc' } });

    expect(result.colors.backgroundOutlinedDefault).toBe(base.colors.backgroundOutlinedDefault);
    expect(result.colors.textOutlinedDefault).toBe(base.colors.textOutlinedDefault);
  });

  it('moves every colour built on the brand when the brand is overridden', () => {
    const result = mergeTokens(base, { colors: { brand: '#123456' } });

    expect(result.colors.focus).toBe('#123456');
    expect(result.colors.loader).toBe('#123456');
    expect(result.colors.borderOutlinedSelected).toBe('#123456');
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

  it('leaves colours built on something else untouched', () => {
    const result = mergeTokens(base, { colors: { brand: '#123456' } });

    expect(result.colors.textPrimary).toBe(base.colors.textPrimary);
    expect(result.colors.backgroundSecondary).toBe(base.colors.backgroundSecondary);
  });
});

describe('brand font', () => {
  const STYLES = ['titleXLarge', 'titleLarge', 'bodyLarge', 'bodyMedium', 'bodySmall', 'error'] as const;

  const withoutFont = ({ fontSize, fontWeight, lineHeight, letterSpacing }: PrimerTypographyStyle) => ({
    fontSize,
    fontWeight,
    lineHeight,
    letterSpacing,
  });

  it('leaves every style on Inter when nothing is set', () => {
    for (const tokens of [defaultLightTokens, defaultDarkTokens]) {
      expect(tokens.typography.fontFamily).toBe('Inter');
      for (const style of STYLES) {
        expect(tokens.typography[style].fontFamily).toBe('Inter');
      }
    }

    expect(mergeTokens(base, { colors: { brand: '#ff0000' } }).typography).toBe(base.typography);
  });

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

  it('gives a style set without a font the brand font', () => {
    const metrics = withoutFont(base.typography.bodyLarge);
    const result = mergeTokens(base, { typography: { fontFamily: 'Roboto', bodyLarge: { ...metrics, fontSize: 18 } } });

    expect(result.typography.bodyLarge).toEqual({ ...metrics, fontSize: 18, fontFamily: 'Roboto' });
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

  it('gives a style set without a font the default font when the brand font is not set', () => {
    const result = mergeTokens(base, { typography: { bodyLarge: withoutFont(base.typography.bodyLarge) } });

    expect(result.typography.bodyLarge.fontFamily).toBe('Inter');
  });
});
