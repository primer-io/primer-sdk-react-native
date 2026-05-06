import { useEffect, useState } from 'react';
import { usePrimerCheckout } from './usePrimerCheckout';
import PrimerHeadlessUniversalCheckoutAssetsManager from '../../HeadlessUniversalCheckout/Managers/AssetsManager';
import { DEFAULT_DESCRIPTOR, fetchCardNetworkDescriptor } from '../internal/cardNetwork';
import type { CardNetworkDescriptor, CardNetworkIconSource } from '../internal/cardNetwork';

const LOG = '[useCardNetwork]';

const assetsManager = new PrimerHeadlessUniversalCheckoutAssetsManager();

// Promise cache dedupes in-flight icon requests and persists resolved URLs across hook
// instances. Keyed on the upper-cased network id.
const iconUrlCache = new Map<string, Promise<string>>();

function getCardNetworkIconURL(network: string): Promise<string> {
  const existing = iconUrlCache.get(network);
  if (existing) return existing;
  const promise = assetsManager.getCardNetworkImageURL(network).catch((err) => {
    iconUrlCache.delete(network);
    throw err;
  });
  iconUrlCache.set(network, promise);
  return promise;
}

export interface UseCardNetworkReturn {
  /** Raw network identifier as reported by native (`"VISA"`, `"AMEX"`, ...), or `null` before BIN detection. */
  network: string | null;
  /**
   * Traits for the detected network, resolved asynchronously from the native SDK.
   * Starts as `DEFAULT_DESCRIPTOR` on mount / network-change and upgrades when the
   * native call returns. Stays as `DEFAULT_DESCRIPTOR` for unknown networks or when
   * the native call fails.
   */
  descriptor: CardNetworkDescriptor;
  /** `{ uri }` source for `<Image />`, or `null` while loading or when unknown. */
  iconSource: CardNetworkIconSource;
}

/**
 * Reads the detected card network from the provider's BIN data and resolves the
 * matching traits + icon from the native SDK. Traits drive per-network input
 * formatting (gaps), max length, and the CVV label; icon is a separate fetch.
 */
export function useCardNetwork(): UseCardNetworkReturn {
  const { cardFormState } = usePrimerCheckout();
  const network = cardFormState.binData?.preferred?.network ?? null;

  const [descriptor, setDescriptor] = useState<CardNetworkDescriptor>(DEFAULT_DESCRIPTOR);
  const [iconUri, setIconUri] = useState<string | null>(null);

  useEffect(() => {
    console.log(`${LOG} network change ${JSON.stringify({ network })}`);
    if (!network) {
      setDescriptor(DEFAULT_DESCRIPTOR);
      return;
    }
    let cancelled = false;
    fetchCardNetworkDescriptor(network).then((d) => {
      if (cancelled) return;
      console.log(`${LOG} descriptor resolved ${JSON.stringify({ network, id: d.id })}`);
      setDescriptor(d);
    });
    return () => {
      cancelled = true;
    };
  }, [network]);

  useEffect(() => {
    // Guard on the raw network string, not descriptor.id. Networks like Cartes Bancaires,
    // Bancontact, and EFTPOS have icons but no validation traits on iOS — their descriptor
    // collapses to DEFAULT (id: 'OTHER'), but the raw network string is still the real
    // network name and the icon asset exists.
    if (!network || network.toUpperCase() === 'OTHER') {
      setIconUri(null);
      return;
    }
    let cancelled = false;
    getCardNetworkIconURL(network)
      .then((uri) => {
        console.log(`${LOG} icon resolved ${JSON.stringify({ network, uri })}`);
        if (!cancelled) setIconUri(uri);
      })
      .catch((err) => {
        console.warn(`${LOG} icon fetch failed ${network}: ${String(err)}`);
        if (!cancelled) setIconUri(null);
      });
    return () => {
      cancelled = true;
    };
  }, [network]);

  const iconSource: CardNetworkIconSource = iconUri ? { uri: iconUri } : null;
  return { network, descriptor, iconSource };
}
