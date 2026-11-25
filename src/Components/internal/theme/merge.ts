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

function isNonFiniteNumber(value: unknown): boolean {
  return typeof value === 'number' && !Number.isFinite(value);
}

function hasNonFiniteNumber(value: unknown): boolean {
  if (value == null || typeof value !== 'object') return isNonFiniteNumber(value);
  return Object.values(value).some(hasNonFiniteNumber);
}

function stripNullish<T extends object>(obj: Partial<T>): Partial<T> {
  const result: Partial<T> = {};
  for (const key in obj) {
    const value = obj[key];
    if (value != null && !isNonFiniteNumber(value)) {
      result[key] = value;
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
  ['onBrand', 'backgroundPrimary'],
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

  // Error defaults to bodySmall, but the token file spells it out as literals, so relayer it here.
  styles.error = {
    ...styles.error,
    ...stripNullish(set.bodySmall ?? {}),
    ...stripNullish(set.error ?? {}),
  };

  const source: PrimerTypographySource = { fontFamily, ...styles };
  return resolveTypography(source);
}

export function mergeTokens(base: PrimerTokens, override: ModeOverride): PrimerTokens {
  if (override == null) {
    return base;
  }

  if (hasNonFiniteNumber(override)) {
    console.warn('[PrimerCheckoutTheme] A NaN or infinite theme number is ignored.');
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
