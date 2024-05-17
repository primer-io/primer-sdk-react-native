import { toRgbColor } from "../../utils/index";

describe('toRgbColor function', () => {
  it('should return null for invalid hex color strings', () => {
    expect(toRgbColor('#abc')).toBeNull(); // Too short hex string
    expect(toRgbColor('#12z34')).toBeNull(); // Non-hex characters
    expect(toRgbColor('#12345')).toBeNull(); // Too short hex string
    expect(toRgbColor('123456')).toBeNull(); // Missing # symbol
    expect(toRgbColor('red')).toBeNull(); // Non-hex string
  });

  it('should return correct RGB color object for valid hex color strings', () => {
    // Test for RGB color without alpha
    expect(toRgbColor('#ffffff')).toEqual({ red: 255, green: 255, blue: 255, alpha: 1 });

    // Test for RGB color with alpha
    expect(toRgbColor('#00000000')).toEqual({ red: 0, green: 0, blue: 0, alpha: 1 });

    // Test for lower case hex string
    expect(toRgbColor('#abcdef')).toEqual({ red: 171, green: 205, blue: 239, alpha: 1 });

    // Test for upper case hex string
    expect(toRgbColor('#ABCDEF')).toEqual({ red: 171, green: 205, blue: 239, alpha: 1 });
  });
});
