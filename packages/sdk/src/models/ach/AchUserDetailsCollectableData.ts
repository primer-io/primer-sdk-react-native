import { NamedComponentValidatableData } from "../NamedComponentValidatableData";

export type AchUserDetailsValidatableData = AchFirstName | AchLastName | AchEmailAddress

/**
 * A type representing representing the customer's first name.
 */
export type AchFirstName = {
    validatableDataName: "firstName",
    value: String
} & NamedComponentValidatableData

/**
 * A type representing representing the customer's last name.
 */
export type AchLastName = {
    validatableDataName: "lastName",
    value: String
} & NamedComponentValidatableData

/**
 * A type representing representing the customer's email address.
 */
export type AchEmailAddress = {
    validatableDataName: "emailAddress",
    value: String
} & NamedComponentValidatableData