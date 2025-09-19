import { NamedComponentValidatableData } from '../NamedComponentValidatableData';

export type AchValidatableData = AchUserDetailsValidatableData;

export type AchUserDetailsValidatableData = AchFirstName | AchLastName | AchEmailAddress;

/**
 * A type representing representing the customer's first name.
 */
export type AchFirstName = {
  validatableDataName: 'firstName';
  value: string;
} & NamedComponentValidatableData;

/**
 * A type representing representing the customer's last name.
 */
export type AchLastName = {
  validatableDataName: 'lastName';
  value: string;
} & NamedComponentValidatableData;

/**
 * A type representing representing the customer's email address.
 */
export type AchEmailAddress = {
  validatableDataName: 'emailAddress';
  value: string;
} & NamedComponentValidatableData;
