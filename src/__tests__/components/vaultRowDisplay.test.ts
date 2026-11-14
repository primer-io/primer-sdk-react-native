import { getVaultRowDisplay } from '../../Components/internal/vaultRowDisplay';
import type { VaultedPaymentMethodItem } from '../../Components/types/VaultedPaymentMethodTypes';
import type { PrimerVaultedPaymentMethod } from '../../models/PrimerVaultedPaymentMethod';

const t = (key: string, params?: Record<string, unknown>) =>
  params ? `${key}:${Object.values(params).join(',')}` : key;

function otherItem(overrides: Partial<Extract<VaultedPaymentMethodItem, { kind: 'other' }>>): VaultedPaymentMethodItem {
  return {
    kind: 'other',
    id: 'pm-1',
    paymentMethodType: 'ADYEN_IDEAL',
    paymentInstrumentType: 'OFF_SESSION_PAYMENT',
    rawMethod: {} as PrimerVaultedPaymentMethod,
    ...overrides,
  };
}

describe('getVaultRowDisplay, saved methods that are not cards', () => {
  it.each(['ADYEN_IDEAL', 'BUCKAROO_IDEAL', 'PAY_NL_IDEAL'])('names %s iDEAL | Wero over the session name', (type) => {
    const display = getVaultRowDisplay(otherItem({ paymentMethodType: type, displayName: 'iDeal | Wero' }), t);
    expect(display.title).toBeNull();
    expect(display.secondaryLabel).toBe('iDEAL | Wero');
    expect(display.maskedNumber).toBeNull();
  });

  it('uses the session name for other methods', () => {
    const display = getVaultRowDisplay(otherItem({ paymentMethodType: 'ADYEN_SOFORT', displayName: 'Sofort' }), t);
    expect(display.secondaryLabel).toBe('Sofort');
  });

  it('falls back to the readable type for other methods', () => {
    const display = getVaultRowDisplay(otherItem({ paymentMethodType: 'ADYEN_SOFORT' }), t);
    expect(display.secondaryLabel).toBe('Adyen Sofort');
  });

  it('shows PayPal as the payer name, PayPal and the masked email', () => {
    const display = getVaultRowDisplay(
      otherItem({
        paymentMethodType: 'PAYPAL',
        holderName: 'John Smith',
        detail: 'jo••••th@example.com',
      }),
      t
    );
    expect(display.title).toBe('John Smith');
    expect(display.secondaryLabel).toBe('PayPal');
    expect(display.maskedNumber).toBe('jo••••th@example.com');
  });

  it('shows Klarna with no name line and the brand on the icon line', () => {
    const display = getVaultRowDisplay(otherItem({ paymentMethodType: 'KLARNA', displayName: 'Klarna' }), t);
    expect(display.title).toBeNull();
    expect(display.secondaryLabel).toBe('Klarna');
    expect(display.maskedNumber).toBeNull();
  });
});

describe('getVaultRowDisplay, cards', () => {
  const card = (brandName?: string): VaultedPaymentMethodItem => ({
    kind: 'card',
    id: 'card-1',
    paymentMethodType: 'PAYMENT_CARD',
    paymentInstrumentType: 'PAYMENT_CARD',
    rawMethod: {} as PrimerVaultedPaymentMethod,
    cardholderName: 'John Smith',
    last4: '4242',
    expiryMonth: '03',
    expiryYear: '30',
    brandName,
  });

  it('names a card with an unknown network Card', () => {
    const display = getVaultRowDisplay(card(undefined), t);
    expect(display.secondaryLabel).toBe('primer_vault_default_card');
    expect(display.accessibilityLabel).toContain('primer_vault_default_card');
  });

  it('keeps the network name when it is known', () => {
    expect(getVaultRowDisplay(card('American Express'), t).secondaryLabel).toBe('American Express');
  });
});
