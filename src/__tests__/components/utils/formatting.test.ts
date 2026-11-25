import { formatDate } from '../../../Components/internal/utils/formatting';

describe('formatDate', () => {
  it('falls back to ISO string on invalid locale', () => {
    const date = new Date('2026-03-20T12:00:00Z');
    const result = formatDate(date, 'not-a-locale!@#');
    expect(result).toBe(date.toISOString());
  });
});
