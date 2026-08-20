import type { PrimerTokens, PrimerThemeOverride, PrimerColorTokens } from './types';

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

// The input tokens alias their non-input counterparts, so a merchant who colours the sheet
// without naming the input keeps matching inputs, as they did before the tokens were split.
const COLOR_ALIASES: ReadonlyArray<[keyof PrimerColorTokens, keyof PrimerColorTokens]> = [
  ['backgroundOutlinedDefault', 'background'],
  ['textOutlinedDefault', 'textPrimary'],
];

function mergeColors(base: PrimerColorTokens, override: Partial<PrimerColorTokens>): PrimerColorTokens {
  const set = stripNullish(override);
  const merged = { ...base, ...set };

  for (const [alias, source] of COLOR_ALIASES) {
    if (set[alias] == null && set[source] != null) {
      merged[alias] = set[source];
    }
  }

  return merged;
}

export function mergeTokens(base: PrimerTokens, override: ModeOverride): PrimerTokens {
  if (override == null) {
    return base;
  }

  return {
    colors: override.colors ? mergeColors(base.colors, override.colors) : base.colors,
    spacing: override.spacing ? { ...base.spacing, ...stripNullish(override.spacing) } : base.spacing,
    typography: override.typography ? { ...base.typography, ...stripNullish(override.typography) } : base.typography,
    radii: override.radii ? { ...base.radii, ...stripNullish(override.radii) } : base.radii,
    borders: override.borders ? { ...base.borders, ...stripNullish(override.borders) } : base.borders,
  };
}
