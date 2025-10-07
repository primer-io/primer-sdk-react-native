import type { RgbaColor } from '../models/PrimerTheme';

export function toRgbColor(hex: string): RgbaColor | null {
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
    red: parseInt(r || '0', 16),
    green: parseInt(g || '0', 16),
    blue: parseInt(b || '0', 16),
    alpha: 1,
  };
}

export function parseCallback<T>(data: any, callback: (val: T) => void) {
  try {
    const error = JSON.parse(data) as T;
    callback(error);
  } catch (e) {
    console.log('failed to parse json', e);
  }
}
