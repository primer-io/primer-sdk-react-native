// Maps an ISO 3166-1 alpha-2 code to its regional-indicator emoji flag. Works
// out of the box on iOS and Android 8+ via the system emoji font. Returns an
// empty string for falsy / non-2-letter codes so callers can render a neutral
// fallback without branching.

const REGIONAL_INDICATOR_A = 0x1f1e6;
const UPPERCASE_A = 'A'.charCodeAt(0);

export function flagEmoji(code: string | undefined | null): string {
  if (!code || code.length !== 2) return '';
  const upper = code.toUpperCase();
  const first = upper.charCodeAt(0);
  const second = upper.charCodeAt(1);
  if (first < UPPERCASE_A || first > UPPERCASE_A + 25) return '';
  if (second < UPPERCASE_A || second > UPPERCASE_A + 25) return '';
  return (
    String.fromCodePoint(REGIONAL_INDICATOR_A + (first - UPPERCASE_A)) +
    String.fromCodePoint(REGIONAL_INDICATOR_A + (second - UPPERCASE_A))
  );
}
