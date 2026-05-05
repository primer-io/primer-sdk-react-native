/**
 * Pure formatting + length helpers for the card-number input. Reads the network
 * descriptor (defined in `cardNetwork.ts`) and answers questions about display
 * length and gap placement; no I/O, no React.
 */
import type { CardNetworkDescriptor } from './cardNetwork';

/** Max PAN digit count across all accepted lengths for the descriptor's network. */
export function maxPanDigits(descriptor: CardNetworkDescriptor): number {
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
