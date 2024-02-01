import { PrimerError } from "./PrimerError";

export type PrimerValidatingComponentData<T> = IPrimerValidatingComponentData<T>;
export type PrimerValidComponentData<T> = IPrimerValidComponentData<T>;
export type PrimerInvalidComponentData<T> = IPrimerInvalidComponentData<T>;
export type PrimerComponentDataValidationError<T> = IPrimerComponentDataValidationError<T>;
export type PrimerValidationError = IPrimerValidationError;

/**
 * Indicates that data is currently in the process of being validated.
 */
interface IPrimerValidatingComponentData<T> {
    /**
     * The data being validated.
     */
    data: T;
}

/**
 * Indicates that the data has successfully been validated.
 */
interface IPrimerValidComponentData<T> {
    /**
     * The successfully validated data.
     */
    data: T;
}

/**
 * Interface that indicates that the data has been considered invalid after validation.
 */
interface IPrimerInvalidComponentData<T> {
    /**
    * The data that failed validation.
    */
    data: T;

    /**
     *  A list of PrimerValidationError explaining why the data is
     *  considered invalid.
     */
    errors: PrimerValidationError[];
}

/**
 * Represents the status when an error occurred during the validation process.
 */
interface IPrimerComponentDataValidationError<T> {
    /**
     * The data for which an error ocurred during validation.
     */
    data: T;


    /**
     * The PrimerError that ocurred during the validation attempt.
     */
    error: PrimerError;
}

interface IPrimerValidationError {
    errorId?: string | null;
    description?: string | null;
    inputElementType?: string | null;
    diagnosticsId?: string | null;
}