import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { usePrimerCheckout } from '../../hooks/usePrimerCheckout';
import { usePrimerCardNetwork } from '../../hooks/usePrimerCardNetwork';
import { debounce, type DebouncedFunction } from '../../../utils/debounce';
import { PrimerError } from '../../../models/PrimerError';
import { formatDigitsWithGaps, maxFormattedCardNumberLength, maxPanDigits } from '../cardFormat';
import type { CardFormField, CardFormErrors, UsePrimerCardFormReturn } from '../../types/CardFormTypes';

const LOG = '[CardFormState]';
const DEBOUNCE_MS = 275;
const PAYMENT_METHOD_TYPE = 'PAYMENT_CARD';

function formatCardNumber(value: string, gapPattern: readonly number[], maxDigits: number): string {
  const digits = value.replace(/\D/g, '').slice(0, maxDigits);
  return formatDigitsWithGaps(digits, gapPattern);
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

function formatCVV(value: string, maxDigits: 3 | 4): string {
  return value.replace(/\D/g, '').slice(0, maxDigits);
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

const INITIAL_FOCUS: Record<CardFormField, boolean> = {
  cardNumber: false,
  expiryDate: false,
  cvv: false,
  cardholderName: false,
};

const CardFormStateContext = createContext<UsePrimerCardFormReturn | null>(null);

/**
 * Holds card-form state above the navigation stack so values survive screen
 * unmounts (e.g. when CardFormScreen is pushed past by the country selector).
 * Also gives every caller of `usePrimerCardForm()` the same singleton state.
 *
 * Consumes `PrimerCheckoutContext` for the native validation state + the
 * `setRawData` / `submit` dispatch surfaces, so it must mount below
 * `PrimerCheckoutProvider`.
 */
export function CardFormStateProvider({ children }: { children: ReactNode }) {
  const {
    isReady,
    activeMethod,
    cardFormState,
    clientSession,
    setRawData: providerSetRawData,
    submit: providerSubmit,
  } = usePrimerCheckout();

  // CARD_INFORMATION.options.cardHolderName === false hides the field. Any other shape
  // (no module, no options, or `true`) keeps it visible — matches native iOS/Android behavior.
  const isCardholderNameVisible = useMemo(() => {
    const module = clientSession?.checkoutModules?.find((m) => m.type === 'CARD_INFORMATION');
    return module?.options?.cardHolderName !== false;
  }, [clientSession]);

  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCVV] = useState('');
  const [cardholderName, setCardholderName] = useState('');

  const [hasBeenFocused, setHasBeenFocused] = useState<Record<CardFormField, boolean>>(INITIAL_FOCUS);
  const [hasBeenBlurred, setHasBeenBlurred] = useState<Record<CardFormField, boolean>>(INITIAL_FOCUS);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fieldsRef = useRef({ cardNumber: '', expiryDate: '', cvv: '', cardholderName: '' });
  const debouncedRef = useRef<DebouncedFunction<
    (data: { cardNumber: string; expiryDate: string; cvv: string; cardholderName: string }) => void
  > | null>(null);
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    debouncedRef.current = debounce(
      (data: { cardNumber: string; expiryDate: string; cvv: string; cardholderName: string }) => {
        providerSetRawData(data).catch(() => {
          // Provider already logs (sanitized); swallow to prevent unhandled rejection.
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

  // Descriptor resolves asynchronously (see usePrimerCardNetwork). Capture via a ref so
  // updateCardNumber's useCallback dep array doesn't re-close over descriptor each
  // render; the ref is refreshed below whenever descriptor changes.
  const { descriptor } = usePrimerCardNetwork();
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
      const formatted = formatCVV(value, descriptorRef.current.cvvLength);
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

  // Re-arm: focusing a previously-blurred field clears its blur flag so its error
  // disappears until the user blurs again. A submit attempt overrides this gate
  // so the user can't hide errors by tapping a field after a failed submit.
  const markFieldFocused = useCallback((field: CardFormField) => {
    setHasBeenFocused((prev) => (prev[field] ? prev : { ...prev, [field]: true }));
    setHasBeenBlurred((prev) => (!prev[field] ? prev : { ...prev, [field]: false }));
  }, []);

  const markFieldBlurred = useCallback((field: CardFormField) => {
    setHasBeenBlurred((prev) => (prev[field] ? prev : { ...prev, [field]: true }));
  }, []);

  const markSubmitAttempted = useCallback(() => {
    setSubmitAttempted(true);
  }, []);

  const errors = useMemo(() => {
    const visible: CardFormErrors = {};
    for (const field of Object.keys(cardFormState.errors) as CardFormField[]) {
      const show = submitAttempted || (hasBeenFocused[field] && hasBeenBlurred[field]);
      if (show) visible[field] = cardFormState.errors[field];
    }
    return visible;
  }, [cardFormState.errors, hasBeenFocused, hasBeenBlurred, submitAttempted]);

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
    fieldsRef.current.cardNumber = reformatted;
    setCardNumber(reformatted);
    // If truncation actually dropped digits, tell native so validation matches
    // what the user sees.
    if (truncated.length !== currentDigits.length) syncToNative();
  }, [descriptor, syncToNative]);

  const submit = useCallback(async () => {
    // Flip submit-attempted before any guard returns so a failed submit reveals every error.
    setSubmitAttempted(true);
    if (!isReady || activeMethod !== PAYMENT_METHOD_TYPE) return;
    if (isSubmittingRef.current) return;
    debouncedRef.current?.flush();
    if (!cardFormState.isValid) return;
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    try {
      await providerSubmit();
    } catch (err) {
      console.error(`${LOG} submit failed: ${err instanceof PrimerError ? err.errorId : 'unknown'}`);
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
    setHasBeenFocused(INITIAL_FOCUS);
    setHasBeenBlurred(INITIAL_FOCUS);
    setSubmitAttempted(false);
    setIsSubmitting(false);
    isSubmittingRef.current = false;
    fieldsRef.current = { cardNumber: '', expiryDate: '', cvv: '', cardholderName: '' };
    debouncedRef.current?.cancel();
    providerSetRawData({ cardNumber: '', expiryDate: '', cvv: '', cardholderName: '' }).catch(() => {});
  }, [providerSetRawData]);

  const value = useMemo<UsePrimerCardFormReturn>(
    () => ({
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
      markFieldFocused,
      markFieldBlurred,
      markSubmitAttempted,
      submit,
      isSubmitting,
      submitAttempted,
      requiredFields: cardFormState.requiredFields,
      binData: cardFormState.binData,
      descriptor,
      cardNumberMaxLength: maxFormattedCardNumberLength(descriptor),
      isCardholderNameVisible,
      reset,
    }),
    [
      cardNumber,
      expiryDate,
      cvv,
      cardholderName,
      updateCardNumber,
      updateExpiryDate,
      updateCVV,
      updateCardholderName,
      cardFormState.isValid,
      cardFormState.requiredFields,
      cardFormState.binData,
      errors,
      markFieldFocused,
      markFieldBlurred,
      markSubmitAttempted,
      submit,
      isSubmitting,
      submitAttempted,
      descriptor,
      isCardholderNameVisible,
      reset,
    ]
  );

  return <CardFormStateContext.Provider value={value}>{children}</CardFormStateContext.Provider>;
}

export function useCardFormStateContext(): UsePrimerCardFormReturn | null {
  return useContext(CardFormStateContext);
}
