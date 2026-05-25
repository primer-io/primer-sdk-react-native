/**
 * Public types for co-badged card-network selection in Checkout Components.
 *
 * The data shapes here are surfaced through the `useCardNetworkSelection()` hook
 * and consumed by both the drop-in `<CardNetworkSelector />` and merchant-built
 * custom UIs (headless integration). All fields are `readonly`; mutations happen
 * exclusively via `selectNetwork(identifier)` on the hook return value.
 *
 * Data sources (under the hood — not part of the public contract):
 *   - Available networks + currently-selected network come from the existing
 *     BinData event flow (`binData.alternatives` + `binData.preferred`).
 *   - `selectNetwork()` writes through the new `ComponentsCardNetworkSelectionBridge`
 *     TurboModule, which records the choice at the client-session level. The next
 *     BinData event then reflects the selection back to JS.
 */

import type { CardNetworkId } from '../internal/cardNetwork';

/** A card network surfaced to merchants. Identifier vocabulary follows {@link CardNetworkId}. */
export interface CardNetwork {
  /** Stable, uppercase identifier (e.g. "VISA", "CARTES_BANCAIRES"). */
  readonly identifier: CardNetworkId;
  /** Human-readable name (e.g. "Visa", "Cartes Bancaires"). */
  readonly displayName: string;
  /** Local file URI for the network's logo asset, or null if no asset is available. */
  readonly logoUri: string | null;
  /** True when the merchant accepts this network for the current session. */
  readonly allowed: boolean;
  /** True unless the network is auto-routed (e.g. EFTPOS). */
  readonly allowsUserSelection: boolean;
}

/** Return value of `useCardNetworkSelection()`. */
export interface UseCardNetworkSelectionReturn {
  /** Networks detected for the current PAN that the merchant accepts. */
  readonly availableNetworks: ReadonlyArray<CardNetwork>;
  /**
   * The shopper's explicit pick. `null` until the shopper taps a network in the popover.
   * Source of truth for the backend / tokenization payload — `null` means "no shopper
   * preference yet, the SDK should route on the BIN's default rail".
   */
  readonly selectedNetwork: CardNetwork | null;
  /** Identifier form of {@link selectedNetwork}. `null` until the shopper picks. */
  readonly selectedIdentifier: CardNetworkId | null;
  /**
   * What the UI should currently render as the active network. Falls back to
   * `availableNetworks[0]` (the SDK's BIN-derived default) when the shopper hasn't
   * picked yet, so the input adornment is never blank on a co-badged card.
   * Becomes the shopper's pick after they tap a network.
   */
  readonly displayedNetwork: CardNetwork | null;
  /** Identifier form of {@link displayedNetwork}. */
  readonly displayedIdentifier: CardNetworkId | null;
  /** True when 2+ allowed networks are detected AND all permit user selection. */
  readonly isSelectorVisible: boolean;
  /** True when 2+ allowed networks are detected AND at least one is non-selectable (e.g. EFTPOS). */
  readonly isDualBadge: boolean;
  /**
   * Set the shopper's preferred card network on the active card form.
   * Resolves once the native side has accepted the choice.
   * Rejects (`INVALID_NETWORK` / `INVALID_IDENTIFIER` / `NO_ACTIVE_CARD_FORM` / `NATIVE_REJECTED`)
   * when the identifier is malformed, not in `availableNetworks`, the form has been torn down,
   * or the native SDK refuses the call.
   */
  selectNetwork(identifier: CardNetworkId): Promise<void>;
}
