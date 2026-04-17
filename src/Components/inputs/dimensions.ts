// Card-input dimension constants. Sourced from Figma and not theme-driven
// because the token system has no slot for icon size / field height. Keep all
// design-spec numerics in this one file so any future spec change is local.

export const FIELD_HEIGHT = 44;
export const LINE_HEIGHT_RATIO = 1.25;

// Trailing glyph inside the input (error triangle, expiry calendar, CVV hint).
// Square, 20×20, with 8px gap to the left of it.
export const TRAILING_ICON_SIZE = 20;
export const TRAILING_ICON_MARGIN = 8;

// Card number input has two special trailing variants that aren't square:
//   - brand icon (detected network logo)
//   - placeholder icon (generic chip-card while no network is detected)
export const BRAND_ICON_WIDTH = 32;
export const BRAND_ICON_HEIGHT = 20;
export const PLACEHOLDER_ICON_WIDTH = 28;
export const PLACEHOLDER_ICON_HEIGHT = 20;
