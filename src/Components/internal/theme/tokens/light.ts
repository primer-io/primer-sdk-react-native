import type { PrimerTokens } from '../types';

// Values derived from iOS DesignTokens.swift (Style Dictionary generated, light theme).
// Source: primer-sdk-ios: Sources/PrimerSDK/Classes/CheckoutComponents/Internal/Tokens/DesignTokens.swift
export const defaultLightTokens: PrimerTokens = {
  colors: {
    backgroundOutlinedActive: '#ffffff',
    backgroundOutlinedDefault: '#ffffff',
    backgroundOutlinedDisabled: '#2121210a',
    backgroundOutlinedError: '#ffffff',
    backgroundOutlinedLoading: '#2121210a',
    backgroundOutlinedSelected: '#ffffff',
    backgroundPrimary: '#ffffff',
    backgroundSecondary: '#2121210a',
    backgroundTransparentActive: '#21212112',
    backgroundTransparentDefault: '#ffffff00',
    backgroundTransparentDisabled: '#2121210a',
    backgroundTransparentLoading: '#2121210a',
    backgroundTransparentSelected: '#2121210a',
    blue500: '#399dff',
    blue900: '#2270f4',
    borderOutlinedActive: '#21212170',
    borderOutlinedDefault: '#21212124',
    borderOutlinedDisabled: '#21212112',
    borderOutlinedError: '#ff7279',
    borderOutlinedFocus: '#2f98ff',
    borderOutlinedLoading: '#21212112',
    borderOutlinedSelected: '#2f98ff',
    borderTransparentActive: '#ffffff00',
    borderTransparentDefault: '#ffffff00',
    borderTransparentDisabled: '#ffffff00',
    borderTransparentFocus: '#2f98ff',
    borderTransparentSelected: '#ffffff00',
    brand: '#2f98ff',
    focus: '#2f98ff',
    gray000: '#ffffff',
    gray100: '#2121210a',
    gray200: '#21212112',
    gray300: '#21212124',
    gray400: '#2121214d',
    gray500: '#21212170',
    gray600: '#2121219e',
    gray900: '#212121',
    green500: '#3eb68f',
    iconDisabled: '#2121214d',
    iconNegative: '#ff7279',
    iconPositive: '#3eb68f',
    iconPrimary: '#212121',
    loader: '#2f98ff',
    red100: '#ffecec',
    red500: '#ff7279',
    red900: '#b4324b',
    textDisabled: '#2121214d',
    textLink: '#2270f4',
    textNegative: '#b4324b',
    textOutlinedDefault: '#212121',
    textPlaceholder: '#21212170',
    textPrimary: '#212121',
    textSecondary: '#2121219e',
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
      fontFamily: 'Inter', // primerTypographyTitleXlargeFont
      fontSize: 24, // primerTypographyTitleXlargeSize
      fontWeight: '600', // primerTypographyTitleXlargeWeight 550 → nearest RN value
      lineHeight: 32, // primerTypographyTitleXlargeLineHeight
      letterSpacing: -0.6, // primerTypographyTitleXlargeLetterSpacing
    },
    titleLarge: {
      fontFamily: 'Inter', // primerTypographyTitleLargeFont
      fontSize: 16, // primerTypographyTitleLargeSize
      fontWeight: '600', // primerTypographyTitleLargeWeight 550 → nearest RN value
      lineHeight: 20, // primerTypographyTitleLargeLineHeight
      letterSpacing: -0.2, // primerTypographyTitleLargeLetterSpacing
    },
    bodyLarge: {
      fontFamily: 'Inter', // primerTypographyBodyLargeFont
      fontSize: 16, // primerTypographyBodyLargeSize
      fontWeight: '400', // primerTypographyBodyLargeWeight
      lineHeight: 20, // primerTypographyBodyLargeLineHeight
      letterSpacing: -0.2, // primerTypographyBodyLargeLetterSpacing
    },
    bodyMedium: {
      fontFamily: 'Inter', // primerTypographyBodyMediumFont
      fontSize: 14, // primerTypographyBodyMediumSize
      fontWeight: '400', // primerTypographyBodyMediumWeight
      lineHeight: 20, // primerTypographyBodyMediumLineHeight
      letterSpacing: 0, // primerTypographyBodyMediumLetterSpacing
    },
    bodySmall: {
      fontFamily: 'Inter', // primerTypographyBodySmallFont
      fontSize: 12, // primerTypographyBodySmallSize
      fontWeight: '400', // primerTypographyBodySmallWeight
      lineHeight: 16, // primerTypographyBodySmallLineHeight
      letterSpacing: 0, // primerTypographyBodySmallLetterSpacing
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
