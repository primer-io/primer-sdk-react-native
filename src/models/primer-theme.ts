export type PrimerTheme = IPrimerTheme;
interface IPrimerTheme {
  colors?: ColorTheme;
  darkModeColors?: ColorTheme;
}

interface ColorTheme {
  mainColor?: IRgbaColor;
  contrastingColor?: IRgbaColor;
  background?: IRgbaColor;
  text?: IRgbaColor;
  contrastingText?: IRgbaColor;
  borders?: IRgbaColor;
  disabled?: IRgbaColor;
  error?: IRgbaColor;

  // later add options to override defaults for specific components
  // e.g. textfields, submit button, payment methods buttons, etc.
}

export type RgbaColor = IRgbaColor;
interface IRgbaColor {
  red: number;
  green: number;
  blue: number;
  alpha: number;
}
