import { NamedComponentValidatableData } from "../NamedComponentValidatableData";

export type BanksValidatableData = BankListFilter | BankId

/**
 * A type representing the bank list filter.
 */
export type BankListFilter = {
    validatableDataName: "bankListFilter",
    /**
     * The text to filter the bank list by.
     */
    text: string
} & NamedComponentValidatableData

/**
 * A type representing the id of the selected bank.
 */
export type BankId = {
    validatableDataName: "bankId",
    /**
     * The id of the selected bank.
     */
    id: string
} & NamedComponentValidatableData