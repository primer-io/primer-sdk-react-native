import { formatDate } from '../../../Components/internal/utils/formatting';

describe('formatDate', () => {
  it('respects custom format options', () => {
    const date = new Date('2026-03-20T12:00:00Z');
    const result = formatDate(date, 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    expect(result).toContain('March');
    expect(result).toContain('2026');
  });

  it('falls back to ISO string on invalid locale', () => {
    const date = new Date('2026-03-20T12:00:00Z');
    const result = formatDate(date, 'not-a-locale!@#');
    expect(result).toBe(date.toISOString());
  });
});
