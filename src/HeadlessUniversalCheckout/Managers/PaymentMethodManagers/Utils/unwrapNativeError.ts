import { PrimerError } from '../../../../models/PrimerError';

/**
 * Native error events arrive as { errors: [...] } (component channel) or { error } (global
 * bridge); normalize either to a bare PrimerError. Undefined only if an errors array is empty.
 */
export function unwrapNativeError(
  data: PrimerError | { error: PrimerError } | { errors: PrimerError[] }
): PrimerError | undefined {
  return 'errors' in data ? data.errors[0] : 'error' in data ? data.error : data;
}
