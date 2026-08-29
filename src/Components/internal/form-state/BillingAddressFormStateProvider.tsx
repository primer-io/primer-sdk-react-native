import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { usePrimerCheckout } from '../../hooks/usePrimerCheckout';
import { debounce, type DebouncedFunction } from '../../../utils/debounce';
import { fmt } from '../debug';
import { getBillingAddressVisibility } from '../billingAddressOptions';
import type { PrimerAddress } from '../../../models/PrimerClientSession';
import type {
  BillingAddressField,
  BillingAddressFormErrors,
  UsePrimerBillingAddressFormReturn,
} from '../../types/BillingAddressFormTypes';

const LOG = '[BillingAddressFormState]';
const DEBOUNCE_MS = 275;

interface BillingFields {
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  countryCode: string;
}

const EMPTY_FIELDS: BillingFields = {
  firstName: '',
  lastName: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  countryCode: '',
};

const EMPTY_TOUCHED: Record<BillingAddressField, boolean> = {
  firstName: false,
  lastName: false,
  addressLine1: false,
  addressLine2: false,
  city: false,
  state: false,
  postalCode: false,
  countryCode: false,
};

const REQUIRED_FIELDS: BillingAddressField[] = [
  'firstName',
  'lastName',
  'addressLine1',
  'city',
  'state',
  'postalCode',
  'countryCode',
];

function fieldsToAddress(fields: BillingFields): PrimerAddress {
  return {
    firstName: fields.firstName || undefined,
    lastName: fields.lastName || undefined,
    addressLine1: fields.addressLine1 || undefined,
    addressLine2: fields.addressLine2 || undefined,
    city: fields.city || undefined,
    state: fields.state || undefined,
    postalCode: fields.postalCode || undefined,
    countryCode: fields.countryCode || undefined,
  };
}

const BillingAddressFormStateContext = createContext<UsePrimerBillingAddressFormReturn | null>(null);

/**
 * Holds billing-address state above the navigation stack so values survive screen
 * unmounts (specifically: CardFormScreen unmounts when CountrySelectorScreen is
 * pushed on top). Also means every `usePrimerBillingAddressForm()` call shares the same
 * state — the country selector can write while the form screen reads.
 */
export function BillingAddressFormStateProvider({ children }: { children: ReactNode }) {
  const { setBillingAddress: providerSetBillingAddress, clientSession } = usePrimerCheckout();

  const { fields: visibleFields, sectionVisible } = useMemo(
    () => getBillingAddressVisibility(clientSession),
    [clientSession]
  );

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [stateValue, setStateValue] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [countryCode, setCountryCode] = useState('');
  const [touched, setTouched] = useState<Record<BillingAddressField, boolean>>(EMPTY_TOUCHED);

  const fieldsRef = useRef<BillingFields>({ ...EMPTY_FIELDS });
  const debouncedRef = useRef<DebouncedFunction<(address: PrimerAddress) => void> | null>(null);
  // Prefill from clientSession.customer.billingAddress runs at most once per provider
  // lifecycle. Subsequent client-session updates do not re-seed fields — otherwise the
  // shopper's edits would be clobbered every time the session refreshes.
  const hasPrefilledRef = useRef(false);

  useEffect(() => {
    if (hasPrefilledRef.current) return;
    const initial = clientSession?.customer?.billingAddress;
    if (!initial) return;

    const next: BillingFields = { ...fieldsRef.current };
    let changed = false;
    (Object.keys(EMPTY_FIELDS) as BillingAddressField[]).forEach((field) => {
      const value = initial[field];
      if (typeof value === 'string' && value.length > 0 && next[field] === '') {
        next[field] = value;
        changed = true;
      }
    });
    if (!changed) return;

    fieldsRef.current = next;
    setFirstName(next.firstName);
    setLastName(next.lastName);
    setAddressLine1(next.addressLine1);
    setAddressLine2(next.addressLine2);
    setCity(next.city);
    setStateValue(next.state);
    setPostalCode(next.postalCode);
    setCountryCode(next.countryCode);
    hasPrefilledRef.current = true;
  }, [clientSession]);

  useEffect(() => {
    debouncedRef.current = debounce((address: PrimerAddress) => {
      providerSetBillingAddress(address).catch((err) => {
        console.warn(`${LOG} setBillingAddress error ${fmt(err)}`);
      });
    }, DEBOUNCE_MS);
    return () => debouncedRef.current?.cancel();
  }, [providerSetBillingAddress]);

  const syncToNative = useCallback(() => {
    debouncedRef.current?.(fieldsToAddress(fieldsRef.current));
  }, []);

  const makeUpdater = useCallback(
    (field: BillingAddressField, setState: (value: string) => void) => {
      return (value: string) => {
        setState(value);
        fieldsRef.current = { ...fieldsRef.current, [field]: value };
        syncToNative();
      };
    },
    [syncToNative]
  );

  const updateFirstName = useMemo(() => makeUpdater('firstName', setFirstName), [makeUpdater]);
  const updateLastName = useMemo(() => makeUpdater('lastName', setLastName), [makeUpdater]);
  const updateAddressLine1 = useMemo(() => makeUpdater('addressLine1', setAddressLine1), [makeUpdater]);
  const updateAddressLine2 = useMemo(() => makeUpdater('addressLine2', setAddressLine2), [makeUpdater]);
  const updateCity = useMemo(() => makeUpdater('city', setCity), [makeUpdater]);
  const updateState = useMemo(() => makeUpdater('state', setStateValue), [makeUpdater]);
  const updatePostalCode = useMemo(() => makeUpdater('postalCode', setPostalCode), [makeUpdater]);
  const updateCountryCode = useMemo(() => makeUpdater('countryCode', setCountryCode), [makeUpdater]);

  const markFieldTouched = useCallback((field: BillingAddressField) => {
    setTouched((prev) => (prev[field] ? prev : { ...prev, [field]: true }));
  }, []);

  const currentFields: BillingFields = {
    firstName,
    lastName,
    addressLine1,
    addressLine2,
    city,
    state: stateValue,
    postalCode,
    countryCode,
  };

  const effectiveRequired = useMemo(() => REQUIRED_FIELDS.filter((f) => visibleFields[f]), [visibleFields]);

  const isValid = useMemo(
    () => effectiveRequired.every((f) => currentFields[f].trim().length > 0),
    [effectiveRequired, firstName, lastName, addressLine1, city, stateValue, postalCode, countryCode]
  );

  const errors = useMemo(() => {
    const visible: BillingAddressFormErrors = {};
    for (const field of effectiveRequired) {
      if (touched[field] && currentFields[field].trim().length === 0) {
        visible[field] = 'required';
      }
    }
    return visible;
  }, [effectiveRequired, touched, firstName, lastName, addressLine1, city, stateValue, postalCode, countryCode]);

  const flush = useCallback(async () => {
    debouncedRef.current?.flush();
    try {
      await providerSetBillingAddress(fieldsToAddress(fieldsRef.current));
    } catch (err) {
      console.warn(`${LOG} flush error ${fmt(err)}`);
    }
  }, [providerSetBillingAddress]);

  const getAddress = useCallback((): PrimerAddress => fieldsToAddress(fieldsRef.current), []);

  const reset = useCallback(() => {
    setFirstName('');
    setLastName('');
    setAddressLine1('');
    setAddressLine2('');
    setCity('');
    setStateValue('');
    setPostalCode('');
    setCountryCode('');
    setTouched(EMPTY_TOUCHED);
    fieldsRef.current = { ...EMPTY_FIELDS };
    debouncedRef.current?.cancel();
  }, []);

  const value = useMemo<UsePrimerBillingAddressFormReturn>(
    () => ({
      firstName,
      lastName,
      addressLine1,
      addressLine2,
      city,
      state: stateValue,
      postalCode,
      countryCode,
      updateFirstName,
      updateLastName,
      updateAddressLine1,
      updateAddressLine2,
      updateCity,
      updateState,
      updatePostalCode,
      updateCountryCode,
      isValid,
      errors,
      markFieldTouched,
      visibleFields,
      sectionVisible,
      flush,
      getAddress,
      reset,
    }),
    [
      firstName,
      lastName,
      addressLine1,
      addressLine2,
      city,
      stateValue,
      postalCode,
      countryCode,
      updateFirstName,
      updateLastName,
      updateAddressLine1,
      updateAddressLine2,
      updateCity,
      updateState,
      updatePostalCode,
      updateCountryCode,
      isValid,
      errors,
      markFieldTouched,
      visibleFields,
      sectionVisible,
      flush,
      getAddress,
      reset,
    ]
  );

  return <BillingAddressFormStateContext.Provider value={value}>{children}</BillingAddressFormStateContext.Provider>;
}

export function useBillingAddressFormStateContext(): UsePrimerBillingAddressFormReturn | null {
  return useContext(BillingAddressFormStateContext);
}
