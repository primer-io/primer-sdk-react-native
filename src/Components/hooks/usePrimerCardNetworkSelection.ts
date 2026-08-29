import { useCallback, useMemo } from 'react';
import { usePrimerCheckout } from './usePrimerCheckout';
import type { CardNetworkDetails, UsePrimerCardNetworkSelectionReturn } from '../types/CardNetworkSelection';
import type { CardNetworkId } from '../internal/cardNetwork';
import type { PrimerCardNetwork as PrimerBinCardNetwork } from '../../models/PrimerBinData';

const LOG = '[usePrimerCardNetworkSelection]';

// Networks routed by the issuer rather than the shopper. Showing them in a
// chooser would be misleading — we render them as a non-interactive dual-badge.
const NON_SELECTABLE_NETWORKS = new Set<string>(['EFTPOS']);

// A card is co-badged when the BIN resolves to at least this many networks.
const MIN_COBADGE_NETWORKS = 2;

function toCardNetwork(raw: PrimerBinCardNetwork): CardNetworkDetails {
  // Native emits the closed set of CardNetworkId strings; cast is faithful to that contract.
  const identifier = raw.network as CardNetworkId;
  return {
    identifier,
    displayName: raw.displayName,
    // `allowed` is iOS-only on PrimerBinCardNetwork. undefined → treat as allowed.
    logoUri: null,
    allowed: raw.allowed !== false,
    allowsUserSelection: !NON_SELECTABLE_NETWORKS.has(identifier),
  };
}

export function usePrimerCardNetworkSelection(): UsePrimerCardNetworkSelectionReturn {
  const { cardFormState, selectCardNetwork: providerSelect, selectedCardNetwork } = usePrimerCheckout();
  const binData = cardFormState.binData;

  const availableNetworks = useMemo<ReadonlyArray<CardNetworkDetails>>(() => {
    if (!binData) {
      return [];
    }
    const all: PrimerBinCardNetwork[] = binData.preferred
      ? [binData.preferred, ...binData.alternatives]
      : [...binData.alternatives];
    return all.map(toCardNetwork).filter((n) => n.allowed);
  }, [binData]);

  // Deliberately no fallback to `binData.preferred` — that's the SDK's BIN-detection
  // default, not the shopper's choice.
  const selectedIdentifier = selectedCardNetwork;

  const selectedNetwork = useMemo<CardNetworkDetails | null>(() => {
    if (!selectedIdentifier) return null;
    return availableNetworks.find((n) => n.identifier === selectedIdentifier) ?? null;
  }, [availableNetworks, selectedIdentifier]);

  const displayedNetwork = useMemo<CardNetworkDetails | null>(
    () => selectedNetwork ?? availableNetworks[0] ?? null,
    [selectedNetwork, availableNetworks]
  );
  const displayedIdentifier = displayedNetwork?.identifier ?? null;

  const isSelectorVisible =
    availableNetworks.length >= MIN_COBADGE_NETWORKS && availableNetworks.every((n) => n.allowsUserSelection);
  const isDualBadge =
    availableNetworks.length >= MIN_COBADGE_NETWORKS && availableNetworks.some((n) => !n.allowsUserSelection);

  const selectNetwork = useCallback(
    async (identifier: CardNetworkId): Promise<void> => {
      try {
        await providerSelect(identifier);
      } catch (err) {
        console.warn(`${LOG} select failed id=${identifier}: ${String(err)}`);
        throw err;
      }
    },
    [providerSelect]
  );

  return {
    availableNetworks,
    selectedNetwork,
    selectedIdentifier,
    displayedNetwork,
    displayedIdentifier,
    isSelectorVisible,
    isDualBadge,
    selectNetwork,
  };
}
