export interface IPrimerTheme {
  colors?: ColorTheme;
  darkModeColors?: ColorTheme;
}

interface ColorTheme {
  mainColor?: RgbaColor;
  contrastingColor?: RgbaColor;
  background?: RgbaColor;
  text?: RgbaColor;
  contrastingText?: RgbaColor;
  borders?: RgbaColor;
  disabled?: RgbaColor;
  error?: RgbaColor;

  // later add options to override defaults for specific components
  // e.g. textfields, submit button, payment methods buttons, etc.
}
export interface RgbaColor {
  red: number;
  green: number;
  blue: number;
  alpha: number;
}
