import { mergeTokens } from '../merge';
import { defaultLightTokens } from '../tokens';
import type { PrimerTypographyStyle } from '../types';

const base = defaultLightTokens;

describe('mergeTokens', () => {
  it('returns base unchanged (referential equality) when override is undefined', () => {
    expect(mergeTokens(base, undefined)).toBe(base);
  });

  it('returns base unchanged (referential equality) when override is null', () => {
    expect(mergeTokens(base, null as any)).toBe(base);
  });

  it('applies partial colors override — only specified fields change', () => {
    const result = mergeTokens(base, { colors: { primary: '#ff0000' } });
    expect(result.colors.primary).toBe('#ff0000');
    expect(result.colors.background).toBe(base.colors.background);
    expect(result.colors.textPrimary).toBe(base.colors.textPrimary);
  });

  it('falls back to base value when override color field is null', () => {
    const result = mergeTokens(base, { colors: { primary: null as any } });
    expect(result.colors.primary).toBe(base.colors.primary);
  });

  it('applies partial spacing override — only specified fields change', () => {
    const result = mergeTokens(base, { spacing: { large: 24 } });
    expect(result.spacing.large).toBe(24);
    expect(result.spacing.small).toBe(base.spacing.small);
    expect(result.spacing.medium).toBe(base.spacing.medium);
  });

  it('replaces entire typography style when titleXLarge is overridden', () => {
    const customStyle: PrimerTypographyStyle = {
      fontSize: 28,
      fontWeight: '700',
      lineHeight: 36,
      letterSpacing: -1,
      fontFamily: 'Roboto',
    };
    const result = mergeTokens(base, { typography: { titleXLarge: customStyle } });
    expect(result.typography.titleXLarge).toEqual(customStyle);
    expect(result.typography.titleLarge).toBe(base.typography.titleLarge);
  });

  it('applies overrides across all five categories simultaneously', () => {
    const result = mergeTokens(base, {
      colors: { primary: '#aabbcc' },
      spacing: { large: 20 },
      typography: { fontFamily: 'Roboto' },
      radii: { medium: 10 },
      borders: { strong: 3 },
    });

    expect(result.colors.primary).toBe('#aabbcc');
    expect(result.colors.background).toBe(base.colors.background);
    expect(result.spacing.large).toBe(20);
    expect(result.spacing.small).toBe(base.spacing.small);
    expect(result.typography.fontFamily).toBe('Roboto');
    expect(result.typography.titleXLarge).toBe(base.typography.titleXLarge);
    expect(result.radii.medium).toBe(10);
    expect(result.radii.small).toBe(base.radii.small);
    expect(result.borders.strong).toBe(3);
    expect(result.borders.default).toBe(base.borders.default);
  });
});
