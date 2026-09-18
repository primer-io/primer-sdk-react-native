import type { PrimerTypographyStyle, PrimerTypographyTokens } from './types';

export const TYPOGRAPHY_STYLES = [
  'titleXLarge',
  'titleLarge',
  'bodyLarge',
  'bodyMedium',
  'bodySmall',
  'error',
] as const;

export type PrimerTypographyStyleName = (typeof TYPOGRAPHY_STYLES)[number];

// What the resolver needs: every metric present, the typeface optional so it can fall back to the
// brand font. Deliberately stricter than the public override, which lets a merchant set one field.
export type PrimerTypographyStyleSource = Omit<PrimerTypographyStyle, 'fontFamily'> & { fontFamily?: string };

export type PrimerTypographySource = {
  fontFamily: string;
} & Record<PrimerTypographyStyleName, PrimerTypographyStyleSource>;

// The only place a style's typeface is decided: its own font when it names one, the brand font otherwise.
export function resolveTypography(source: PrimerTypographySource): PrimerTypographyTokens {
  const styles = {} as Record<PrimerTypographyStyleName, PrimerTypographyStyle>;

  for (const name of TYPOGRAPHY_STYLES) {
    const style = source[name];
    styles[name] = { ...style, fontFamily: style.fontFamily ?? source.fontFamily };
  }

  return { fontFamily: source.fontFamily, ...styles };
}
