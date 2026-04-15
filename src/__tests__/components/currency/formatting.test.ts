import { formatCurrency } from '../../../Components/internal/currency/formatting';

describe('formatCurrency', () => {
  it('converts minor units and formats a 2-decimal currency', () => {
    expect(formatCurrency(123456, 'USD', 'en-US')).toBe('$1,234.56');
  });

  it('skips division for zero-decimal currencies', () => {
    const result = formatCurrency(1000, 'JPY', 'ja-JP');
    expect(result).toMatch(/1,000/);
    expect(result).toMatch(/[¥￥]/);
  });

  it('divides by 1000 for three-decimal currencies', () => {
    const result = formatCurrency(1234, 'BHD', 'en-US');
    // 1234 / 1000 = 1.234
    expect(result).toMatch(/1\.234/);
  });

  it('applies locale-specific formatting rules', () => {
    const result = formatCurrency(123456, 'EUR', 'de-DE');
    // German: period for thousands, comma for decimal
    expect(result).toMatch(/1\.234,56/);
    expect(result).toContain('€');
  });
});
