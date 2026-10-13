import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { splitKlarnaLabel } from '../../Components/internal/klarnaLabel';

describe('splitKlarnaLabel', () => {
  // The real accessibility_payment_selection_pay_with_klarna translations.
  it.each([
    ['en', 'Pay with Klarna', 'Pay with', null],
    ['de', 'Mit Klarna bezahlen', 'Mit', 'bezahlen'],
    ['tr', 'Klarna ile öde', null, 'ile öde'],
    ['ja', 'Klarnaでお支払い', null, 'でお支払い'],
    ['ar', 'الدفع بـ Klarna', 'الدفع بـ', null],
    ['zh-HK', '使用 Klarna 付款', '使用', '付款'],
  ])('keeps the %s word order: %s', (_locale, label, before, after) => {
    expect(splitKlarnaLabel(label)).toEqual({ before, after });
  });

  it('is the badge alone when the label is just the word', () => {
    expect(splitKlarnaLabel('Klarna')).toEqual({ before: null, after: null });
  });

  it('is the badge alone when the label has no "Klarna"', () => {
    expect(splitKlarnaLabel('Pay later')).toEqual({ before: null, after: null });
  });

  it('splits at the first "Klarna" only', () => {
    expect(splitKlarnaLabel('Klarna by Klarna')).toEqual({ before: null, after: 'by Klarna' });
  });

  it('finds the word in every locale, so none falls back to the badge alone', () => {
    const stringsDir = join(__dirname, '../../Components/internal/localization/strings');
    const files = readdirSync(stringsDir).filter((file) => file.endsWith('.json'));
    expect(files).toHaveLength(57);
    const missing = files.filter((file) => {
      const strings = JSON.parse(readFileSync(join(stringsDir, file), 'utf8')) as Record<string, string>;
      return !strings.accessibility_payment_selection_pay_with_klarna?.includes('Klarna');
    });
    expect(missing).toEqual([]);
  });
});
