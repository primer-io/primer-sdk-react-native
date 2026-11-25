import { maskEmail } from '../../Components/internal/utils/formatting';

describe('maskEmail', () => {
  it.each([
    ['joeappleseed@gmail.com', 'jo••••ed@gmail.com'],
    ['john.smith@example.com', 'jo••••th@example.com'],
    ['johnny@example.com', 'jo••••ny@example.com'],
    ['jonny@example.com', 'jo••••@example.com'],
    ['jo@example.com', 'jo••••@example.com'],
    ['j@example.com', 'j••••@example.com'],
    ['no-at-sign', 'no-at-sign'],
  ])('masks %s as %s', (email, expected) => {
    expect(maskEmail(email)).toBe(expected);
  });
});
