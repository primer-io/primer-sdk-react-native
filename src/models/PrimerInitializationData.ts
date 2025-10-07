import type { RetailOutletsRetail } from './RetailOutletsRetail';

export type PrimerInitializationData = IPrimerInitializationData;

interface IPrimerInitializationData {}

export type RetailOutletsList = IRetailOutletsList;

interface IRetailOutletsList extends IPrimerInitializationData {
  result: [RetailOutletsRetail];
}
