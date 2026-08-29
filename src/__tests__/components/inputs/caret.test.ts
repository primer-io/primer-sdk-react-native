import {
  caretFromDigitIndex,
  countDigits,
  countDigitsBefore,
  targetDigitIndex,
} from '../../../Components/inputs/caret';

describe('countDigits', () => {
  it('returns 0 for an empty string', () => {
    expect(countDigits('')).toBe(0);
  });

  it('counts every digit in a pure-digit string', () => {
    expect(countDigits('1234')).toBe(4);
  });

  it('ignores spaces and slashes', () => {
    expect(countDigits('4242 4242 4242 4242')).toBe(16);
    expect(countDigits('12/34')).toBe(4);
  });

  it('returns 0 when the string has no digits', () => {
    expect(countDigits('abc')).toBe(0);
  });

  it('handles mixed content', () => {
    expect(countDigits('a1b2c3')).toBe(3);
  });
});

describe('countDigitsBefore', () => {
  it('returns 0 when pos is 0', () => {
    expect(countDigitsBefore('1234', 0)).toBe(0);
  });

  it('counts digits up to (but not including) pos', () => {
    expect(countDigitsBefore('1234', 2)).toBe(2);
    expect(countDigitsBefore('1234', 4)).toBe(4);
  });

  it('clamps pos beyond the string length', () => {
    expect(countDigitsBefore('1234', 10)).toBe(4);
  });

  it('skips separators while counting', () => {
    expect(countDigitsBefore('12 34', 3)).toBe(2); // "12 " has 2 digits
    expect(countDigitsBefore('12 34', 5)).toBe(4);
  });

  it('treats negative pos as 0', () => {
    expect(countDigitsBefore('1234', -1)).toBe(0);
  });
});

describe('caretFromDigitIndex', () => {
  it('returns 0 when digitIndex is 0', () => {
    expect(caretFromDigitIndex('1234', 0)).toBe(0);
  });

  it('returns the position after the Nth digit', () => {
    expect(caretFromDigitIndex('1234', 2)).toBe(2);
    expect(caretFromDigitIndex('1234', 4)).toBe(4);
  });

  it('jumps past separators', () => {
    // "12 34" — caret after 3rd digit sits at position 4 (just before the 4)
    expect(caretFromDigitIndex('12 34', 3)).toBe(4);
  });

  it('clamps to string length when digitIndex exceeds digit count', () => {
    expect(caretFromDigitIndex('1234', 10)).toBe(4);
  });

  it('handles an empty formatted string', () => {
    expect(caretFromDigitIndex('', 0)).toBe(0);
    expect(caretFromDigitIndex('', 3)).toBe(0);
  });

  it('walks 4-4-4-4 card-number grouping correctly', () => {
    const formatted = '4242 4242 4242 4242';
    expect(caretFromDigitIndex(formatted, 0)).toBe(0);
    expect(caretFromDigitIndex(formatted, 4)).toBe(4); // end of first group, on the space
    expect(caretFromDigitIndex(formatted, 5)).toBe(6); // past the space to first digit of group 2
    expect(caretFromDigitIndex(formatted, 16)).toBe(19); // end
  });
});

describe('targetDigitIndex', () => {
  it('advances by one when a single character is appended', () => {
    // "1234" caret 4 → "12345"
    expect(targetDigitIndex('1234', 4, '12345')).toBe(5);
  });

  it('advances by the paste length when content is pasted into an empty field', () => {
    expect(targetDigitIndex('', 0, '4242424242424242')).toBe(16);
  });

  it('advances correctly for a mid-string insert', () => {
    // "1234" caret 2 (between 12 and 34), user inserts "9" → "12934"
    expect(targetDigitIndex('1234', 2, '12934')).toBe(3);
  });

  it('retreats by one when the last character is deleted', () => {
    // "1234" caret 4 → "123"
    expect(targetDigitIndex('1234', 4, '123')).toBe(3);
  });

  it('retreats correctly for a mid-string delete', () => {
    // "1234" caret 2 (after the 2), user backspaces → "134"
    expect(targetDigitIndex('1234', 2, '134')).toBe(1);
  });

  it('never returns a negative index on defensive delete', () => {
    expect(targetDigitIndex('1234', 0, '234')).toBe(0);
  });

  it('returns the same position on a no-op paste of identical content', () => {
    expect(targetDigitIndex('1234', 2, '1234')).toBe(2);
  });

  it('respects digit-based semantics when the prev value has a space', () => {
    // "4242 4242" caret 9 (end), user types "4" → "4242 42424"
    expect(targetDigitIndex('4242 4242', 9, '4242 42424')).toBe(9);
  });

  it('collapses to 0 when the field is cleared', () => {
    expect(targetDigitIndex('4242 4242', 9, '')).toBe(0);
  });
});
