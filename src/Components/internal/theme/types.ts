export interface PrimerColorTokens {
  // Palette. Every grey below feeds the semantic names that follow, so setting one moves
  // everything derived from it — the same base layer iOS, Android and web already have.
  gray000: string;
  gray100: string;
  gray200: string;
  gray300: string;
  gray400: string;
  gray500: string;
  gray600: string;
  gray900: string;

  primary: string;
  onPrimary: string;
  background: string;
  backgroundOutlinedDefault: string;
  surface: string;
  overlay: string;
  textPrimary: string;
  textOutlinedDefault: string;
  textSecondary: string;
  textPlaceholder: string;
  textDisabled: string;
  textNegative: string;
  textLink: string;
  border: string;
  borderFocused: string;
  borderError: string;
  borderDisabled: string;
  iconPrimary: string;
  iconDisabled: string;
  iconNegative: string;
  iconPositive: string;
  error: string;
  success: string;
}

export interface PrimerSpacingTokens {
  xxsmall: number;
  xsmall: number;
  small: number;
  medium: number;
  large: number;
  xlarge: number;
  xxlarge: number;
  xxxlarge: number;
}

export interface PrimerTypographyStyle {
  fontSize: number;
  fontWeight: string;
  lineHeight: number;
  letterSpacing: number;
  fontFamily: string;
}

export interface PrimerTypographyTokens {
  fontFamily: string;
  titleXLarge: PrimerTypographyStyle;
  titleLarge: PrimerTypographyStyle;
  bodyLarge: PrimerTypographyStyle;
  bodyMedium: PrimerTypographyStyle;
  bodySmall: PrimerTypographyStyle;
  error: PrimerTypographyStyle;
}

export interface PrimerRadiusTokens {
  none: number;
  xsmall: number;
  small: number;
  medium: number;
  large: number;
}

export interface PrimerWidthTokens {
  default: number;
  focus: number;
  error: number;
}

export interface PrimerTokens {
  colors: PrimerColorTokens;
  spacing: PrimerSpacingTokens;
  typography: PrimerTypographyTokens;
  radii: PrimerRadiusTokens;
  widths: PrimerWidthTokens;
}

export interface PrimerThemeOverride {
  light?: {
    colors?: Partial<PrimerColorTokens>;
    spacing?: Partial<PrimerSpacingTokens>;
    typography?: Partial<PrimerTypographyTokens>;
    radii?: Partial<PrimerRadiusTokens>;
    widths?: Partial<PrimerWidthTokens>;
  };
  dark?: {
    colors?: Partial<PrimerColorTokens>;
    spacing?: Partial<PrimerSpacingTokens>;
    typography?: Partial<PrimerTypographyTokens>;
    radii?: Partial<PrimerRadiusTokens>;
    widths?: Partial<PrimerWidthTokens>;
  };
}
