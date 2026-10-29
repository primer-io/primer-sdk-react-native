export type PrimerValidationError = IPrimerValidationError;

export interface IPrimerValidationError {
  errorId?: string;
  description?: string;
  diagnosticsId?: string;
}

export type PrimerInputValidationError = IPrimerInputValidationError;

export interface IPrimerInputValidationError extends IPrimerValidationError {
  errorId: string;
  description: string;
  inputElementType?: string;
}
