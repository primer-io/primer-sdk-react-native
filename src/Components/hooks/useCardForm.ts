import { useState, useCallback, useRef, useMemo } from 'react';
import { usePrimerCheckout } from './usePrimerCheckout';
import { useRawDataManagerBridge } from '../internal/useRawDataManagerBridge';
import { debounce } from '../../utils/debounce';
import type { PrimerBinData } from '../../models/PrimerBinData';
import type {
  CardFormField,
  CardFormErrors,
  UseCardFormOptions,
  UseCardFormReturn,
} from '../../models/components/CardFormTypes';

const DEBOUNCE_MS = 150;

function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
}

function formatExpiryDate(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4);
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

export function useCardForm(options: UseCardFormOptions = {}): UseCardFormReturn {
  const { collectCardholderName = false, onValidationChange, onMetadataChange, onBinDataChange } = options;
  const { isReady } = usePrimerCheckout();

  // Field state
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCVV] = useState('');
  const [cardholderName, setCardholderName] = useState('');

  // Validation state
  const [isValid, setIsValid] = useState(false);
  const [allErrors, setAllErrors] = useState<CardFormErrors>({});
  const [touched, setTouched] = useState<Record<CardFormField, boolean>>({
    cardNumber: false,
    expiryDate: false,
    cvv: false,
    cardholderName: false,
  });

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // BIN data
  const [binData, setBinData] = useState<PrimerBinData | null>(null);

  // Callback refs for stability
  const onValidationChangeRef = useRef(onValidationChange);
  onValidationChangeRef.current = onValidationChange;
  const onBinDataChangeRef = useRef(onBinDataChange);
  onBinDataChangeRef.current = onBinDataChange;

  // Bridge hook
  const bridge = useRawDataManagerBridge({
    paymentMethodType: 'PAYMENT_CARD',
    enabled: isReady,
    onValidation: useCallback((valid: boolean, errors: CardFormErrors) => {
      setIsValid(valid);
      setAllErrors(errors);
      onValidationChangeRef.current?.(valid, errors);
    }, []),
    onMetadataChange,
    onBinDataChange: useCallback((data: PrimerBinData) => {
      setBinData(data);
      onBinDataChangeRef.current?.(data);
    }, []),
  });

  // Debounced sync to native
  const debouncedSetRawData = useMemo(
    () =>
      debounce((data: { cardNumber: string; expiryDate: string; cvv: string; cardholderName?: string }) => {
        bridge.setRawData(data).catch(() => {});
      }, DEBOUNCE_MS),
    [bridge.setRawData]
  );

  // Field refs for sync
  const fieldsRef = useRef({ cardNumber: '', expiryDate: '', cvv: '', cardholderName: '' });

  const syncToNative = useCallback(() => {
    const fields = fieldsRef.current;
    const data: { cardNumber: string; expiryDate: string; cvv: string; cardholderName?: string } = {
      cardNumber: stripCardNumberForNative(fields.cardNumber),
      expiryDate: fields.expiryDate,
      cvv: fields.cvv,
    };
    if (collectCardholderName) {
      data.cardholderName = fields.cardholderName;
    }
    debouncedSetRawData(data);
  }, [collectCardholderName, debouncedSetRawData]);

  // Updaters
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
      const formatted = formatExpiryDate(value);
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

  // Touch tracking
  const markFieldTouched = useCallback((field: CardFormField) => {
    setTouched((prev) => (prev[field] ? prev : { ...prev, [field]: true }));
  }, []);

  // Visible errors (only for touched fields)
  const errors = useMemo(() => {
    const visible: CardFormErrors = {};
    for (const field of Object.keys(allErrors) as CardFormField[]) {
      if (touched[field]) {
        visible[field] = allErrors[field];
      }
    }
    return visible;
  }, [allErrors, touched]);

  // Submit
  const submit = useCallback(async () => {
    if (!isValid || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await bridge.submit();
    } catch (err) {
      console.error('[useCardForm] submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  }, [isValid, isSubmitting, bridge]);

  // Reset
  const reset = useCallback(() => {
    setCardNumber('');
    setExpiryDate('');
    setCVV('');
    setCardholderName('');
    setIsValid(false);
    setAllErrors({});
    setTouched({ cardNumber: false, expiryDate: false, cvv: false, cardholderName: false });
    setIsSubmitting(false);
    setBinData(null);
    fieldsRef.current = { cardNumber: '', expiryDate: '', cvv: '', cardholderName: '' };
  }, []);

  return {
    cardNumber,
    expiryDate,
    cvv,
    cardholderName,
    updateCardNumber,
    updateExpiryDate,
    updateCVV,
    updateCardholderName,
    isValid,
    errors,
    markFieldTouched,
    submit,
    isSubmitting,
    requiredFields: bridge.requiredFields,
    binData,
    reset,
  };
}
