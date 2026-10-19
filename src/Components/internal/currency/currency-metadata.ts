import bundledCurrencies from './currencies.json';

interface CurrencyEntry {
  c: string;
  m: number;
}

const DEFAULT_FRACTION_DIGITS = 2;

/** In-memory currency map: code → fractionDigits */
let currencyMap: Map<string, number> | null = null;

function ensureLoaded(): Map<string, number> {
  if (currencyMap) return currencyMap;

  currencyMap = new Map<string, number>();
  for (const entry of bundledCurrencies as CurrencyEntry[]) {
    currencyMap.set(entry.c, entry.m);
  }
  return currencyMap;
}

/**
 * Returns the number of minor unit digits for a given currency code.
 * Looks up from bundled currency data (same source as native iOS/Android SDKs).
 * Falls back to 2 for unknown currencies.
 */
export function getMinorUnitDigits(currencyCode: string): number {
  const map = ensureLoaded();
  return map.get(currencyCode.toUpperCase()) ?? DEFAULT_FRACTION_DIGITS;
}

// TODO: Enable once assetsUrl is exposed from native SDK bridge (ACC-6926)
// /**
//  * Fetches latest currency data from the Primer API and updates the in-memory cache.
//  * Called during configure() flow once assetsUrl is available from native bridge.
//  *
//  * @param assetsUrl - Base URL from API configuration (e.g., "https://assets.production.core.primer.io")
//  */
// export async function fetchCurrencyData(assetsUrl: string): Promise<void> {
//   const url = `${assetsUrl}/currency-information/v1/data.json`;
//   try {
//     const response = await fetch(url);
//     if (!response.ok) {
//       console.warn(`[Primer] Failed to fetch currency data: ${response.status}`);
//       return;
//     }
//     const data: CurrencyEntry[] = await response.json();
//     const freshMap = new Map<string, number>();
//     for (const entry of data) {
//       freshMap.set(entry.c, entry.m);
//     }
//     currencyMap = freshMap;
//   } catch (error) {
//     console.warn('[Primer] Failed to fetch currency data, using bundled fallback', error);
//   }
// }
