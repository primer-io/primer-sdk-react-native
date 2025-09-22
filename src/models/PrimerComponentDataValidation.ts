import type { NamedComponentValidatableData } from './NamedComponentValidatableData';
import { PrimerError } from './PrimerError';
import type { PrimerValidationError } from './PrimerValidationError';

export type PrimerValidatingComponentData<T extends NamedComponentValidatableData> = IPrimerValidatingComponentData<T>;
export type PrimerValidComponentData<T extends NamedComponentValidatableData> = IPrimerValidComponentData<T>;
export type PrimerInvalidComponentData<T extends NamedComponentValidatableData> = IPrimerInvalidComponentData<T>;
export type PrimerComponentDataValidationError<T extends NamedComponentValidatableData> =
  IPrimerComponentDataValidationError<T>;

/**
 * Interface that indicates that data is currently in the process of being validated.
 */
interface IPrimerValidatingComponentData<T extends NamedComponentValidatableData> {
  /**
   * The data being validated.
   */
  data: T;
}

/**
 * Interface that indicates that the data has been successfully validated.
 */
interface IPrimerValidComponentData<T extends NamedComponentValidatableData> {
  /**
   * The successfully validated data.
   */
  data: T;
}

/**
 * Interface that indicates that the data has been considered invalid after validation.
 */
interface IPrimerInvalidComponentData<T extends NamedComponentValidatableData> {
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
interface IPrimerComponentDataValidationError<T extends NamedComponentValidatableData> {
  /**
   * The data for which an error ocurred during validation.
   */
  data: T;

  /**
   * The PrimerError that ocurred during the validation attempt.
   */
  error: PrimerError;
}
