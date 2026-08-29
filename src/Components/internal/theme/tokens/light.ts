import type { PrimerTokens } from '../types';

// Values derived from iOS DesignTokens.swift (Style Dictionary generated, light theme).
// Source: /Users/onurvar/Projects/primer-sdk-ios/Sources/PrimerSDK/Classes/CheckoutComponents/Internal/Tokens/DesignTokens.swift
export const defaultLightTokens: PrimerTokens = {
  colors: {
    primary: '#2f98ff', // primerColorBrand (0.184, 0.596, 1.0)
    background: '#ffffff', // primerColorBackground (1.0, 1.0, 1.0)
    surface: '#f5f5f5', // primerColorGray100 (0.961, 0.961, 0.961)
    overlay: 'rgba(0,0,0,0.5)',
    textPrimary: '#212121', // primerColorTextPrimary (0.129, 0.129, 0.129)
    textSecondary: '#757575', // primerColorTextSecondary (0.459, 0.459, 0.459)
    textPlaceholder: '#9e9e9e', // primerColorTextPlaceholder (0.620, 0.620, 0.620)
    textDisabled: '#bdbdbd', // primerColorTextDisabled (0.741, 0.741, 0.741)
    textNegative: '#b4324b', // primerColorTextNegative (0.706, 0.196, 0.294)
    textLink: '#2270f4', // primerColorTextLink (0.133, 0.439, 0.957)
    border: '#e0e0e0', // primerColorBorderOutlinedDefault (0.878, 0.878, 0.878)
    borderFocused: '#2f98ff', // primerColorBorderOutlinedFocus (0.184, 0.596, 1.0)
    borderError: '#ff7279', // primerColorBorderOutlinedError (1.0, 0.447, 0.475)
    borderDisabled: '#eeeeee', // primerColorBorderOutlinedDisabled (0.933, 0.933, 0.933)
    iconPrimary: '#212121', // primerColorIconPrimary (0.129, 0.129, 0.129)
    iconDisabled: '#bdbdbd', // primerColorIconDisabled (0.741, 0.741, 0.741)
    iconNegative: '#ff7279', // primerColorIconNegative (1.0, 0.447, 0.475)
    iconPositive: '#3eb68f', // primerColorIconPositive (0.243, 0.714, 0.561)
    error: '#ff7279', // primerColorRed500 (1.0, 0.447, 0.475)
    success: '#3eb68f', // primerColorGreen500 (0.243, 0.714, 0.561)
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
  },
  radii: {
    none: 0,
    xsmall: 2, // primerRadiusXsmall
    small: 4, // primerRadiusSmall / primerRadiusBase
    medium: 8, // primerRadiusMedium
    large: 12, // primerRadiusLarge
  },
  borders: {
    default: 1,
    input: 1,
    strong: 2,
  },
};
