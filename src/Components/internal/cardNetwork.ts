/**
 * Card-network descriptor: PAN lengths, gap pattern, CVV length, CVV label.
 *
 * Traits are fetched asynchronously from the native SDK via `fetchCardNetworkDescriptor`
 * and cached per network id for the session. `DEFAULT_DESCRIPTOR` is the safe fallback
 * for unknown/loading networks and the networks native reports without validation data.
 *
 * Source of truth:
 *   - iOS: `PrimerHeadlessUniversalCheckout.AssetsManager.getCardNetworkTraits(cardNetworkString:)`
 *   - Android: `CardNetwork.lookupByCardNetwork(cardNetwork)` via the RN asset bridge
 */
import type { ImageSourcePropType } from 'react-native';
import PrimerHeadlessUniversalCheckoutAssetsManager from '../../HeadlessUniversalCheckout/Managers/AssetsManager';

/** Upper-cased network identifier; matches `binData.preferred.network` from native. */
export type CardNetworkId =
  | 'VISA'
  | 'MASTERCARD'
  | 'AMEX'
  | 'DINERS_CLUB'
  | 'DISCOVER'
  | 'JCB'
  | 'UNIONPAY'
  | 'MAESTRO'
  | 'ELO'
  | 'MIR'
  | 'HIPER'
  | 'HIPERCARD'
  | 'DANKORT'
  | 'BANCONTACT'
  | 'CARTES_BANCAIRES'
  | 'EFTPOS'
  | 'OTHER';

/** CVV label variants emitted by native (iOS: per-network; Android: per-network after ACC-7168). */
export type CvvLabel = 'CVV' | 'CVC' | 'CID' | 'CVN' | 'CVE' | 'CVP2';

export interface CardNetworkDescriptor {
  /** Upper-cased network identifier. */
  id: CardNetworkId;
  /** Human-readable name for UI (e.g. "American Express"). */
  displayName: string;
  /** Allowed PAN digit counts (unformatted, no spaces). */
  panLengths: readonly number[];
  /**
   * Zero-indexed digit positions *before which* a space is inserted when formatting.
   * Example: `[4, 8, 12]` → `4242 4242 4242 4242`; `[4, 10]` → `3782 822463 10005`.
   */
  gapPattern: readonly number[];
  /** CVV digit count. */
  cvvLength: 3 | 4;
  /** Label shown next to the CVV field (iOS-style: matches the physical card). */
  cvvLabel: CvvLabel;
}

/** Used when the network is `null`, `OTHER`, or the native bridge hasn't resolved traits yet. */
export const DEFAULT_DESCRIPTOR: CardNetworkDescriptor = {
  id: 'OTHER',
  displayName: 'Card',
  panLengths: [16, 17, 18, 19],
  gapPattern: [4, 8, 12],
  cvvLength: 3,
  cvvLabel: 'CVV',
};

const assetsManager = new PrimerHeadlessUniversalCheckoutAssetsManager();

// Promise cache keyed by upper-cased network id. Dedupes in-flight calls and persists
// resolved descriptors across hook instances so switching back to a previously seen
// network is instantaneous — mirrors the icon-cache pattern in useCardNetwork.
const descriptorCache = new Map<string, Promise<CardNetworkDescriptor>>();

/**
 * Fetch the descriptor for a network from the native SDK. Falls back to DEFAULT_DESCRIPTOR
 * when native reports null (iOS: bancontact/cartesBancaires/eftpos/unknown) or OTHER
 * (Android's fallback for unrecognised names). Bridge errors also resolve to defaults
 * so the UI never gets stuck on a rejected promise.
 */
export function fetchCardNetworkDescriptor(network: string): Promise<CardNetworkDescriptor> {
  const key = network.toUpperCase();
  const existing = descriptorCache.get(key);
  if (existing) return existing;
  const promise = assetsManager
    .getCardNetworkTraits(key)
    .then((traits): CardNetworkDescriptor => {
      if (!traits || traits.cardNetwork === 'OTHER') return DEFAULT_DESCRIPTOR;
      return {
        id: traits.cardNetwork as CardNetworkId,
        displayName: traits.displayName,
        panLengths: traits.panLengths,
        gapPattern: traits.gapPattern,
        cvvLength: traits.cvvLength as 3 | 4,
        cvvLabel: traits.cvvLabel as CvvLabel,
      };
    })
    .catch((err) => {
      descriptorCache.delete(key);
      console.warn(`[cardNetwork] fetchCardNetworkDescriptor failed for ${key}: ${String(err)}`);
      return DEFAULT_DESCRIPTOR;
    });
  descriptorCache.set(key, promise);
  return promise;
}

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

/** Narrow `ImageSourcePropType | null` when a hook consumer wants to render the network icon. */
export type CardNetworkIconSource = ImageSourcePropType | null;
