import type { PrimerClientSession } from '../../models/PrimerClientSession';
import type { BillingAddressField } from '../types/BillingAddressFormTypes';

const BILLING_ADDRESS_FIELDS: ReadonlyArray<BillingAddressField> = [
  'firstName',
  'lastName',
  'addressLine1',
  'addressLine2',
  'city',
  'state',
  'postalCode',
  'countryCode',
];

export type BillingAddressVisibility = Record<BillingAddressField, boolean>;

export interface BillingAddressVisibilityResult {
  fields: BillingAddressVisibility;
  sectionVisible: boolean;
}

const ALL_HIDDEN: BillingAddressVisibility = {
  firstName: false,
  lastName: false,
  addressLine1: false,
  addressLine2: false,
  city: false,
  state: false,
  postalCode: false,
  countryCode: false,
};

export function getBillingAddressVisibility(
  session: PrimerClientSession | null | undefined
): BillingAddressVisibilityResult {
  const module = session?.checkoutModules?.find((m) => m.type === 'BILLING_ADDRESS');
  const options = module?.options ?? {};
  const fields = BILLING_ADDRESS_FIELDS.reduce<BillingAddressVisibility>(
    (acc, f) => {
      acc[f] = options[f] === true;
      return acc;
    },
    { ...ALL_HIDDEN }
  );
  const sectionVisible = Object.values(fields).some(Boolean);
  return { fields, sectionVisible };
}
