import type { PrimerTokens } from '../internal/theme/types';

// Card-input dimension constants sourced from Figma. Field height is built from the spacing and
// type tokens; the icon sizes below have no token slot yet.

export const LINE_HEIGHT_RATIO = 1.25;

export const MIN_INTERACTIVE_HEIGHT = 44;

// Outside height of an input box at the default font scale, border included.
export function defaultFieldHeight(tokens: PrimerTokens): number {
  return Math.max(MIN_INTERACTIVE_HEIGHT, 2 * tokens.spacing.medium + tokens.typography.bodyLarge.lineHeight);
}

// Trailing glyph inside the input (expiry calendar, CVV hint). Square, 20×20,
// with 8px gap to the left of it.
export const TRAILING_ICON_SIZE = 20;
export const TRAILING_ICON_MARGIN = 8;

// Generic chip-card placeholder shown in the card number input's empty state.
export const PLACEHOLDER_ICON_WIDTH = 28;
export const PLACEHOLDER_ICON_HEIGHT = 20;
