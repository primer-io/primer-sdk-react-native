import { expandExpiryYearForNative, formatExpiryDate } from '../../Components/internal/cardFormat';

describe('formatExpiryDate', () => {
  it('caps at four digits', () => {
    expect(formatExpiryDate('0330999', '')).toBe('03/30');
  });
});

describe('expandExpiryYearForNative', () => {
  it('passes partial input through so native still reports it invalid', () => {
    expect(expandExpiryYearForNative('03/')).toBe('03/');
    expect(expandExpiryYearForNative('03/3')).toBe('03/3');
  });
});
