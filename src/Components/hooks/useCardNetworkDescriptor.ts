import { useEffect, useState } from 'react';

import { DEFAULT_DESCRIPTOR, fetchCardNetworkDescriptor } from '../internal/cardNetwork';
import type { CardNetworkDescriptor } from '../internal/cardNetwork';

/**
 * Resolves the network descriptor (CVV length/label, gap pattern, PAN lengths) for a
 * known network identifier (e.g. `'AMEX'`, `'VISA'`). Returns `DEFAULT_DESCRIPTOR`
 * while loading or when the network is null/unknown.
 */
export function useCardNetworkDescriptor(network: string | null | undefined): CardNetworkDescriptor {
  const [descriptor, setDescriptor] = useState<CardNetworkDescriptor>(DEFAULT_DESCRIPTOR);

  useEffect(() => {
    setDescriptor(DEFAULT_DESCRIPTOR);
    if (!network) return;
    let cancelled = false;
    void fetchCardNetworkDescriptor(network).then((d) => {
      if (!cancelled) setDescriptor(d);
    });
    return () => {
      cancelled = true;
    };
  }, [network]);

  return descriptor;
}
