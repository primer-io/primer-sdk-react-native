import { getMinorUnitDigits } from '../../../Components/internal/currency/currency-metadata';

describe('getMinorUnitDigits', () => {
  it('resolves fraction digits for each currency tier from bundled data', () => {
    expect(getMinorUnitDigits('USD')).toBe(2);
    expect(getMinorUnitDigits('JPY')).toBe(0);
    expect(getMinorUnitDigits('BHD')).toBe(3);
  });

  it('is case-insensitive', () => {
    expect(getMinorUnitDigits('usd')).toBe(2);
    expect(getMinorUnitDigits('jpy')).toBe(0);
  });

  it('falls back to 2 for unknown currency codes', () => {
    expect(getMinorUnitDigits('XYZ')).toBe(2);
  });
});
