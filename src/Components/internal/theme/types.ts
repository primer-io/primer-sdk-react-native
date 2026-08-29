export interface PrimerColorTokens {
  primary: string;
  background: string;
  surface: string;
  overlay: string;
  textPrimary: string;
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
}

export interface PrimerRadiusTokens {
  none: number;
  xsmall: number;
  small: number;
  medium: number;
  large: number;
}

export interface PrimerBorderTokens {
  default: number;
  input: number;
  strong: number;
}

export interface PrimerTokens {
  colors: PrimerColorTokens;
  spacing: PrimerSpacingTokens;
  typography: PrimerTypographyTokens;
  radii: PrimerRadiusTokens;
  borders: PrimerBorderTokens;
}

export interface PrimerThemeOverride {
  light?: {
    colors?: Partial<PrimerColorTokens>;
    spacing?: Partial<PrimerSpacingTokens>;
    typography?: Partial<PrimerTypographyTokens>;
    radii?: Partial<PrimerRadiusTokens>;
    borders?: Partial<PrimerBorderTokens>;
  };
  dark?: {
    colors?: Partial<PrimerColorTokens>;
    spacing?: Partial<PrimerSpacingTokens>;
    typography?: Partial<PrimerTypographyTokens>;
    radii?: Partial<PrimerRadiusTokens>;
    borders?: Partial<PrimerBorderTokens>;
  };
}
