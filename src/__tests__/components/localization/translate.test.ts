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
  it('returns the key itself when missing from all locales', () => {
    const result = translate('nonexistent.key' as any, 'en');
    expect(result).toBe('nonexistent.key');
    expect(warnSpy).toHaveBeenCalled();
  });

  it('returns the translated string in English and non-English locales, with and without params', () => {
    expect(translate('primer_common_button_pay', 'en')).toBe('Pay');
    expect(translate('primer_common_button_pay', 'fr')).toBe('Payer');
    expect(translate('primer_common_button_pay_amount', 'en', { amount: '$50.00' })).toBe('Pay $50.00');
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
