/**
 * Contract test for the Checkout Components public API naming
 * (specs/002-components-customization-api/contracts/public-api.md).
 *
 *   C1 — every public component / hook carries the `Primer` / `usePrimer` prefix,
 *        and the pre-rename names are gone from the public barrels.
 */
import { readFileSync } from 'fs';
import { join } from 'path';

const SRC = join(__dirname, '..', '..');

function readSource(relative: string): string {
  return readFileSync(join(SRC, relative), 'utf8');
}

/** Collect identifiers from `export { ... } from '...'` value-export statements. */
function valueExports(source: string): string[] {
  const names: string[] = [];
  const re = /export\s*\{([^}]*)\}\s*from/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(source)) !== null) {
    const group = match[1] ?? '';
    for (const raw of group.split(',')) {
      const name = raw
        .trim()
        .split(/\s+as\s+/)
        .pop()
        ?.trim();
      if (name) names.push(name);
    }
  }
  return names;
}

describe('C1: public components and hooks are Primer-prefixed', () => {
  const rootBarrel = readSource('index.tsx');
  const componentsBarrel = readSource('Components/index.ts');
  const rootExports = valueExports(rootBarrel);
  const componentsExports = valueExports(componentsBarrel);

  const expectedComponentsBarrel = [
    'PrimerCardForm',
    'PrimerCardNumberInput',
    'PrimerExpiryDateInput',
    'PrimerCVVInput',
    'PrimerCardholderNameInput',
    'PrimerCardNetworkSelector',
    'PrimerAcceptedCardNetworks',
    'usePrimerCardForm',
    'usePrimerCardNetwork',
    'usePrimerCardNetworkSelection',
    'usePrimerPaymentMethods',
    'usePrimerBillingAddressForm',
    'usePrimerVaultManager',
  ];

  it.each(expectedComponentsBarrel)('Components barrel exports %s (prefixed)', (name) => {
    expect(componentsExports).toContain(name);
    expect(name).toMatch(/^(Primer|usePrimer)/);
  });

  it.each(['usePrimerTheme', 'usePrimerLocalization'])('root barrel exports %s (prefixed)', (name) => {
    expect(rootExports).toContain(name);
    expect(name).toMatch(/^(Primer|usePrimer)/);
  });

  // Pre-rename names and unexported internals — must not survive in either barrel.
  const forbidden = [
    'useCardForm',
    'useCardNetwork',
    'useCardNetworkSelection',
    'CardNetworkSelector',
    'CardNumberInput',
    'ExpiryDateInput',
    'CVVInput',
    'CardholderNameInput',
    'usePaymentMethods',
    'useBillingAddressForm',
    'useVaultedPaymentMethods',
    'useTheme',
    'useLocalization',
    'CheckoutSheet',
    'useSheetHeight',
    'NavigationContainer',
    'NavigationHeader',
    'NavigationProvider',
    'useNavigation',
    'useRoute',
    'CheckoutRoute',
    'CountrySelectorRow',
    'translate',
    'hasLocale',
  ];

  it.each(forbidden)('no barrel re-exports %s', (name) => {
    const hit = [...rootExports, ...componentsExports].some((e) => e === name);
    expect(hit).toBe(false);
  });
});
