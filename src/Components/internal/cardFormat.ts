/**
 * Pure formatting + length helpers for the card-number input. Reads the network
 * descriptor (defined in `cardNetwork.ts`) and answers questions about display
 * length and gap placement; no I/O, no React.
 */
import type { CardNetworkDescriptor } from './cardNetwork';

/** Max PAN digit count across all accepted lengths for the descriptor's network. */
export function maxPanDigits(descriptor: CardNetworkDescriptor): number {
  // Guard against native ever handing back an empty array — `Math.max()` on `[]`
  // is `-Infinity`, which silently breaks `maxLength` on the TextInput.
  if (descriptor.panLengths.length === 0) return 19;
  return Math.max(...descriptor.panLengths);
}

/**
 * Max formatted length (digits + gaps that fall within that digit count). Used
 * as the TextInput `maxLength` so the input won't accept more characters than
 * the longest valid formatted PAN for this network.
 */
export function maxFormattedCardNumberLength(descriptor: CardNetworkDescriptor): number {
  const digits = maxPanDigits(descriptor);
  const gapsWithin = descriptor.gapPattern.filter((g) => g > 0 && g < digits).length;
  return digits + gapsWithin;
}

/**
 * Format keystrokes into a displayed `MM/YY` expiry, inserting the separator once the month is
 * complete. `previous` detects a delete so the separator isn't re-added under the caret.
 */
export function formatExpiryDate(value: string, previous: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (value.length < previous.length) {
    return digits;
  }
  if (digits.length >= 2) {
    return digits.slice(0, 2) + '/' + digits.slice(2);
  }
  return digits;
}

/** Longest displayed expiry — `MM/YY`. Use as the input's `maxLength`. */
export const MAX_EXPIRY_DATE_LENGTH = 5;

/**
 * Display is MM/YY but Android's validator requires MM/YYYY; iOS accepts both.
 * Expand only once the year is fully typed (4-char "MM/YY"); partial edits
 * pass through unchanged so native can keep reporting "cannot be blank".
 */
export function expandExpiryYearForNative(formatted: string): string {
  const match = /^(\d{2})\/(\d{2})$/.exec(formatted);
  return match ? `${match[1]}/20${match[2]}` : formatted;
}

/**
 * Insert spaces into a raw digit string according to a gap pattern.
 * Example: `formatDigitsWithGaps("4242424242424242", [4,8,12])` → `"4242 4242 4242 4242"`.
 */
export function formatDigitsWithGaps(digits: string, gapPattern: readonly number[]): string {
  if (digits.length === 0) return '';
  let out = '';
  for (let i = 0; i < digits.length; i++) {
    if (i > 0 && gapPattern.includes(i)) out += ' ';
    out += digits[i];
  }
  return out;
}
