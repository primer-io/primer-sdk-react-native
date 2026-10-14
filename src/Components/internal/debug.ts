/** Single-line formatter for console logs. Handles Error stacks and JSON circular refs. */
export function fmt(value: unknown): string {
  if (value instanceof Error) {
    return value.stack ? `${value.message}\n${value.stack}` : value.message;
  }
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}
