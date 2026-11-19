export function countDigits(str: string): number {
  let n = 0;
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    if (c >= 48 && c <= 57) n++;
  }
  return n;
}

export function countDigitsBefore(str: string, pos: number): number {
  const end = Math.min(pos, str.length);
  let n = 0;
  for (let i = 0; i < end; i++) {
    const c = str.charCodeAt(i);
    if (c >= 48 && c <= 57) n++;
  }
  return n;
}

export function caretFromDigitIndex(formatted: string, digitIndex: number): number {
  let seen = 0;
  for (let i = 0; i < formatted.length; i++) {
    if (seen === digitIndex) return i;
    const c = formatted.charCodeAt(i);
    if (c >= 48 && c <= 57) seen++;
  }
  return formatted.length;
}

export function targetDigitIndex(prevFormatted: string, prevCaret: number, nextRaw: string): number {
  const digitsBefore = countDigitsBefore(prevFormatted, prevCaret);
  const prevDigits = countDigits(prevFormatted);
  const nextDigits = countDigits(nextRaw);
  if (nextDigits > prevDigits) return digitsBefore + (nextDigits - prevDigits);
  if (nextDigits < prevDigits) return Math.max(0, digitsBefore - (prevDigits - nextDigits));
  return digitsBefore;
}
