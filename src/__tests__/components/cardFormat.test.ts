import { expandExpiryYearForNative, formatExpiryDate } from '../../Components/internal/cardFormat';

// Shared by the card form and the Bancontact raw-data form — the expiry inputs on both use a
// numeric keyboard, so the separator has to be synthesised and the year expanded before native.
describe('formatExpiryDate', () => {
  it('inserts the separator once the month is complete', () => {
    expect(formatExpiryDate('0', '')).toBe('0');
    expect(formatExpiryDate('03', '0')).toBe('03/');
    expect(formatExpiryDate('03/3', '03/')).toBe('03/3');
    expect(formatExpiryDate('03/30', '03/3')).toBe('03/30');
  });

  it('drops the separator on delete so the month stays editable', () => {
    expect(formatExpiryDate('03/3', '03/30')).toBe('033');
    expect(formatExpiryDate('03', '03/')).toBe('03');
  });

  it('ignores non-digits and caps at four digits', () => {
    expect(formatExpiryDate('0a3', '')).toBe('03/');
    expect(formatExpiryDate('0330999', '')).toBe('03/30');
  });
});

describe('expandExpiryYearForNative', () => {
  it('expands a complete two-digit year', () => {
    expect(expandExpiryYearForNative('03/30')).toBe('03/2030');
  });

  it('leaves a four-digit year alone', () => {
    expect(expandExpiryYearForNative('03/2030')).toBe('03/2030');
  });

  it('passes partial input through so native still reports it invalid', () => {
    expect(expandExpiryYearForNative('')).toBe('');
    expect(expandExpiryYearForNative('03')).toBe('03');
    expect(expandExpiryYearForNative('03/')).toBe('03/');
    expect(expandExpiryYearForNative('03/3')).toBe('03/3');
  });
});
