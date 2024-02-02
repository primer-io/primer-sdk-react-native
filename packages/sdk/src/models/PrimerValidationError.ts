export type PrimerValidationError = IPrimerValidationError;

export interface IPrimerValidationError {
    errorId: string;
    description: string;
    diagnosticsId: string;
}
