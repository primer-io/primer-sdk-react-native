import type { PrimerTokens } from '../types';

// Values derived from iOS dark.json (Style Dictionary generated, dark theme).
// Source: primer-sdk-ios: Modules/PrimerResources/.../JSONs/dark.json
// Spacing, typography, radii, and widths are mode-independent and match light defaults.
export const defaultDarkTokens: PrimerTokens = {
  colors: {
    gray000: '#171619',
    gray100: '#292929',
    gray200: '#424242',
    gray300: '#575757',
    gray400: '#858585',
    gray500: '#767577',
    gray600: '#c7c7c7',
    gray900: '#efefef',
    primary: '#2f98ff', // primerColorBrand — unchanged in dark (0.184, 0.596, 1.0)
    onPrimary: '#efefef', // dark gray900 — matches Android's onColoredSurface in dark
    background: '#171619', // dark primerColorGray000 (0.090, 0.086, 0.098)
    backgroundOutlinedDefault: '#171619', // dark primerColorBackgroundOutlinedDefault -> background.primary
    surface: '#292929', // dark primerColorGray100 (0.161, 0.161, 0.161)
    overlay: 'rgba(0,0,0,0.7)',
    textPrimary: '#efefef', // dark primerColorGray900 (0.937, 0.937, 0.937)
    textOutlinedDefault: '#efefef', // dark primerColorTextOutlinedDefault -> text.primary
    textSecondary: '#c7c7c7', // dark primerColorGray600 (0.780, 0.780, 0.780)
    textPlaceholder: '#767577', // dark primerColorGray500 (0.463, 0.459, 0.467)
    textDisabled: '#858585', // dark primerColorGray400 (0.522, 0.522, 0.522)
    textNegative: '#f6bfbf', // dark primerColorRed900 (0.965, 0.749, 0.749)
    textLink: '#4aaeff', // dark primerColorBlue900 (0.290, 0.682, 1.0)
    border: '#575757', // dark primerColorGray300 (0.341, 0.341, 0.341)
    borderFocused: '#2f98ff', // dark primerColorBrand — unchanged
    borderError: '#e46d70', // dark primerColorRed500 (0.894, 0.427, 0.439)
    borderDisabled: '#424242', // dark primerColorGray200 (0.259, 0.259, 0.259)
    iconPrimary: '#efefef', // dark primerColorGray900
    iconDisabled: '#858585', // dark primerColorGray400
    iconNegative: '#e46d70', // dark primerColorRed500
    iconPositive: '#27b17d', // dark primerColorGreen500 (0.153, 0.694, 0.490)
    error: '#e46d70', // dark primerColorRed500
    success: '#27b17d', // dark primerColorGreen500
  },
  spacing: {
    xxsmall: 2,
    xsmall: 4,
    small: 8,
    medium: 12,
    large: 16,
    xlarge: 20,
    xxlarge: 24,
    xxxlarge: 32,
  },
  typography: {
    fontFamily: 'Inter',
    titleXLarge: {
      fontSize: 24,
      fontWeight: '600',
      lineHeight: 32,
      letterSpacing: -0.6,
      fontFamily: 'Inter',
    },
    titleLarge: {
      fontSize: 16,
      fontWeight: '600',
      lineHeight: 20,
      letterSpacing: -0.2,
      fontFamily: 'Inter',
    },
    bodyLarge: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 20,
      letterSpacing: -0.2,
      fontFamily: 'Inter',
    },
    bodyMedium: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 20,
      letterSpacing: 0,
      fontFamily: 'Inter',
    },
    bodySmall: {
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 16,
      letterSpacing: 0,
      fontFamily: 'Inter',
    },
    error: {
      fontSize: 12,
      fontWeight: '400',
      lineHeight: 16,
      letterSpacing: 0,
      fontFamily: 'Inter',
    },
  },
  radii: {
    none: 0,
    xsmall: 2,
    small: 4,
    medium: 8,
    large: 12,
  },
  sizes: {
    small: 16, // primerSizeSmall
    medium: 20, // primerSizeMedium
    large: 24, // primerSizeLarge
    xlarge: 32, // primerSizeXlarge
    xxlarge: 44, // primerSizeXxlarge
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
