import { useEffect, useRef } from 'react';
import { useCardFormStateContext } from '../internal/form-state/CardFormStateProvider';
import { usePrimerCheckout } from './usePrimerCheckout';
import type { UseCardFormOptions, UsePrimerCardFormReturn } from '../types/CardFormTypes';

/**
 * Card form adapter hook. Thin wrapper over `CardFormStateProvider` — the
 * provider owns the field state, focus tracking, debouncer, and submit lifecycle.
 * This hook reads the shared state and wires per-caller option callbacks
 * (`onValidationChange`, `onBinDataChange`, `onMetadataChange`).
 *
 * Must be used inside a `<PrimerCheckoutProvider>` tree that also mounts
 * `<CardFormStateProvider>` (the drop-in `CheckoutFlow` does this for you).
 */
export function usePrimerCardForm(options: UseCardFormOptions = {}): UsePrimerCardFormReturn {
  const state = useCardFormStateContext();
  if (!state) {
    throw new Error(
      'usePrimerCardForm must be used within a <CardFormStateProvider>. ' +
        'The built-in <PrimerCheckoutSheet>/<CheckoutFlow> wires this automatically.'
    );
  }

  const { cardFormState } = usePrimerCheckout();

  const onValidationChangeRef = useRef(options.onValidationChange);
  onValidationChangeRef.current = options.onValidationChange;
  const onBinDataChangeRef = useRef(options.onBinDataChange);
  onBinDataChangeRef.current = options.onBinDataChange;
  const onMetadataChangeRef = useRef(options.onMetadataChange);
  onMetadataChangeRef.current = options.onMetadataChange;

  useEffect(() => {
    onValidationChangeRef.current?.(state.isValid, state.errors);
  }, [state.isValid, state.errors]);

  useEffect(() => {
    if (state.binData) {
      onBinDataChangeRef.current?.(state.binData);
    }
  }, [state.binData]);

  useEffect(() => {
    if (cardFormState.metadata) {
      onMetadataChangeRef.current?.(cardFormState.metadata);
    }
  }, [cardFormState.metadata]);

  return state;
}
