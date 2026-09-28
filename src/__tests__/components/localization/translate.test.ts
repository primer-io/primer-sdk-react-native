import { readdirSync } from 'fs';
import { join } from 'path';

import { translate } from '../../../Components/internal/localization/translate';

const STRINGS_DIR = join(__dirname, '../../../Components/internal/localization/strings');
const ALL_LOCALES = readdirSync(STRINGS_DIR)
  .filter((file) => file.endsWith('.json'))
  .map((file) => file.replace(/\.json$/, ''));

const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

afterEach(() => {
  warnSpy.mockClear();
});

describe('translate', () => {
  it('returns the translated string for a valid key and locale', () => {
    expect(translate('primer_common_button_pay', 'en')).toBe('Pay');
  });

  it('returns the translated string for a non-English locale', () => {
    expect(translate('primer_common_button_pay', 'fr')).toBe('Payer');
  });

  it('falls back to English when locale is unknown and logs warning', () => {
    const result = translate('primer_common_button_pay', 'xx');
    expect(result).toBe('Pay');
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('primer_common_button_pay'));
  });

  it('returns the key itself when missing from all locales', () => {
    const result = translate('nonexistent.key' as any, 'en');
    expect(result).toBe('nonexistent.key');
    expect(warnSpy).toHaveBeenCalled();
  });

  it('supports interpolation with params', () => {
    expect(translate('primer_common_button_pay_amount', 'en', { amount: '$50.00' })).toBe('Pay $50.00');
  });

  it('handles interpolation in non-English locale', () => {
    expect(translate('primer_common_button_pay_amount', 'fr', { amount: '50,00 €' })).toBe('Payer 50,00 €');
  });

  it('falls back to English when key exists in en but not in locale', () => {
    // primer_qr_code_scan_instruction exists in en but not in fr
    const result = translate('primer_qr_code_scan_instruction', 'fr');
    expect(result).toBe('Scan to pay or take a screenshot');
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('primer_qr_code_scan_instruction'));
  });

  it('resolves the OVO phone helper in every locale without falling back', () => {
    const key = 'primer_form_redirect_ovo_phone_helper';
    expect(translate(key, 'en')).toBe('Enter the phone number registered with your OVO account.');

    // Assert presence per locale, not the copy — it ships untranslated but will be translated later.
    for (const locale of ALL_LOCALES) {
      const value = translate(key, locale);
      expect(value).toBeTruthy();
      expect(value).not.toBe(key);
    }
    expect(warnSpy).not.toHaveBeenCalled();
  });
});

describe('accessibility string localization', () => {
  const a11yKeys = [
    'accessibility_card_form_card_number_label',
    'accessibility_card_form_expiry_label',
    'accessibility_card_form_cvc_label',
    'accessibility_card_form_cardholder_name_label',
    'accessibility_card_form_submit_label',
    'accessibility_common_close',
  ] as const;

  const locales = ['en', 'fr', 'de', 'es', 'ja'];

  for (const locale of locales) {
    it(`has all accessibility strings in ${locale}`, () => {
      for (const key of a11yKeys) {
        const result = translate(key, locale);
        expect(result).toBeTruthy();
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
