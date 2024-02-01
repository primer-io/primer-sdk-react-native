export type BankId = IBankId;
export type BankListFilter = IBankListFilter;

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