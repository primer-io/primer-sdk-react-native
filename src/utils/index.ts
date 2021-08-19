import type { PrimerReactNativeException } from 'src/models/primer-exception';
import type { IPrimerResumeRequest } from 'src/models/primer-request';
import type { RgbaColor } from 'src/models/primer-theme';

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
    red: parseInt(r, 16),
    green: parseInt(g, 16),
    blue: parseInt(b, 16),
    alpha: 1,
  };
}

export function parseCallback<T>(
  data: any,
  callback: (val: T | PrimerReactNativeException) => void
) {
  try {
    const error = JSON.parse(data) as T;
    callback(error);
  } catch (e) {
    callback({ name: 'ParseJsonFailed' });
  }
}

export function parseCallbackResume<T>(
  data: any,
  callback: (
    val: T | PrimerReactNativeException,
    res: (req: IPrimerResumeRequest) => void
  ) => void,
  resume: () => void = () => {}
) {
  let completion = (_: IPrimerResumeRequest): void => {
    resume();
  };
  try {
    const error = JSON.parse(data) as T;
    callback(error, completion);
  } catch (e) {
    callback({ name: 'ParseJsonFailed' }, () => {});
  }
}
