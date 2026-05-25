import { useCallback, useMemo } from 'react';
import { usePrimerCheckout } from './usePrimerCheckout';
import type { CardNetwork, UseCardNetworkSelectionReturn } from '../types/CardNetworkSelection';
import type { PrimerCardNetwork } from '../../models/PrimerBinData';

const LOG = '[useCardNetworkSelection]';

// Networks routed by the issuer rather than the shopper. Showing them in a
// chooser would be misleading — we render them as a non-interactive dual-badge.
const NON_SELECTABLE_NETWORKS = new Set<string>(['EFTPOS']);

function toCardNetwork(raw: PrimerCardNetwork): CardNetwork {
  const identifier = raw.network;
  return {
    identifier,
    displayName: raw.displayName,
    // `allowed` is iOS-only on PrimerCardNetwork. undefined → treat as allowed.
    logoUri: null,
    allowed: raw.allowed !== false,
    allowsUserSelection: !NON_SELECTABLE_NETWORKS.has(identifier.toUpperCase()),
  };
}

export function useCardNetworkSelection(): UseCardNetworkSelectionReturn {
  const { cardFormState, selectCardNetwork: providerSelect, selectedCardNetwork } = usePrimerCheckout();
  const binData = cardFormState.binData;

  const availableNetworks = useMemo<ReadonlyArray<CardNetwork>>(() => {
    if (!binData) {
      console.log(`${LOG} binData=null`);
      return [];
    }
    console.log(
      `${LOG} binData status=${binData.status} preferred=${binData.preferred?.network ?? 'nil'} alternatives=${JSON.stringify(binData.alternatives?.map((a) => a.network))}`
    );
    const all: PrimerCardNetwork[] = binData.preferred
      ? [binData.preferred, ...binData.alternatives]
      : [...binData.alternatives];
    const result = all.map(toCardNetwork).filter((n) => n.allowed);
    console.log(`${LOG} availableNetworks=${JSON.stringify(result.map((r) => r.identifier))}`);
    return result;
  }, [binData]);

  // `selectedCardNetwork` is the shopper's pick (provider-managed, single source of
  // truth across all hook callers). Null until the shopper acts — we deliberately
  // do NOT fall back to `binData.preferred`, which is the SDK's BIN-detection
  // default rather than the shopper's choice.
  const selectedIdentifier = selectedCardNetwork;

  const selectedNetwork = useMemo<CardNetwork | null>(() => {
    if (!selectedIdentifier) return null;
    return availableNetworks.find((n) => n.identifier === selectedIdentifier) ?? null;
  }, [availableNetworks, selectedIdentifier]);

  // What the UI should display. Falls back to the first available network (the
  // SDK's BIN-derived default) when the shopper hasn't picked — so the trigger
  // never renders blank on a co-badge card. Backend / tokenization uses
  // `selectedNetwork` separately, which stays null until the shopper acts.
  const displayedNetwork = useMemo<CardNetwork | null>(
    () => selectedNetwork ?? availableNetworks[0] ?? null,
    [selectedNetwork, availableNetworks]
  );
  const displayedIdentifier = displayedNetwork?.identifier ?? null;

  const isSelectorVisible = availableNetworks.length >= 2 && availableNetworks.every((n) => n.allowsUserSelection);
  const isDualBadge = availableNetworks.length >= 2 && availableNetworks.some((n) => !n.allowsUserSelection);

  const selectNetwork = useCallback(
    async (identifier: string): Promise<void> => {
      console.log(`${LOG} select(id=${identifier})`);
      try {
        await providerSelect(identifier);
        console.log(`${LOG} select ok id=${identifier}`);
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
