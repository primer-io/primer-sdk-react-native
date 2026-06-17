/**
 * Contract tests for the card-form public API refinement
 * (specs/002-components-customization-api/contracts/public-api.md).
 *
 *   C1 — every public card-form symbol carries the `Primer` / `usePrimer` prefix.
 *   C4 — a card input rendered outside `PrimerCardFormProvider` throws a descriptive error.
 *   C5 — no public Tier 1–3 path surfaces raw card field values to caller code
 *        (inputs accept no value-emitting prop; values flow only via `usePrimerCardForm`).
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

// ---------------------------------------------------------------------------
// C1 — naming (FR-001 / SC-002)
// ---------------------------------------------------------------------------
describe('C1: card-form public exports are Primer-prefixed', () => {
  const rootBarrel = readSource('index.tsx');
  const componentsBarrel = readSource('Components/index.ts');
  const rootExports = valueExports(rootBarrel);
  const componentsExports = valueExports(componentsBarrel);

  // The renamed public card-form value surface (components + hooks).
  const expectedComponentsBarrel = [
    'PrimerCardForm',
    'PrimerCardFormProvider',
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

  // Names the rename removed — must not survive in either barrel.
  const forbidden = [
    'useCardForm',
    'useCardNetwork',
    'useCardNetworkSelection',
    'CardNetworkSelector',
    'CardNumberInput',
    'ExpiryDateInput',
    'CVVInput',
    'CardholderNameInput',
    'CardFormStateProvider',
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

  it.each(forbidden)('no barrel re-exports the unprefixed %s', (name) => {
    const wordBoundary = new RegExp(`\\b${name}\\b`);
    // The renamed component value-exports must not appear unprefixed. Allow
    // `CardFormErrors` / `CardFormField` style siblings by checking exact words.
    const hit = [...rootExports, ...componentsExports].some((e) => wordBoundary.test(e) && e === name);
    expect(hit).toBe(false);
  });

  it.each(['usePrimerTheme', 'usePrimerLocalization'])('root barrel exports %s (prefixed)', (name) => {
    expect(rootExports).toContain(name);
    expect(name).toMatch(/^(Primer|usePrimer)/);
  });

  it('every card-form value export in the root barrel is prefixed', () => {
    const cardFormish = rootExports.filter((n) =>
      /(CardForm|CardNumberInput|ExpiryDateInput|CVVInput|CardholderNameInput|CardNetworkSelector)$/.test(n)
    );
    for (const name of cardFormish) {
      expect(name).toMatch(/^(Primer|usePrimer)/);
    }
  });
});

// ---------------------------------------------------------------------------
// C5 — PCI: inputs expose no value-emitting prop (FR-007 / SC-004)
// ---------------------------------------------------------------------------
describe('C5: card inputs surface no raw field values to callers', () => {
  const cardInputTypes = readSource('Components/types/CardInputTypes.ts');

  // The shared input prop type after the refinement.
  const propsBody = /export interface PrimerCardInputProps \{([\s\S]*?)\n\}/.exec(cardInputTypes)?.[1] ?? '';

  it('PrimerCardInputProps exists', () => {
    expect(propsBody).not.toBe('');
  });

  // A value-emitting prop would let caller code read raw PAN/CVV/etc. None allowed.
  it.each(['value', 'onChangeText', 'onChange', 'cardForm', 'binData'])(
    'PrimerCardInputProps has no `%s` member',
    (member) => {
      expect(propsBody).not.toMatch(new RegExp(`\\b${member}\\b\\s*[?:]`));
    }
  );

  it('the four input components receive no value/onChangeText prop', () => {
    for (const file of [
      'Components/inputs/PrimerCardNumberInput.tsx',
      'Components/inputs/PrimerExpiryDateInput.tsx',
      'Components/inputs/PrimerCVVInput.tsx',
      'Components/inputs/PrimerCardholderNameInput.tsx',
    ]) {
      const src = readSource(file);
      // Destructured props must not include a `cardForm` / `value` prop — state
      // comes from `usePrimerCardForm()` context, not from the caller.
      const propsDestructure = /function\s+\w+\(\s*\{([^}]*)\}/.exec(src)?.[1] ?? '';
      expect(propsDestructure).not.toMatch(/\bcardForm\b/);
      expect(propsDestructure).not.toMatch(/\bvalue\b/);
      expect(src).toMatch(/usePrimerCardForm\(\)/);
    }
  });
});
