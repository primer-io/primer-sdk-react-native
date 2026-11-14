import { groupBySurcharge } from '../../Components/internal/groupBySurcharge';
import type { PaymentMethodItem, PaymentMethodSurcharge } from '../../Components/types/PaymentMethodTypes';

const method = (type: string, surcharge?: PaymentMethodSurcharge) => ({ type, surcharge }) as PaymentMethodItem;

const flat = (amount: number): PaymentMethodSurcharge => ({ kind: 'flat', amount });
const perNetwork = (amounts: Record<string, number>): PaymentMethodSurcharge => ({ kind: 'perNetwork', amounts });

const ALLOWED = ['VISA', 'MASTERCARD'];

const summary = (methods: PaymentMethodItem[], allowed: readonly string[] = ALLOWED) =>
  groupBySurcharge(methods, allowed).map((group) => [group.title, group.methods.map((m) => m.type)]);

const cardTitle = (surcharge: PaymentMethodSurcharge, allowed: readonly string[] = ALLOWED) =>
  groupBySurcharge([method('PAYMENT_CARD', surcharge), method('PAYPAL', flat(100))], allowed).find((group) =>
    group.methods.some((m) => m.type === 'PAYMENT_CARD')
  )?.title;

describe('groupBySurcharge', () => {
  it('has no groups when no method has a fee', () => {
    expect(
      groupBySurcharge(
        [method('APPLE_PAY'), method('PAYPAL', flat(0)), method('PAYMENT_CARD', perNetwork({ VISA: 0 }))],
        ALLOWED
      )
    ).toEqual([]);
  });

  it('puts every method in one fee group when they all have the same fee', () => {
    expect(
      summary([
        method('APPLE_PAY', flat(500)),
        method('PAYPAL', flat(500)),
        method('PAYMENT_CARD', perNetwork({ VISA: 500, MASTERCARD: 500 })),
      ])
    ).toEqual([[500, ['APPLE_PAY', 'PAYPAL', 'PAYMENT_CARD']]]);
  });

  it('orders fee groups by their first method, then no fee, then fees may apply, keeping the method order', () => {
    expect(
      summary([
        method('KLARNA'),
        method('APPLE_PAY', flat(500)),
        method('PAYMENT_CARD', perNetwork({ VISA: 100, MASTERCARD: 200 })),
        method('PAYPAL', flat(300)),
        method('GOOGLE_PAY', flat(500)),
        method('ADYEN_BLIK', flat(0)),
      ])
    ).toEqual([
      [500, ['APPLE_PAY', 'GOOGLE_PAY']],
      [300, ['PAYPAL']],
      ['none', ['KLARNA', 'ADYEN_BLIK']],
      ['mayApply', ['PAYMENT_CARD']],
    ]);
  });

  it.each([
    ['every allowed network has the same fee', perNetwork({ VISA: 50, MASTERCARD: 50, AMEX: 90 }), ALLOWED, 50],
    ['the allowed networks have different fees', perNetwork({ VISA: 50, MASTERCARD: 70 }), ALLOWED, 'mayApply'],
    ['an allowed network is missing from the fees', perNetwork({ VISA: 50 }), ALLOWED, 'mayApply'],
    ['only networks that are not allowed have a fee', perNetwork({ AMEX: 90 }), ALLOWED, 'none'],
    ['no allowed networks are known and a network has a fee', perNetwork({ VISA: 50, MASTERCARD: 50 }), [], 'mayApply'],
    ['no allowed networks are known and no network has a fee', perNetwork({ VISA: 0 }), [], 'none'],
    ['a negative network fee counts as no fee', perNetwork({ VISA: -10, MASTERCARD: 0, AMEX: 90 }), ALLOWED, 'none'],
  ])('titles the card when %s', (_name, surcharge, allowed, expected) => {
    expect(cardTitle(surcharge, allowed)).toBe(expected);
  });

  it('treats a zero or negative fee on a method as no fee', () => {
    expect(summary([method('PAYPAL', flat(0)), method('APPLE_PAY', flat(-50)), method('KLARNA', flat(100))])).toEqual([
      [100, ['KLARNA']],
      ['none', ['PAYPAL', 'APPLE_PAY']],
    ]);
  });
});
