import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { usePrimerCheckout } from '../../hooks/usePrimerCheckout';
import { debounce, type DebouncedFunction } from '../../../utils/debounce';
import { fmt } from '../debug';
import type { CardFormField, CardFormErrors, UseCardFormReturn } from '../../types/CardFormTypes';

const LOG = '[CardFormState]';
const DEBOUNCE_MS = 150;
const PAYMENT_METHOD_TYPE = 'PAYMENT_CARD';

function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
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

const INITIAL_TOUCHED: Record<CardFormField, boolean> = {
  cardNumber: false,
  expiryDate: false,
  cvv: false,
  cardholderName: false,
};

const CardFormStateContext = createContext<UseCardFormReturn | null>(null);

/**
 * Holds card-form state above the navigation stack so values survive screen
 * unmounts (e.g. when CardFormScreen is pushed past by the country selector).
 * Also gives every caller of `useCardForm()` the same singleton state.
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
    setRawData: providerSetRawData,
    submit: providerSubmit,
  } = usePrimerCheckout();

  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCVV] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [touched, setTouched] = useState<Record<CardFormField, boolean>>(INITIAL_TOUCHED);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fieldsRef = useRef({ cardNumber: '', expiryDate: '', cvv: '', cardholderName: '' });
  const debouncedRef = useRef<DebouncedFunction<
    (data: { cardNumber: string; expiryDate: string; cvv: string; cardholderName: string }) => void
  > | null>(null);
  const isSubmittingRef = useRef(false);

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

  const updateCardNumber = useCallback(
    (value: string) => {
      const formatted = formatCardNumber(value);
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
    setTouched(INITIAL_TOUCHED);
    setIsSubmitting(false);
    isSubmittingRef.current = false;
    fieldsRef.current = { cardNumber: '', expiryDate: '', cvv: '', cardholderName: '' };
    debouncedRef.current?.cancel();
    providerSetRawData({ cardNumber: '', expiryDate: '', cvv: '', cardholderName: '' }).catch(() => {});
  }, [providerSetRawData]);

  const value = useMemo<UseCardFormReturn>(
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
      markFieldTouched,
      submit,
      isSubmitting,
      requiredFields: cardFormState.requiredFields,
      binData: cardFormState.binData,
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
      markFieldTouched,
      submit,
      isSubmitting,
      reset,
    ]
  );

  return <CardFormStateContext.Provider value={value}>{children}</CardFormStateContext.Provider>;
}

export function useCardFormStateContext(): UseCardFormReturn | null {
  return useContext(CardFormStateContext);
}
