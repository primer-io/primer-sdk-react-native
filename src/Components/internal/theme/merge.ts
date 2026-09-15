import { resolveTypography, TYPOGRAPHY_STYLES } from './typography';
import type { PrimerTypographyStyleName, PrimerTypographySource, PrimerTypographyStyleSource } from './typography';
import type {
  PrimerTokens,
  PrimerThemeOverride,
  PrimerColorTokens,
  PrimerTypographyOverride,
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
// so a source is resolved before anything that follows it.
const COLOR_ALIASES: ReadonlyArray<[keyof PrimerColorTokens, keyof PrimerColorTokens]> = [
  ['borderOutlinedSelected', 'brand'],
  ['focus', 'brand'],
  ['loader', 'brand'],
  ['backgroundOutlinedDefault', 'backgroundPrimary'],
  ['backgroundOutlinedActive', 'backgroundOutlinedDefault'],
  ['backgroundOutlinedSelected', 'backgroundOutlinedDefault'],
  ['backgroundOutlinedError', 'backgroundOutlinedDefault'],
  ['backgroundOutlinedLoading', 'backgroundOutlinedDisabled'],
  ['backgroundTransparentLoading', 'backgroundTransparentDisabled'],
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
  const styles = {} as Record<PrimerTypographyStyleName, PrimerTypographyStyleSource>;

  for (const name of TYPOGRAPHY_STYLES) {
    // A style that was following the brand font keeps following it, so drop its font and re-resolve.
    const { fontFamily: current, ...metrics } = base[name];
    const inherited = current === base.fontFamily ? metrics : base[name];
    // Lay the override on top rather than replacing, so setting one field keeps the rest.
    styles[name] = { ...inherited, ...stripNullish(set[name] ?? {}) };
  }

  // Error text defaults to the bodySmall values, the way the design file and web have it. The token
  // file spells those out as literals, so without this a merchant who moves bodySmall gets it on
  // every label and not on the error line underneath. Per field, and only where they said nothing
  // about error, so setting error alone still wins.
  styles.error = {
    ...styles.error,
    ...inheritedErrorMetrics(base, stripNullish(set.bodySmall ?? {}), stripNullish(set.error ?? {})),
  };

  const source: PrimerTypographySource = { fontFamily, ...styles };
  return resolveTypography(source);
}

// Whatever the merchant moved on bodySmall and did not spell out on error.
function inheritedErrorMetrics(
  base: PrimerTypographyTokens,
  bodySmall: Partial<PrimerTypographyStyleSource>,
  error: Partial<PrimerTypographyStyleSource>
): Partial<PrimerTypographyStyleSource> {
  const inherited: Partial<PrimerTypographyStyleSource> = {};
  for (const key of Object.keys(bodySmall) as (keyof PrimerTypographyStyleSource)[]) {
    if (error[key] == null && bodySmall[key] !== base.bodySmall[key]) {
      Object.assign(inherited, { [key]: bodySmall[key] });
    }
  }
  return inherited;
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
