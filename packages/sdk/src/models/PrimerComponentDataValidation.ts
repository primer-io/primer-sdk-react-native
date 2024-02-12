import { PrimerError } from "./PrimerError";
import { PrimerValidationError } from "./PrimerValidationError";

export type PrimerValidatingComponentData<T> = IPrimerValidatingComponentData<T>;
export type PrimerValidComponentData<T> = IPrimerValidComponentData<T>;
export type PrimerInvalidComponentData<T> = IPrimerInvalidComponentData<T>;
export type PrimerComponentDataValidationError<T> = IPrimerComponentDataValidationError<T>;

/**
 * Interface that indicates that data is currently in the process of being validated.
 */
interface IPrimerValidatingComponentData<T> {
    /**
     * The data being validated.
     */
    data: T;
}

/**
 * Interface that indicates that the data has been successfully validated.
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
 * Interface that represents an error that occurred during the validation process.
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