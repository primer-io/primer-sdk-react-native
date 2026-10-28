import { getMinorUnitDigits } from '../../../Components/internal/currency/currency-metadata';

describe('getMinorUnitDigits', () => {
  it('is case-insensitive', () => {
    expect(getMinorUnitDigits('usd')).toBe(2);
    expect(getMinorUnitDigits('jpy')).toBe(0);
  });

  it('falls back to 2 for unknown currency codes', () => {
    expect(getMinorUnitDigits('XYZ')).toBe(2);
  });
});
