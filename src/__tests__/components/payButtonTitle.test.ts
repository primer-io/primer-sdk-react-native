import { payButtonTitle } from '../../Components/internal/payButtonTitle';

describe('payButtonTitle', () => {
  it.each([
    ['no text', undefined, '£10.00', 'Pay'],
    ['plain text', 'Complete order', '£10.00', 'Complete order'],
    ['blank text', '   ', '£10.00', 'Pay'],
    ['text to trim', '  Buy now  ', '£10.00', 'Buy now'],
    ['token at the start', '{amount} bezahlen', '10,00 €', '10,00 € bezahlen'],
    ['token in the middle', 'Pay {amount} now', '£10.00', 'Pay £10.00 now'],
    ['token at the end', 'Complete order {amount}', '£10.00', 'Complete order £10.00'],
    ['every token', '{amount} or {amount}', '£10.00', '£10.00 or £10.00'],
    ['token with unknown amount', 'Pay {amount} now', undefined, 'Pay now'],
    ['only the token with unknown amount', '{amount}', undefined, 'Pay'],
  ])('%s', (_name, text, amount, expected) => {
    expect(payButtonTitle(text, amount, 'Pay')).toBe(expected);
  });
});
