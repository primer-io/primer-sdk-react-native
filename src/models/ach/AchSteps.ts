import { NamedComponentStep } from '../NamedComponentStep';

export type AchStep = AchUserDetailsStep;

export type AchUserDetailsStep = UserDetailsRetrieved | UserDetailsCollected;

/**
 * A type representing the retrieved user details.
 */
export type UserDetailsRetrieved = {
  stepName: 'userDetailsRetrieved';
  /**
   * The first name previously sent on client session creation.
   */
  firstName: string;
  /**
   * The last name previously sent on client session creation.
   */
  lastName: string;
  /**
   * The email address previously sent on client session creation.
   */
  emailAddress: string;
} & NamedComponentStep;

/**
 * A type representing the collected user details.
 */
export type UserDetailsCollected = { stepName: 'userDetailsCollected' } & NamedComponentStep;
