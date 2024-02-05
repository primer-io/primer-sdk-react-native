export type BankId = IBankId;
export type BankListFilter = IBankListFilter;
export type NamedComponentStep = INamedComponentStep;

/**
 * Interface representing the id of the selected bank.
 */
interface IBankId {
    /**
     * The id of the selected bank.
     */
    id: string;
}

/**
 * Interface representing the bank list filter.
 */
interface IBankListFilter {
    /**
     * The text to filter the bank list by.
     */
    text: string;
}


/**
 * A component step that can only be identified via its name due to its lack of properties.
 */
interface INamedComponentStep {
    /**
     * The name of this component step.
     */
    name: string
}