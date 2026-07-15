import { PrimerError } from '../../../../models/PrimerError';

// Native onError payloads: { errors: [...] } (component) or { error } (global) → bare PrimerError; undefined if errors is empty.
export function unwrapNativeError(
  data: PrimerError | { error: PrimerError } | { errors: PrimerError[] }
): PrimerError | undefined {
  return 'errors' in data ? data.errors[0] : 'error' in data ? data.error : data;
}
