import { resolveTypography, TYPOGRAPHY_STYLES } from './typography';
import type { PrimerTypographyStyleName, PrimerTypographySource } from './typography';
import type {
  PrimerTokens,
  PrimerThemeOverride,
  PrimerColorTokens,
  PrimerTypographyOverride,
  PrimerTypographyStyleOverride,
  PrimerTypographyTokens,
} from './types';

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
  // Semantic tokens follow the palette entry they alias, matching the other SDKs' token files.
  ['backgroundPrimary', 'gray000'],
  ['backgroundSecondary', 'gray100'],
  ['textPrimary', 'gray900'],
  ['textSecondary', 'gray600'],
  ['textPlaceholder', 'gray500'],
  ['textDisabled', 'gray400'],
  ['textNegative', 'red900'],
  ['textLink', 'blue900'],
  ['borderOutlinedDefault', 'gray300'],
  ['borderOutlinedActive', 'gray500'],
  ['borderOutlinedDisabled', 'gray200'],
  ['borderOutlinedLoading', 'gray200'],
  ['borderOutlinedSelected', 'brand'],
  ['borderOutlinedError', 'red500'],
  ['iconPrimary', 'gray900'],
  ['iconDisabled', 'gray400'],
  ['iconNegative', 'red500'],
  ['iconPositive', 'green500'],
  ['focus', 'brand'],
  ['loader', 'brand'],
  // Two hops: these follow a semantic token that itself follows the palette.
  ['backgroundOutlinedDefault', 'backgroundPrimary'],
  ['backgroundOutlinedActive', 'backgroundOutlinedDefault'],
  ['backgroundOutlinedSelected', 'backgroundOutlinedDefault'],
  ['backgroundOutlinedError', 'backgroundOutlinedDefault'],
  ['backgroundOutlinedDisabled', 'gray100'],
  ['backgroundOutlinedLoading', 'backgroundOutlinedDisabled'],
  ['backgroundTransparentActive', 'gray200'],
  ['backgroundTransparentDisabled', 'gray100'],
  ['backgroundTransparentLoading', 'backgroundTransparentDisabled'],
  ['backgroundTransparentSelected', 'gray100'],
  ['borderOutlinedFocus', 'focus'],
  ['borderTransparentFocus', 'focus'],
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

function mergeTypography(base: PrimerTypographyTokens, override: PrimerTypographyOverride): PrimerTypographyTokens {
  const set = stripNullish(override);
  const fontFamily = set.fontFamily ?? base.fontFamily;
  const styles = {} as Record<PrimerTypographyStyleName, PrimerTypographyStyleOverride>;

  for (const name of TYPOGRAPHY_STYLES) {
    // A style that was following the brand font keeps following it, so drop its font and re-resolve.
    const { fontFamily: current, ...metrics } = base[name];
    styles[name] = set[name] ?? (current === base.fontFamily ? metrics : base[name]);
  }

  const source: PrimerTypographySource = { fontFamily, ...styles };
  return resolveTypography(source);
}

export function mergeTokens(base: PrimerTokens, override: ModeOverride): PrimerTokens {
  if (override == null) {
    return base;
  }

  return {
    colors: override.colors ? mergeColors(base.colors, override.colors) : base.colors,
    spacing: override.spacing ? { ...base.spacing, ...stripNullish(override.spacing) } : base.spacing,
    typography: override.typography ? mergeTypography(base.typography, override.typography) : base.typography,
    radii: override.radii ? { ...base.radii, ...stripNullish(override.radii) } : base.radii,
    sizes: override.sizes ? { ...base.sizes, ...stripNullish(override.sizes) } : base.sizes,
    widths: override.widths ? { ...base.widths, ...stripNullish(override.widths) } : base.widths,
  };
}
