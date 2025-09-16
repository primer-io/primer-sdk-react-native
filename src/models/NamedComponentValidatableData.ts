export type NamedComponentValidatableData = INamedComponentValidatableData;

/**
 * A component-validatable data that can be identified via its name.
 */
interface INamedComponentValidatableData {
  /**
   * The name of this component-validatable data.
   */
  validatableDataName: string;
}
