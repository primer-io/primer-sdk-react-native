import { NamedComponentStep } from "../NamedComponentStep";

export type AchUserDetailsStep = UserDetailsRetrieved | UserDetailsCollected

/**
 * A type representing the retrieved user details.
 */
export type UserDetailsRetrieved = {
    stepName: "userDetailsRetrieved",
    /**
     * The first name previously sent on client session creation.
     */
    firstName: String,
    /**
     * The first name previously sent on client session creation.
     */
    lastName: String,
    /**
     * The email address previously sent on client session creation.
     */
    emailAddress: String
} & NamedComponentStep

/**
 * A type representing the collected user details.
 */
export type UserDetailsCollected = { stepName: "userDetailsCollected" } & NamedComponentStep;