import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { cardFieldErrorKey } from '../../Components/internal/cardFieldError';
import type { CardFormField } from '../../Components/types/CardFormTypes';

const visa = { panLengths: [16, 18, 19], cvvLength: 3 as const };
const amex = { panLengths: [15], cvvLength: 4 as const };
const now = new Date(2026, 10, 8);

describe('cardFieldErrorKey', () => {
  it.each<[CardFormField, string]>([
    ['cardNumber', 'primer_card_form_error_number_required'],
    ['expiryDate', 'primer_card_form_error_expiry_required'],
    ['cvv', 'primer_card_form_error_cvv_required'],
    ['cardholderName', 'primer_card_form_error_name_required'],
  ])('asks for an empty %s', (field, key) => {
    expect(cardFieldErrorKey(field, 'invalid', ' ', visa, now)).toBe(key);
  });

  it.each([
    ['too short', '4242 4242 42', visa, 'primer_card_form_error_number_incomplete'],
    ['failing the check', '4242 4242 4242 4241', visa, 'primer_card_form_error_number_invalid'],
    ['failing the check on amex', '3782 822463 10006', amex, 'primer_card_form_error_number_invalid'],
  ])('tells a card number %s', (_case, value, descriptor, key) => {
    expect(cardFieldErrorKey('cardNumber', 'invalid-card-number', value, descriptor, now)).toBe(key);
  });

  it('reports a card type the session does not accept', () => {
    expect(cardFieldErrorKey('cardNumber', 'unsupported-card-type', '4242 4242 4242 4242', visa, now)).toBe(
      'primer_card_form_error_card_type_unsupported'
    );
  });

  it.each([
    ['a month above 12', '13/30', 'primer_card_form_error_expiry_month_invalid'],
    ['month zero', '00/30', 'primer_card_form_error_expiry_month_invalid'],
    ['a one digit year', '12/2', 'primer_card_form_error_expiry_year_invalid'],
    ['no year', '12', 'primer_card_form_error_expiry_year_invalid'],
    ['the slash dropped after a deletion', '123', 'primer_card_form_error_expiry_year_invalid'],
    ['a past year', '01/20', 'primer_card_form_error_card_expired'],
    ['an earlier month this year', '10/26', 'primer_card_form_error_card_expired'],
    ['a future date the SDK still rejects', '12/99', 'primer_card_form_error_expiry_year_invalid'],
  ])('tells an expiry date with %s', (_case, value, key) => {
    expect(cardFieldErrorKey('expiryDate', 'invalid-expiry-date', value, visa, now)).toBe(key);
  });

  it.each([
    [visa, 'primer_card_form_error_cvv_length_3'],
    [amex, 'primer_card_form_error_cvv_length_4'],
  ])('asks for the network CVV length', (descriptor, key) => {
    expect(cardFieldErrorKey('cvv', 'invalid-cvv', '12', descriptor, now)).toBe(key);
  });

  it.each([
    ['one letter', 'J', 'primer_card_form_error_name_length'],
    ['46 letters', 'J'.repeat(46), 'primer_card_form_error_name_length'],
    ['an allowed length', 'J0hn', 'primer_card_form_error_name_invalid'],
  ])('tells a cardholder name with %s', (_case, value, key) => {
    expect(cardFieldErrorKey('cardholderName', 'invalid-cardholder-name', value, visa, now)).toBe(key);
  });

  it('has every key it returns in every locale', () => {
    const keys = [
      'number_required',
      'number_incomplete',
      'number_invalid',
      'card_type_unsupported',
      'expiry_required',
      'expiry_month_invalid',
      'expiry_year_invalid',
      'card_expired',
      'cvv_required',
      'cvv_length_3',
      'cvv_length_4',
      'name_required',
      'name_length',
      'name_invalid',
    ].map((key) => `primer_card_form_error_${key}`);
    const stringsDir = join(__dirname, '../../Components/internal/localization/strings');
    const missing = readdirSync(stringsDir)
      .filter((file) => file.endsWith('.json'))
      .flatMap((file) => {
        const strings = JSON.parse(readFileSync(join(stringsDir, file), 'utf8')) as Record<string, string>;
        return keys.filter((key) => !strings[key]).map((key) => `${file}: ${key}`);
      });
    expect(missing).toEqual([]);
  });
});
