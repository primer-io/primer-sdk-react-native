import type { PrimerTypographyStyle, PrimerTypographyStyleOverride, PrimerTypographyTokens } from './types';

export const TYPOGRAPHY_STYLES = [
  'titleXLarge',
  'titleLarge',
  'bodyLarge',
  'bodyMedium',
  'bodySmall',
  'error',
] as const;

export type PrimerTypographyStyleName = (typeof TYPOGRAPHY_STYLES)[number];

export type PrimerTypographySource = {
  fontFamily: string;
} & Record<PrimerTypographyStyleName, PrimerTypographyStyleOverride>;

// The only place a style's typeface is decided: its own font when it names one, the brand font otherwise.
export function resolveTypography(source: PrimerTypographySource): PrimerTypographyTokens {
  const styles = {} as Record<PrimerTypographyStyleName, PrimerTypographyStyle>;

  for (const name of TYPOGRAPHY_STYLES) {
    const style = source[name];
    styles[name] = { ...style, fontFamily: style.fontFamily ?? source.fontFamily };
  }

  return { fontFamily: source.fontFamily, ...styles };
}
