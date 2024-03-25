export type NamedComponentStep = INamedComponentStep;

/**
 * A component step that can only be identified via its name due to its lack of properties.
 */
interface INamedComponentStep {
    /**
     * The name of this component step.
     */
    stepName: string
}