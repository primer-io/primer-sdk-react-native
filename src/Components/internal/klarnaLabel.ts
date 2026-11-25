const KLARNA = 'Klarna';

/** The words on either side of the Klarna badge; null when that side is empty. */
export interface KlarnaLabelParts {
  before: string | null;
  after: string | null;
}

/**
 * Splits the translated "Pay with Klarna" at its first "Klarna", where the button draws the badge,
 * so each language keeps its own word order ("Klarna ile öde", "Mit Klarna bezahlen"). A label
 * without the word gives the badge alone.
 */
export function splitKlarnaLabel(label: string): KlarnaLabelParts {
  const index = label.indexOf(KLARNA);
  if (index < 0) return { before: null, after: null };
  const before = label.slice(0, index).trim();
  const after = label.slice(index + KLARNA.length).trim();
  return { before: before || null, after: after || null };
}
