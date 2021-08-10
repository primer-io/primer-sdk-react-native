import type {
  IOSCheckoutTheme,
  IOSPrimerColorTheme,
  IOSRgbColor,
} from 'src/types';

function toRgbColor(hex: string): IOSRgbColor | null {
  // Make sure it looks like a proper color hex string
  if (!/^#[0-9a-f]{6,8}$/i.test(hex)) {
    return null;
  }

  // take just the rgb components
  const match = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/gi.exec(hex);

  if (!match) {
    return null;
  }

  const r = match[1];
  const g = match[2];
  const b = match[3];

  // convert hex string to decimal
  return {
    red: parseInt(r, 16),
    green: parseInt(g, 16),
    blue: parseInt(b, 16),
  };
}

export function formatTheme(
  theme?: IOSCheckoutTheme
): IOSCheckoutTheme<IOSRgbColor> | null {
  if (!theme) {
    return null;
  }

  const { colorTheme, textFieldTheme, cornerRadiusTheme } = theme;

  if (!colorTheme) {
    return textFieldTheme
      ? { textFieldTheme, colorTheme: {}, cornerRadiusTheme }
      : null;
  }

  const nextTheme = Object.entries(colorTheme).reduce(
    (acc: IOSPrimerColorTheme<IOSRgbColor>, [key, hex]) => {
      const rgb = toRgbColor(hex as string);

      if (!rgb) {
        return acc;
      }

      return { ...acc, [key]: rgb };
    },
    {}
  );

  return {
    textFieldTheme,
    colorTheme: nextTheme,
    cornerRadiusTheme,
  };
}
