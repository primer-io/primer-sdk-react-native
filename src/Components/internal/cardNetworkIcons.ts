import { NativeModules } from 'react-native';

const { RNTPrimerHeadlessUniversalCheckoutAssetsManager } = NativeModules;

const iconUrlCache = new Map<string, Promise<string>>();

/**
 * Module-level promise cache for card-network icon URIs.
 *
 * Calls the native module directly rather than `AssetsManager.getCardNetworkImageURL`,
 * which logs every rejection via `console.error` (LogBox red box in dev). Unknown
 * networks legitimately have no asset — the chip row falls back to the abbreviation —
 * so the rejection is expected, not an error worth surfacing.
 */
export function getCardNetworkIconURL(network: string): Promise<string> {
  const key = network.toUpperCase();
  const existing = iconUrlCache.get(key);
  if (existing) return existing;
  const promise = RNTPrimerHeadlessUniversalCheckoutAssetsManager.getCardNetworkImage(key)
    .then((data: { cardNetworkImageURL: string }) => data.cardNetworkImageURL)
    .catch((err: Error) => {
      iconUrlCache.delete(key);
      throw err;
    });
  iconUrlCache.set(key, promise);
  return promise;
}
