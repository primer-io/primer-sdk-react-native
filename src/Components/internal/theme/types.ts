export interface PrimerColorTokens {
  backgroundOutlinedActive: string;
  backgroundOutlinedDefault: string;
  backgroundOutlinedDisabled: string;
  backgroundOutlinedError: string;
  backgroundOutlinedHover: string;
  backgroundOutlinedLoading: string;
  backgroundOutlinedSelected: string;
  backgroundPrimary: string;
  backgroundSecondary: string;
  backgroundTransparentActive: string;
  backgroundTransparentDefault: string;
  backgroundTransparentDisabled: string;
  backgroundTransparentHover: string;
  backgroundTransparentLoading: string;
  backgroundTransparentSelected: string;
  blue500: string;
  blue900: string;
  borderOutlinedActive: string;
  borderOutlinedDefault: string;
  borderOutlinedDisabled: string;
  borderOutlinedError: string;
  borderOutlinedFocus: string;
  borderOutlinedHover: string;
  borderOutlinedLoading: string;
  borderOutlinedSelected: string;
  borderTransparentActive: string;
  borderTransparentDefault: string;
  borderTransparentDisabled: string;
  borderTransparentFocus: string;
  borderTransparentHover: string;
  borderTransparentSelected: string;
  brand: string;
  focus: string;
  gray000: string;
  gray100: string;
  gray200: string;
  gray300: string;
  gray400: string;
  gray500: string;
  gray600: string;
  gray900: string;
  green500: string;
  iconDisabled: string;
  iconNegative: string;
  iconPositive: string;
  iconPrimary: string;
  loader: string;
  red100: string;
  red500: string;
  red900: string;
  textDisabled: string;
  textLink: string;
  textNegative: string;
  textOutlinedDefault: string;
  textPlaceholder: string;
  textPrimary: string;
  textSecondary: string;
  onBrand: string;
  overlay: string;
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

export interface PrimerSizeTokens {
  small: number;
  medium: number;
  large: number;
  xlarge: number;
  xxlarge: number;
  xxxlarge: number;
  base: number;
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
  selected: number;
  error: number;
}

export interface PrimerTokens {
  colors: PrimerColorTokens;
  spacing: PrimerSpacingTokens;
  typography: PrimerTypographyTokens;
  radii: PrimerRadiusTokens;
  sizes: PrimerSizeTokens;
  widths: PrimerWidthTokens;
}

export interface PrimerThemeOverride {
  light?: {
    colors?: Partial<PrimerColorTokens>;
    spacing?: Partial<PrimerSpacingTokens>;
    typography?: Partial<PrimerTypographyTokens>;
    radii?: Partial<PrimerRadiusTokens>;
    sizes?: Partial<PrimerSizeTokens>;
    widths?: Partial<PrimerWidthTokens>;
  };
  dark?: {
    colors?: Partial<PrimerColorTokens>;
    spacing?: Partial<PrimerSpacingTokens>;
    typography?: Partial<PrimerTypographyTokens>;
    radii?: Partial<PrimerRadiusTokens>;
    sizes?: Partial<PrimerSizeTokens>;
    widths?: Partial<PrimerWidthTokens>;
  };
}
