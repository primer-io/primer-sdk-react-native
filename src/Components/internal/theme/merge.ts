import type { PrimerTokens, PrimerThemeOverride } from './types';

type ModeOverride = PrimerThemeOverride['light'];

function stripNullish<T extends object>(obj: Partial<T>): Partial<T> {
  const result: Partial<T> = {};
  for (const key in obj) {
    if (obj[key] != null) {
      result[key] = obj[key];
    }
  }
  return result;
}

export function mergeTokens(base: PrimerTokens, override: ModeOverride): PrimerTokens {
  if (override == null) {
    return base;
  }

  return {
    colors: override.colors ? { ...base.colors, ...stripNullish(override.colors) } : base.colors,
    spacing: override.spacing ? { ...base.spacing, ...stripNullish(override.spacing) } : base.spacing,
    typography: override.typography ? { ...base.typography, ...stripNullish(override.typography) } : base.typography,
    radii: override.radii ? { ...base.radii, ...stripNullish(override.radii) } : base.radii,
    borders: override.borders ? { ...base.borders, ...stripNullish(override.borders) } : base.borders,
  };
}
