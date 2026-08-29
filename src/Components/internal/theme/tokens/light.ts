import type { PrimerTokens } from '../types';

// Values derived from iOS DesignTokens.swift (Style Dictionary generated, light theme).
// Source: primer-sdk-ios: Sources/PrimerSDK/Classes/CheckoutComponents/Internal/Tokens/DesignTokens.swift
export const defaultLightTokens: PrimerTokens = {
  colors: {
    backgroundOutlinedActive: '#ffffff',
    backgroundOutlinedDefault: '#ffffff',
    backgroundOutlinedDisabled: '#f5f5f5',
    backgroundOutlinedError: '#ffffff',
    backgroundOutlinedHover: '#ffffff',
    backgroundOutlinedLoading: '#f5f5f5',
    backgroundOutlinedSelected: '#ffffff',
    backgroundPrimary: '#ffffff',
    backgroundSecondary: '#f5f5f5',
    backgroundTransparentActive: '#eeeeee',
    backgroundTransparentDefault: '#ffffff00',
    backgroundTransparentDisabled: '#f5f5f5',
    backgroundTransparentHover: '#f5f5f5',
    backgroundTransparentLoading: '#f5f5f5',
    backgroundTransparentSelected: '#f5f5f5',
    blue500: '#399dff',
    blue900: '#2270f4',
    borderOutlinedActive: '#9e9e9e',
    borderOutlinedDefault: '#e0e0e0',
    borderOutlinedDisabled: '#eeeeee',
    borderOutlinedError: '#ff7279',
    borderOutlinedFocus: '#2f98ff',
    borderOutlinedHover: '#bdbdbd',
    borderOutlinedLoading: '#eeeeee',
    borderOutlinedSelected: '#2f98ff',
    borderTransparentActive: '#ffffff00',
    borderTransparentDefault: '#ffffff00',
    borderTransparentDisabled: '#ffffff00',
    borderTransparentFocus: '#2f98ff',
    borderTransparentHover: '#ffffff00',
    borderTransparentSelected: '#ffffff00',
    brand: '#2f98ff',
    focus: '#2f98ff',
    gray000: '#ffffff',
    gray100: '#f5f5f5',
    gray200: '#eeeeee',
    gray300: '#e0e0e0',
    gray400: '#bdbdbd',
    gray500: '#9e9e9e',
    gray600: '#757575',
    gray900: '#212121',
    green500: '#3eb68f',
    iconDisabled: '#bdbdbd',
    iconNegative: '#ff7279',
    iconPositive: '#3eb68f',
    iconPrimary: '#212121',
    loader: '#2f98ff',
    red100: '#ffecec',
    red500: '#ff7279',
    red900: '#b4324b',
    textDisabled: '#bdbdbd',
    textLink: '#2270f4',
    textNegative: '#b4324b',
    textOutlinedDefault: '#212121',
    textPlaceholder: '#9e9e9e',
    textPrimary: '#212121',
    textSecondary: '#757575',
    onBrand: '#ffffff',
    overlay: 'rgba(0,0,0,0.5)',
  },
  spacing: {
    xxsmall: 2, // primerSpaceXxsmall
    xsmall: 4, // primerSpaceXsmall
    small: 8, // primerSpaceSmall
    medium: 12, // primerSpaceMedium
    large: 16, // primerSpaceLarge
    xlarge: 20, // primerSpaceXlarge
    xxlarge: 24, // primerSpaceXxlarge
    xxxlarge: 32, // primerSizeXlarge (scale extension: 8×base)
  },
  typography: {
    fontFamily: 'Inter', // primerTypographyBrand
    titleXLarge: {
      fontSize: 24, // primerTypographyTitleXlargeSize
      fontWeight: '600', // primerTypographyTitleXlargeWeight 550 → nearest RN value
      lineHeight: 32, // primerTypographyTitleXlargeLineHeight
      letterSpacing: -0.6, // primerTypographyTitleXlargeLetterSpacing
      fontFamily: 'Inter', // primerTypographyTitleXlargeFont
    },
    titleLarge: {
      fontSize: 16, // primerTypographyTitleLargeSize
      fontWeight: '600', // primerTypographyTitleLargeWeight 550 → nearest RN value
      lineHeight: 20, // primerTypographyTitleLargeLineHeight
      letterSpacing: -0.2, // primerTypographyTitleLargeLetterSpacing
      fontFamily: 'Inter', // primerTypographyTitleLargeFont
    },
    bodyLarge: {
      fontSize: 16, // primerTypographyBodyLargeSize
      fontWeight: '400', // primerTypographyBodyLargeWeight
      lineHeight: 20, // primerTypographyBodyLargeLineHeight
      letterSpacing: -0.2, // primerTypographyBodyLargeLetterSpacing
      fontFamily: 'Inter', // primerTypographyBodyLargeFont
    },
    bodyMedium: {
      fontSize: 14, // primerTypographyBodyMediumSize
      fontWeight: '400', // primerTypographyBodyMediumWeight
      lineHeight: 20, // primerTypographyBodyMediumLineHeight
      letterSpacing: 0, // primerTypographyBodyMediumLetterSpacing
      fontFamily: 'Inter', // primerTypographyBodyMediumFont
    },
    bodySmall: {
      fontSize: 12, // primerTypographyBodySmallSize
      fontWeight: '400', // primerTypographyBodySmallWeight
      lineHeight: 16, // primerTypographyBodySmallLineHeight
      letterSpacing: 0, // primerTypographyBodySmallLetterSpacing
      fontFamily: 'Inter', // primerTypographyBodySmallFont
    },
    error: {
      fontSize: 12, // primerTypographyErrorSize
      fontWeight: '400', // primerTypographyErrorWeight
      lineHeight: 16, // primerTypographyErrorLineHeight
      letterSpacing: 0, // primerTypographyErrorLetterSpacing
      fontFamily: 'Inter', // primerTypographyErrorFont
    },
  },
  radii: {
    none: 0,
    xsmall: 2, // primerRadiusXsmall
    small: 4, // primerRadiusSmall / primerRadiusBase
    medium: 8, // primerRadiusMedium
    large: 12, // primerRadiusLarge
  },
  sizes: {
    small: 16, // primerSizeSmall
    medium: 20, // primerSizeMedium
    large: 24, // primerSizeLarge
    xlarge: 32, // primerSizeXlarge
    xxlarge: 40, // primerSizeXxlarge
    xxxlarge: 56, // primerSizeXxxlarge
    base: 4, // primerSizeBase
  },
  widths: {
    default: 1,
    focus: 2,
    selected: 2,
    error: 2,
  },
};
