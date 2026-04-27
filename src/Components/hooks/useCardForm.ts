import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePrimerCheckout } from './usePrimerCheckout';
import { useCardNetwork } from './useCardNetwork';
import { debounce, type DebouncedFunction } from '../../utils/debounce';
import { fmt } from '../internal/debug';
import { formatDigitsWithGaps, maxFormattedCardNumberLength, maxPanDigits } from '../internal/cardNetwork';
import type { CardFormField, CardFormErrors, UseCardFormOptions, UseCardFormReturn } from '../types/CardFormTypes';

const LOG = '[useCardForm]';
const DEBOUNCE_MS = 150;
const PAYMENT_METHOD_TYPE = 'PAYMENT_CARD';

function formatCardNumber(value: string, gapPattern: readonly number[], maxDigits: number): string {
  const digits = value.replace(/\D/g, '').slice(0, maxDigits);
  const out = formatDigitsWithGaps(digits, gapPattern);
  console.log(`${LOG} formatCardNumber ${fmt({ raw: value, digits, gapPattern, maxDigits, out })}`);
  return out;
}

function formatExpiryDate(value: string, previous: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (value.length < previous.length) {
    return digits;
  }
  if (digits.length >= 2) {
    return digits.slice(0, 2) + '/' + digits.slice(2);
  }
  return digits;
}

function formatCVV(value: string): string {
  return value.replace(/\D/g, '').slice(0, 4);
}

function stripCardNumberForNative(formatted: string): string {
  return formatted.replace(/\s/g, '');
}

// Display is MM/YY but Android's validator requires MM/YYYY; iOS accepts both.
// Expand only once the year is fully typed (4-char "MM/YY"); partial edits
// pass through unchanged so native can keep reporting "cannot be blank".
function expandExpiryYearForNative(formatted: string): string {
  const match = /^(\d{2})\/(\d{2})$/.exec(formatted);
  return match ? `${match[1]}/20${match[2]}` : formatted;
}

/**
 * Card form adapter hook. Reads validation state from the session-owned raw-data
 * manager on the provider; forwards field updates to it; surfaces a stable
 * submit() that the form renders behind its button.
 *
 * The native manager lifecycle lives on PrimerCheckoutProvider and is keyed by
 * `activeMethod`, which the method-selection screen sets when the user picks
 * a payment method. This hook deliberately does NOT touch `activeMethod`, so the
 * manager survives the card-form view's mount/unmount across nav transitions.
 */
export function useCardForm(options: UseCardFormOptions = {}): UseCardFormReturn {
  const { onValidationChange, onMetadataChange, onBinDataChange } = options;
  const {
    isReady,
    activeMethod,
    cardFormState,
    setRawData: providerSetRawData,
    submit: providerSubmit,
  } = usePrimerCheckout();

  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCVV] = useState('');
  const [cardholderName, setCardholderName] = useState('');

  const [touched, setTouched] = useState<Record<CardFormField, boolean>>({
    cardNumber: false,
    expiryDate: false,
    cvv: false,
    cardholderName: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onValidationChangeRef = useRef(onValidationChange);
  onValidationChangeRef.current = onValidationChange;
  const onBinDataChangeRef = useRef(onBinDataChange);
  onBinDataChangeRef.current = onBinDataChange;
  const onMetadataChangeRef = useRef(onMetadataChange);
  onMetadataChangeRef.current = onMetadataChange;

  useEffect(() => {
    onValidationChangeRef.current?.(cardFormState.isValid, cardFormState.errors);
  }, [cardFormState.isValid, cardFormState.errors]);
  useEffect(() => {
    if (cardFormState.binData) {
      onBinDataChangeRef.current?.(cardFormState.binData);
    }
  }, [cardFormState.binData]);
  useEffect(() => {
    if (cardFormState.metadata) {
      onMetadataChangeRef.current?.(cardFormState.metadata);
    }
  }, [cardFormState.metadata]);

  const fieldsRef = useRef({ cardNumber: '', expiryDate: '', cvv: '', cardholderName: '' });
  const debouncedRef = useRef<DebouncedFunction<
    (data: { cardNumber: string; expiryDate: string; cvv: string; cardholderName: string }) => void
  > | null>(null);

  useEffect(() => {
    debouncedRef.current = debounce(
      (data: { cardNumber: string; expiryDate: string; cvv: string; cardholderName: string }) => {
        providerSetRawData(data).catch((err) => {
          console.warn(`${LOG} setRawData error ${fmt(err)}`);
        });
      },
      DEBOUNCE_MS
    );
    return () => debouncedRef.current?.cancel();
  }, [providerSetRawData]);

  // Always include cardholderName in the payload — the native SDK's required-fields set
  // varies by client session; sending the field unconditionally keeps validation honest
  // regardless of whether the merchant has required it server-side.
  const syncToNative = useCallback(() => {
    const fields = fieldsRef.current;
    const data = {
      cardNumber: stripCardNumberForNative(fields.cardNumber),
      expiryDate: expandExpiryYearForNative(fields.expiryDate),
      cvv: fields.cvv,
      cardholderName: fields.cardholderName,
    };
    debouncedRef.current?.(data);
  }, []);

  // Descriptor resolves asynchronously (see useCardNetwork). Capture via a ref so
  // updateCardNumber's useCallback dep array doesn't re-close over descriptor each
  // render; the ref is refreshed below whenever descriptor changes.
  const { descriptor } = useCardNetwork();
  const descriptorRef = useRef(descriptor);
  descriptorRef.current = descriptor;

  const updateCardNumber = useCallback(
    (value: string) => {
      const d = descriptorRef.current;
      const gap = d?.gapPattern ?? [4, 8, 12];
      const max = d ? maxPanDigits(d) : 19;
      const formatted = formatCardNumber(value, gap, max);
      setCardNumber(formatted);
      fieldsRef.current.cardNumber = formatted;
      syncToNative();
    },
    [syncToNative]
  );

  const updateExpiryDate = useCallback(
    (value: string) => {
      const formatted = formatExpiryDate(value, fieldsRef.current.expiryDate);
      setExpiryDate(formatted);
      fieldsRef.current.expiryDate = formatted;
      syncToNative();
    },
    [syncToNative]
  );

  const updateCVV = useCallback(
    (value: string) => {
      const formatted = formatCVV(value);
      setCVV(formatted);
      fieldsRef.current.cvv = formatted;
      syncToNative();
    },
    [syncToNative]
  );

  const updateCardholderName = useCallback(
    (value: string) => {
      setCardholderName(value);
      fieldsRef.current.cardholderName = value;
      syncToNative();
    },
    [syncToNative]
  );

  const markFieldTouched = useCallback((field: CardFormField) => {
    setTouched((prev) => (prev[field] ? prev : { ...prev, [field]: true }));
  }, []);

  const errors = useMemo(() => {
    const visible: CardFormErrors = {};
    for (const field of Object.keys(cardFormState.errors) as CardFormField[]) {
      if (touched[field]) {
        visible[field] = cardFormState.errors[field];
      }
    }
    return visible;
  }, [cardFormState.errors, touched]);

  // Mid-typing re-format: when the detected network flips (e.g. first 4 digits
  // resolve to AMEX), reformat what's already in the field so spacing matches the
  // new gap pattern AND truncate if the new max is shorter (OTHER 19 → Amex 15).
  useEffect(() => {
    const currentDigits = fieldsRef.current.cardNumber.replace(/\D/g, '');
    if (!currentDigits) return;
    const maxDigits = maxPanDigits(descriptor);
    const truncated = currentDigits.slice(0, maxDigits);
    const reformatted = formatDigitsWithGaps(truncated, descriptor.gapPattern);
    if (reformatted === fieldsRef.current.cardNumber) return;
    console.log(
      `${LOG} reformat on network change ${fmt({ before: fieldsRef.current.cardNumber, after: reformatted, gapPattern: descriptor.gapPattern, maxDigits })}`
    );
    fieldsRef.current.cardNumber = reformatted;
    setCardNumber(reformatted);
    // If truncation actually dropped digits, tell native so validation matches
    // what the user sees.
    if (truncated.length !== currentDigits.length) syncToNative();
  }, [descriptor, syncToNative]);

  const isSubmittingRef = useRef(false);
  const submit = useCallback(async () => {
    if (!isReady || activeMethod !== PAYMENT_METHOD_TYPE) {
      console.warn(`${LOG} submit: not ready ${fmt({ isReady, activeMethod })}`);
      return;
    }
    if (isSubmittingRef.current) return;
    debouncedRef.current?.flush();
    if (!cardFormState.isValid) return;
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    try {
      await providerSubmit();
    } catch (err) {
      console.error(`${LOG} submit error ${fmt(err)}`);
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  }, [isReady, activeMethod, cardFormState.isValid, providerSubmit]);

  const reset = useCallback(() => {
    setCardNumber('');
    setExpiryDate('');
    setCVV('');
    setCardholderName('');
    setTouched({ cardNumber: false, expiryDate: false, cvv: false, cardholderName: false });
    setIsSubmitting(false);
    isSubmittingRef.current = false;
    fieldsRef.current = { cardNumber: '', expiryDate: '', cvv: '', cardholderName: '' };
    debouncedRef.current?.cancel();
    providerSetRawData({ cardNumber: '', expiryDate: '', cvv: '', cardholderName: '' }).catch(() => {});
  }, [providerSetRawData]);

  return {
    cardNumber,
    expiryDate,
    cvv,
    cardholderName,
    updateCardNumber,
    updateExpiryDate,
    updateCVV,
    updateCardholderName,
    isValid: cardFormState.isValid,
    errors,
    markFieldTouched,
    submit,
    isSubmitting,
    requiredFields: cardFormState.requiredFields,
    binData: cardFormState.binData,
    descriptor,
    cardNumberMaxLength: maxFormattedCardNumberLength(descriptor),
    reset,
  };
}
