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

// Each entry says "this colour is derived from that one". A merchant who sets the source and
// not the alias gets the alias moved for them, which is how the native SDKs behave. Ordered
// palette-first so a grey override reaches the semantic names and then the input ones.
const COLOR_ALIASES: ReadonlyArray<[keyof PrimerColorTokens, keyof PrimerColorTokens]> = [
  ['background', 'gray000'],
  ['surface', 'gray100'],
  ['textPrimary', 'gray900'],
  ['textSecondary', 'gray600'],
  ['textPlaceholder', 'gray500'],
  ['textDisabled', 'gray400'],
  ['border', 'gray300'],
  ['borderDisabled', 'gray200'],
  ['iconPrimary', 'gray900'],
  ['iconDisabled', 'gray400'],
  ['backgroundOutlinedDefault', 'background'],
  ['textOutlinedDefault', 'textPrimary'],
];

function mergeColors(base: PrimerColorTokens, override: Partial<PrimerColorTokens>): PrimerColorTokens {
  const set = stripNullish(override);
  const merged = { ...base, ...set };

  for (const [alias, source] of COLOR_ALIASES) {
    // An explicit value always wins, and an unmoved source has nothing to pass on.
    if (set[alias] != null || merged[source] === base[source]) continue;
    merged[alias] = merged[source];
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
