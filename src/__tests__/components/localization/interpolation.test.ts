import { interpolate } from '../../../Components/internal/localization/interpolation';

describe('interpolate', () => {
  it('replaces a single placeholder', () => {
    expect(interpolate('Pay {{amount}}', { amount: '$10.00' })).toBe('Pay $10.00');
  });

  it('replaces multiple placeholders', () => {
    expect(interpolate('{{greeting}}, {{name}}!', { greeting: 'Hello', name: 'World' })).toBe('Hello, World!');
  });

  it('handles numeric values', () => {
    expect(interpolate('Item {{count}} of {{total}}', { count: 3, total: 10 })).toBe('Item 3 of 10');
  });

  it('leaves unmatched placeholders as-is', () => {
    expect(interpolate('Pay {{amount}}', { currency: 'USD' })).toBe('Pay {{amount}}');
  });

  it('returns template unchanged when no params provided', () => {
    expect(interpolate('Hello World')).toBe('Hello World');
  });

  it('returns template unchanged when params is undefined', () => {
    expect(interpolate('Pay {{amount}}', undefined)).toBe('Pay {{amount}}');
  });

  it('returns template unchanged when params is empty', () => {
    expect(interpolate('Pay {{amount}}', {})).toBe('Pay {{amount}}');
  });

  it('handles string with no placeholders and params', () => {
    expect(interpolate('Hello World', { name: 'Test' })).toBe('Hello World');
  });

  it('handles empty string', () => {
    expect(interpolate('', { name: 'Test' })).toBe('');
  });

  it('handles repeated placeholders', () => {
    expect(interpolate('{{a}} and {{a}}', { a: 'X' })).toBe('X and X');
  });
});
