/**
 * Normalizes an unknown thrown/rejected value into an `Error` instance.
 *
 * Use at catch/reject boundaries to avoid exposing arbitrary thrown values
 * (strings, objects, `undefined`) through a typed `Error` surface.
 */
export function toError(value: unknown): Error {
  return value instanceof Error ? value : new Error(String(value));
}
