import type { IPrimerAsset } from '../../models/PrimerPaymentMethodResource';
import type { PaymentMethodItem } from '../types/PaymentMethodTypes';

/** The backend's three versions of a button's background and logo. */
export type AssetVariant = 'colored' | 'light' | 'dark';

/**
 * The coloured version in both modes; without it, the current mode's version, then the other
 * mode's. Null when there is none. The same rule as the native SDKs' list buttons.
 */
export function pickVariant(asset: IPrimerAsset | undefined, isDark: boolean): AssetVariant | null {
  if (asset?.colored != null) return 'colored';
  const [current, other]: [AssetVariant, AssetVariant] = isDark ? ['dark', 'light'] : ['light', 'dark'];
  if (asset?.[current] != null) return current;
  return asset?.[other] != null ? other : null;
}

export interface PartnerButtonAssets {
  backgroundColor?: string;
  logo?: string;
}

/**
 * One version for the whole partner button, chosen by its background, so the logo sits on the
 * background it was made for. Without a backend background the button takes the sheet's colour,
 * which follows the mode, so it takes the mode's logo. A logo missing from the chosen version falls
 * back through `pickVariant`. An item with no backend assets (merchant-supplied `data`) keeps its
 * own `logo` and `backgroundColor`.
 */
export function partnerAssets(item: PaymentMethodItem, isDark: boolean): PartnerButtonAssets {
  const resource = item.resource;
  if (resource == null || !('paymentMethodLogo' in resource)) {
    return { backgroundColor: item.backgroundColor, logo: item.logo };
  }
  const background = resource.paymentMethodBackgroundColor;
  const variant = pickVariant(background, isDark) ?? (isDark ? 'dark' : 'light');
  const logos = resource.paymentMethodLogo;
  const fallback = pickVariant(logos, isDark);
  return {
    backgroundColor: background?.[variant],
    logo: logos?.[variant] ?? (fallback != null ? logos?.[fallback] : undefined),
  };
}
