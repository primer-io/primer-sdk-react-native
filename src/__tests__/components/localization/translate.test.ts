import { translate } from '../../../Components/internal/localization/translate';

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
});
