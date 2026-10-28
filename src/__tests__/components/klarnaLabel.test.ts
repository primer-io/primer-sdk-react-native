import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { splitKlarnaLabel } from '../../Components/internal/klarnaLabel';

describe('splitKlarnaLabel', () => {
  it.each([
    ['en word order', 'Pay with Klarna', 'Pay with', null],
    ['de word order', 'Mit Klarna bezahlen', 'Mit', 'bezahlen'],
    ['tr word order', 'Klarna ile öde', null, 'ile öde'],
    ['badge alone', 'Klarna', null, null],
    ['badge alone', 'Pay later', null, null],
  ])('keeps the %s: %s', (_case, label, before, after) => {
    expect(splitKlarnaLabel(label)).toEqual({ before, after });
  });

  it('finds the word in every locale, so none falls back to the badge alone', () => {
    const stringsDir = join(__dirname, '../../Components/internal/localization/strings');
    const files = readdirSync(stringsDir).filter((file) => file.endsWith('.json'));
    const missing = files.filter((file) => {
      const strings = JSON.parse(readFileSync(join(stringsDir, file), 'utf8')) as Record<string, string>;
      return !strings.accessibility_payment_selection_pay_with_klarna?.includes('Klarna');
    });
    expect(missing).toEqual([]);
  });
});
