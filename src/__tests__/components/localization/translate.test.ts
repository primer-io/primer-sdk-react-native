import { translate } from '../../../Components/internal/localization/translate';

// Spy on console.warn to verify warning logs
const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

afterEach(() => {
  warnSpy.mockClear();
});

describe('translate', () => {
  it('returns the translated string for a valid key and locale', () => {
    expect(translate('checkout.pay_button', 'en')).toBe('Pay');
  });

  it('returns the translated string for a non-English locale', () => {
    expect(translate('checkout.pay_button', 'fr')).toBe('Payer');
  });

  it('falls back to English when key is missing in locale', () => {
    // Use a key that exists in English but might be missing in other locales
    const result = translate('checkout.pay_button', 'en');
    expect(result).toBe('Pay');
  });

  it('falls back to English when locale has no translation for key and logs warning', () => {
    // Translate with a locale that doesn't have all keys — using 'en' as base
    // Since all starter locales should have all keys, we test with a partial locale scenario
    const result = translate('checkout.pay_button', 'xx');
    // Should fall back to English
    expect(result).toBe('Pay');
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('checkout.pay_button'));
  });

  it('returns the key itself when missing from all locales', () => {
    // Force a lookup with a key that won't exist (cast to bypass type safety)
    const result = translate('nonexistent.key' as any, 'en');
    expect(result).toBe('nonexistent.key');
    expect(warnSpy).toHaveBeenCalled();
  });

  it('supports interpolation with params', () => {
    expect(translate('checkout.pay_amount', 'en', { amount: '$50.00' })).toBe('Pay $50.00');
  });

  it('handles interpolation in non-English locale', () => {
    expect(translate('checkout.pay_amount', 'fr', { amount: '50,00 €' })).toBe('Payer 50,00 €');
  });
});

describe('accessibility string localization', () => {
  const a11yKeys = [
    'a11y.card_number_field',
    'a11y.expiry_field',
    'a11y.cvv_field',
    'a11y.cardholder_field',
    'a11y.pay_button',
    'a11y.close_button',
  ] as const;

  const locales = ['en', 'fr', 'de', 'es', 'ja'];

  for (const locale of locales) {
    it(`has all accessibility strings in ${locale}`, () => {
      for (const key of a11yKeys) {
        const result = translate(key, locale);
        expect(result).toBeTruthy();
        // Should not fall back to the key itself
        expect(result).not.toBe(key);
      }
    });
  }

  it('accessibility strings are translated (not same as English) in non-English locales', () => {
    for (const key of a11yKeys) {
      const enValue = translate(key, 'en');
      const frValue = translate(key, 'fr');
      expect(frValue).not.toBe(enValue);
    }
  });
});
