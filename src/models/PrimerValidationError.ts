export type PrimerValidationError = IPrimerValidationError;

export interface IPrimerValidationError {
  errorId?: string;
  description?: string;
  diagnosticsId?: string;
}

export type PrimerInputValidationError = IPrimerInputValidationError;

export interface IPrimerInputValidationError extends IPrimerValidationError {
  // Both platforms always send these: iOS sets them in every branch of `Error.rnError`, and
  // Android's `PrimerInputValidationError` declares them non-null.
  errorId: string;
  description: string;
  /**
   * The input element native rejected. Absent when native threw rather than rejecting a field,
   * in which case `description` is an SDK diagnostic and not shopper-facing copy.
   *
   * A wire string rather than `PrimerInputElementType`: iOS reports BLIK's code as `OTP`,
   * Android as `OTP_CODE`.
   */
  inputElementType?: string;
}
