export type PrimerValidationError = IPrimerValidationError;

export interface IPrimerValidationError {
    errorId: String;
    description: String;
    diagnosticsId: String;
}
