import { payButtonTitle } from '../../Components/internal/payButtonTitle';

const payWithAmount = (amount: string) => `${amount} bezahlen`;

describe('payButtonTitle', () => {
  it('shows the default title without options', () => {
    expect(payButtonTitle(undefined, '10,00 €', 'Bezahlen', payWithAmount)).toBe('Bezahlen');
  });

  it('replaces the default title with custom text', () => {
    expect(payButtonTitle({ payButtonText: 'Complete order' }, '£10.00', 'Pay', payWithAmount)).toBe('Complete order');
  });

  it('trims the custom text', () => {
    expect(
      payButtonTitle({ payButtonText: ' Buy now ', payButtonAmountVisible: true }, '£10.00', 'Pay', payWithAmount)
    ).toBe('Buy now £10.00');
  });

  it('keeps the default title when the custom text is blank', () => {
    expect(payButtonTitle({ payButtonText: '  ' }, '£10.00', 'Pay', payWithAmount)).toBe('Pay');
  });

  it('uses the translated pay-with-amount text when there is no custom text', () => {
    expect(payButtonTitle({ payButtonAmountVisible: true }, '10,00 €', 'Bezahlen', payWithAmount)).toBe(
      '10,00 € bezahlen'
    );
  });

  it('appends the amount to the custom text', () => {
    expect(
      payButtonTitle({ payButtonText: 'Complete order', payButtonAmountVisible: true }, '£10.00', 'Pay', payWithAmount)
    ).toBe('Complete order £10.00');
  });

  it('shows the title alone while the amount is unknown', () => {
    expect(payButtonTitle({ payButtonAmountVisible: true }, undefined, 'Pay', payWithAmount)).toBe('Pay');
  });
});
