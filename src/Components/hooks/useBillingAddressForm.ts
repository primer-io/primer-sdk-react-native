import { useEffect, useRef } from 'react';
import { useBillingAddressFormStateContext } from '../internal/form-state/BillingAddressFormStateProvider';
import type { UseBillingAddressFormOptions, UseBillingAddressFormReturn } from '../types/BillingAddressFormTypes';

/**
 * Billing-address form adapter hook. Thin wrapper over
 * `BillingAddressFormStateProvider` — the provider owns the field state,
 * touched map, and debouncer. This hook reads the shared state and wires the
 * per-caller `onValidationChange` callback.
 *
 * Must be used inside a `<PrimerCheckoutProvider>` tree that also mounts
 * `<BillingAddressFormStateProvider>` (the drop-in `CheckoutFlow` does this
 * for you).
 */
export function useBillingAddressForm(options: UseBillingAddressFormOptions = {}): UseBillingAddressFormReturn {
  const state = useBillingAddressFormStateContext();
  if (!state) {
    throw new Error(
      'useBillingAddressForm must be used within a <BillingAddressFormStateProvider>. ' +
        'The built-in <PrimerCheckoutSheet>/<CheckoutFlow> wires this automatically.'
    );
  }

  const onValidationChangeRef = useRef(options.onValidationChange);
  onValidationChangeRef.current = options.onValidationChange;

  useEffect(() => {
    onValidationChangeRef.current?.(state.isValid, state.errors);
  }, [state.isValid, state.errors]);

  return state;
}
