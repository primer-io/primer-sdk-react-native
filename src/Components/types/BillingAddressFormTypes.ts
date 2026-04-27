import type { StyleProp, ViewStyle } from 'react-native';
import type { PrimerAddress } from '../../models/PrimerClientSession';
import type { BillingAddressVisibility } from '../internal/billingAddressOptions';

export type BillingAddressField =
  | 'firstName'
  | 'lastName'
  | 'addressLine1'
  | 'addressLine2'
  | 'city'
  | 'state'
  | 'postalCode'
  | 'countryCode';

export type BillingAddressFormErrors = Partial<Record<BillingAddressField, string>>;

export interface UseBillingAddressFormOptions {
  /** Called when the billing-address validity changes. */
  onValidationChange?: (isValid: boolean, errors: BillingAddressFormErrors) => void;
}

export interface UseBillingAddressFormReturn {
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  countryCode: string;

  updateFirstName: (value: string) => void;
  updateLastName: (value: string) => void;
  updateAddressLine1: (value: string) => void;
  updateAddressLine2: (value: string) => void;
  updateCity: (value: string) => void;
  updateState: (value: string) => void;
  updatePostalCode: (value: string) => void;
  updateCountryCode: (value: string) => void;

  /** Overall validity — all visible required fields are non-blank. */
  isValid: boolean;
  /** Per-field errors, surfaced only for touched + visible required fields. */
  errors: BillingAddressFormErrors;
  /** Marks a field as touched so its error can appear on blur. */
  markFieldTouched: (field: BillingAddressField) => void;

  /** Per-field visibility derived from the client session's `BILLING_ADDRESS` checkout module. */
  visibleFields: BillingAddressVisibility;
  /** Whether any billing field is visible. False ⇒ host should hide the entire billing block. */
  sectionVisible: boolean;

  /** Flush any pending debounced `setBillingAddress` call to the native manager. */
  flush: () => Promise<void>;

  /** Snapshot of the current fields as a `PrimerAddress`. */
  getAddress: () => PrimerAddress;

  /** Clear all fields and reset local state. */
  reset: () => void;
}

/** Merchant-facing props for the composed `<PrimerBillingAddressForm />` component. */
export interface PrimerBillingAddressFormProps {
  /**
   * The billing-address state returned by `useBillingAddressForm()`. Hoisted so the host screen
   * can share it with a Pay button rendered outside the form and coordinate submission with
   * other forms (e.g. the card form).
   */
  billingForm: UseBillingAddressFormReturn;
  /** Optional outer container style. */
  style?: StyleProp<ViewStyle>;
  /** Test ID root for the form. Nested elements derive suffixed IDs. */
  testID?: string;
}
