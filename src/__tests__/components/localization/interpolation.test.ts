import { interpolate } from '../../../Components/internal/localization/interpolation';

const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

afterEach(() => {
  warnSpy.mockClear();
});

describe('interpolate', () => {
  it('replaces multiple placeholders with string and numeric values', () => {
    expect(interpolate('{{greeting}}, item {{count}}!', { greeting: 'Hello', count: 3 })).toBe('Hello, item 3!');
  });

  it('handles zero as a numeric param (falsy edge case)', () => {
    expect(interpolate('Count: {{n}}', { n: 0 })).toBe('Count: 0');
  });

  it('replaces repeated placeholders', () => {
    expect(interpolate('{{a}} and {{a}}', { a: 'X' })).toBe('X and X');
  });

  it('leaves unmatched placeholders and warns', () => {
    expect(interpolate('Pay {{amount}}', { currency: 'USD' })).toBe('Pay {{amount}}');
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('amount'));
  });

  it('returns template unchanged when no params provided', () => {
    expect(interpolate('Pay {{amount}}')).toBe('Pay {{amount}}');
  });
});
