import { PrimerValidationError } from "./PrimerValidationError";

export type PrimerValidationErrorResult = IPrimerValidationErrorResult;

export interface IPrimerValidationErrorResult {
    validationErrors: PrimerValidationError[]
}
