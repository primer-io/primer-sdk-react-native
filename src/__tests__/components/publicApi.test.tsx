import { readFileSync } from 'fs';
import { join } from 'path';

const SRC = join(__dirname, '..', '..');

function readSource(relative: string): string {
  return readFileSync(join(SRC, relative), 'utf8');
}

function exportedNames(source: string, statement: RegExp): string[] {
  const names: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = statement.exec(source)) !== null) {
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

const PUBLIC_VALUES = [
  'usePrimerPaymentMethod',
  'PrimerCheckoutProvider',
  'usePrimerCheckout',
  'usePrimerPaymentMethods',
  'usePrimerVaultManager',
  'usePrimerCardForm',
  'usePrimerCardNetwork',
  'usePrimerCardNetworkSelection',
  'PrimerCardNetworkSelector',
  'usePrimerBillingAddressForm',
  'PrimerPaymentMethodList',
  'PrimerCheckoutSheet',
  'PrimerCardForm',
  'PrimerCardFormProvider',
  'PrimerAcceptedCardNetworks',
  'PrimerBillingAddressForm',
  'PrimerTextInput',
  'PrimerCardNumberInput',
  'PrimerExpiryDateInput',
  'PrimerCVVInput',
  'PrimerCardholderNameInput',
  'PrimerAnalytics',
  'usePrimerLocalization',
  'usePrimerTheme',
  'PrimerLoadingScreen',
  'PrimerSuccessScreen',
  'PrimerErrorScreen',
  'PrimerStatusScreenLayout',
];

const PUBLIC_TYPES = [
  'UsePrimerPaymentMethodReturn',
  'NativeUiPaymentMethod',
  'CardPaymentMethod',
  'StripeAchPaymentMethod',
  'UnsupportedPaymentMethod',
  'PaymentMethodAvailabilityError',
  'VaultedPaymentMethodItem',
  'UsePrimerVaultManagerReturn',
  'PrimerCheckoutProviderProps',
  'PrimerCheckoutContextValue',
  'PaymentOutcome',
  'CardFormState',
  'StripeAchStep',
  'StripeAchUserDetails',
  'StripeAchFieldErrors',
  'StripeAchMandateDisplay',
  'PaymentMethodItem',
  'PaymentMethodSurcharge',
  'UsePrimerPaymentMethodsOptions',
  'UsePrimerPaymentMethodsReturn',
  'UseCardFormOptions',
  'UsePrimerCardFormReturn',
  'CardFormErrors',
  'CardFormField',
  'UseCardNetworkReturn',
  'CardNetworkDetails',
  'CardNetworkId',
  'UsePrimerCardNetworkSelectionReturn',
  'PrimerCardNetworkSelectorProps',
  'UsePrimerBillingAddressFormOptions',
  'UsePrimerBillingAddressFormReturn',
  'BillingAddressFormErrors',
  'BillingAddressField',
  'PrimerBillingAddressFormProps',
  'PrimerPaymentMethodListProps',
  'PrimerCheckoutSheetProps',
  'PrimerCardFormProps',
  'PrimerAcceptedCardNetworksProps',
  'PrimerTextInputTheme',
  'PrimerTextInputProps',
  'PrimerTextInputRef',
  'CardInputTheme',
  'PrimerCardInputProps',
  'PrimerCardNumberInputProps',
  'PrimerExpiryDateInputProps',
  'PrimerCVVInputProps',
  'PrimerCardholderNameInputProps',
  'TranslationParams',
  'LocalizationResult',
  'PrimerTokens',
  'PrimerColorTokens',
  'PrimerSpacingTokens',
  'PrimerTypographyTokens',
  'PrimerTypographyStyle',
  'PrimerTypographyStyleOverride',
  'PrimerTypographyOverride',
  'PrimerRadiusTokens',
  'PrimerSizeTokens',
  'PrimerWidthTokens',
  'PrimerThemeOverride',
  'PrimerLoadingScreenProps',
  'PrimerSuccessScreenProps',
  'PrimerErrorScreenProps',
  'PrimerStatusScreenLayoutProps',
];

describe('Checkout Components public API', () => {
  const rootBarrel = readSource('index.tsx');
  const rootExports = {
    value: exportedNames(rootBarrel, /export\s*\{([^}]*)\}\s*from/g),
    type: exportedNames(rootBarrel, /export\s+type\s*\{([^}]*)\}\s*from/g),
  };

  it.each([
    ...PUBLIC_VALUES.map((name) => ['value', name] as const),
    ...PUBLIC_TYPES.map((name) => ['type', name] as const),
  ])('root barrel exports %s %s', (kind, name) => {
    expect(rootExports[kind]).toContain(name);
  });

  const cardInputTypes = readSource('Components/types/CardInputTypes.ts');
  const propsBody = /export interface PrimerCardInputProps \{([\s\S]*?)\n\}/.exec(cardInputTypes)?.[1] ?? '';

  it.each(['value', 'onChangeText', 'onChange', 'cardForm', 'binData'])(
    'PrimerCardInputProps has no `%s` member',
    (member) => {
      expect(propsBody).not.toBe('');
      expect(propsBody).not.toMatch(new RegExp(`\\b${member}\\b\\s*[?:]`));
    }
  );
});
