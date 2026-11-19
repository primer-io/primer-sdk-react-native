import { orderTotal } from '../../Components/internal/orderTotal';

describe('orderTotal', () => {
  it.each([
    ['no fee', { totalAmount: 1000 }, 1000],
    ['a surcharge fee', { totalAmount: 1050, fees: [{ type: 'SURCHARGE', amount: 50 }] }, 1000],
    [
      'two surcharge fees',
      {
        totalAmount: 1080,
        fees: [
          { type: 'SURCHARGE', amount: 50 },
          { type: 'SURCHARGE', amount: 30 },
        ],
      },
      1000,
    ],
    ['another fee type', { totalAmount: 1050, fees: [{ type: 'SHIPPING', amount: 50 }] }, 1050],
    ['no session', null, undefined],
  ])('%s', (_name, clientSession, expected) => {
    expect(orderTotal(clientSession)).toBe(expected);
  });
});
