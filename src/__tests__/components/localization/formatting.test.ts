import { formatCurrency, formatDate } from '../../../Components/internal/localization/formatting';

describe('formatCurrency', () => {
  it('formats USD in en-US', () => {
    expect(formatCurrency(123456, 'USD', 'en-US')).toBe('$1,234.56');
  });

  it('formats EUR in de-DE', () => {
    const result = formatCurrency(123456, 'EUR', 'de-DE');
    expect(result).toMatch(/1\.234,56/);
    expect(result).toContain('€');
  });

  it('formats JPY (zero-decimal currency) in ja-JP', () => {
    const result = formatCurrency(1000, 'JPY', 'ja-JP');
    expect(result).toMatch(/1,000/);
    // Intl may use full-width ￥ or half-width ¥ depending on platform
    expect(result).toMatch(/[¥￥]/);
  });

  it('formats BHD (three-decimal currency)', () => {
    const result = formatCurrency(1234, 'BHD', 'en-US');
    // 1234 minor units / 1000 = 1.234
    expect(result).toMatch(/1\.234/);
  });

  it('handles zero amount', () => {
    expect(formatCurrency(0, 'USD', 'en-US')).toBe('$0.00');
  });

  it('handles negative amount', () => {
    const result = formatCurrency(-500, 'USD', 'en-US');
    expect(result).toContain('5.00');
  });

  it('formats GBP in en-GB', () => {
    const result = formatCurrency(9999, 'GBP', 'en-GB');
    expect(result).toContain('£');
    expect(result).toMatch(/99\.99/);
  });

  it('formats EUR in fr-FR', () => {
    const result = formatCurrency(123456, 'EUR', 'fr-FR');
    expect(result).toContain('€');
    // French uses space as thousand separator and comma as decimal
    expect(result).toMatch(/1[\s\u202f]234,56/);
  });
});

describe('formatDate', () => {
  const testDate = new Date('2026-03-20T12:00:00Z');

  it('formats date in en-US', () => {
    const result = formatDate(testDate, 'en-US');
    expect(result).toBeTruthy();
    expect(typeof result).toBe('string');
  });

  it('formats date in de-DE', () => {
    const result = formatDate(testDate, 'de-DE');
    expect(result).toBeTruthy();
  });

  it('formats date with custom options', () => {
    const result = formatDate(testDate, 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    expect(result).toContain('March');
    expect(result).toContain('2026');
  });

  it('formats date in ja-JP', () => {
    const result = formatDate(testDate, 'ja-JP');
    expect(result).toBeTruthy();
  });

  it('uses default options when none provided', () => {
    const result = formatDate(testDate, 'en-US');
    expect(result.length).toBeGreaterThan(0);
  });
});
