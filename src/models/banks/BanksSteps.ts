import type { IssuingBank } from '../IssuingBank';
import type { NamedComponentStep } from '../NamedComponentStep';

export type BanksStep = BanksLoading | BanksRetrieved;

/**
 * A type representing the loading of the bank list.
 */
export type BanksLoading = {
  stepName: 'banksLoading';
} & NamedComponentStep;

/**
 * A type representing the list of retrieved banks.
 */
export type BanksRetrieved = {
  stepName: 'banksRetrieved';
  /**
   *  The list of retrieved banks.
   */
  banks: IssuingBank[];
} & NamedComponentStep;
