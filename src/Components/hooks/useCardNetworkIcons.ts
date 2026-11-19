import { useEffect, useMemo, useState } from 'react';
import { getCardNetworkIconURL } from '../internal/cardNetworkIcons';
import { getNetworkAbbreviation, type CardNetworkId } from '../internal/cardNetwork';

export interface CardNetworkIconState {
  /**
   * Upper-cased network id (`"VISA"`, `"AMEX"`, …). Native can report ids outside the
   * known union, so we allow any string while keeping autocomplete for known ids.
   */
  network: CardNetworkId | (string & {});
  /** Resolved image URI, or `null` while loading or when the fetch failed. */
  iconUri: string | null;
  /** Two-letter fallback (`"VI"`, `"AM"`, …) for chips without an icon. */
  abbreviation: string;
}

/**
 * Batch-resolves icon URIs for an ordered list of card networks. Preserves input order,
 * dedupes case-insensitively, and shares the module-level promise cache with
 * `usePrimerCardNetwork`, so an icon fetched once anywhere on the page is reused everywhere.
 */
export function useCardNetworkIcons(networks: string[]): CardNetworkIconState[] {
  const key = useMemo(() => [...new Set(networks.map((n) => n.toUpperCase()))].join('|'), [networks]);
  const upperNetworks = useMemo(() => key.split('|').filter(Boolean), [key]);

  const [iconUris, setIconUris] = useState<Record<string, string | null>>({});

  useEffect(() => {
    let cancelled = false;
    upperNetworks.forEach((network) => {
      getCardNetworkIconURL(network)
        .then((uri) => {
          if (!cancelled) {
            setIconUris((prev) => (prev[network] === uri ? prev : { ...prev, [network]: uri }));
          }
        })
        .catch(() => {
          if (!cancelled) {
            setIconUris((prev) => (network in prev ? prev : { ...prev, [network]: null }));
          }
        });
    });
    return () => {
      cancelled = true;
    };
  }, [key, upperNetworks]);

  return useMemo(
    () =>
      upperNetworks.map((network) => ({
        network,
        iconUri: iconUris[network] ?? null,
        abbreviation: getNetworkAbbreviation(network),
      })),
    [upperNetworks, iconUris]
  );
}
