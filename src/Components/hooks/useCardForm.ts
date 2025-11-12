import { useState, useEffect, useCallback } from 'react';
import { usePrimerCheckout } from './usePrimerCheckout';
import { useRawDataManagerBridge } from '../internal/useRawDataManagerBridge';
import type {
  UseCardFormOptions,
  UseCardFormReturn,
  CardFormErrors,
  CardMetadata,
} from '../../models/components/CardFormTypes';
import type { PrimerCardData } from '../../models/PrimerRawData';
import type { PrimerError } from '../../models/PrimerError';

/**
 * Parse Primer validation errors into field-specific error messages
 * @internal
 */
function parseValidationErrors(errors: PrimerError[] | undefined): CardFormErrors {
  if (!errors || errors.length === 0) {
    return {};
  }

  const fieldErrors: CardFormErrors = {};

  for (const error of errors) {
    const errorId = error.errorId?.toLowerCase() || '';
    const description = error.description || 'Invalid input';

    // Map error IDs to field names
    if (errorId.includes('card') && errorId.includes('number')) {
      fieldErrors.cardNumber = description;
    } else if (errorId.includes('expir')) {
      fieldErrors.expiryDate = description;
    } else if (errorId.includes('cvv') || errorId.includes('security')) {
      fieldErrors.cvv = description;
    } else if (errorId.includes('cardholder') || errorId.includes('name')) {
      fieldErrors.cardholderName = description;
    }
  }

  return fieldErrors;
}

/**
 * Hook to manage card form state and validation
 *
 * This hook wraps the RawDataManager and provides a React-idiomatic API
 * for collecting card payment information.
 *
 * Must be used within a PrimerCheckoutProvider component.
 *
 * @param options - Configuration options for the card form
 * @returns Card form state and actions
 *
 * @example
 * ```tsx
 * function CheckoutScreen() {
 *   const cardForm = useCardForm({
 *     onValidationChange: (isValid) => console.log('Valid:', isValid),
 *     collectCardholderName: true,
 *   });
 *
 *   return (
 *     <View>
 *       <TextInput
 *         value={cardForm.cardNumber}
 *         onChangeText={cardForm.updateCardNumber}
 *         placeholder="Card Number"
 *       />
 *       <Button
 *         title="Pay"
 *         disabled={!cardForm.isValid}
 *         onPress={cardForm.submit}
 *       />
 *     </View>
 *   );
 * }
 * ```
 */
export function useCardForm(options?: UseCardFormOptions): UseCardFormReturn {
  // Ensure we're within Provider
  const context = usePrimerCheckout();

  // Form state
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardholderName, setCardholderName] = useState('');

  // Validation state
  const [isValid, setIsValid] = useState(false);
  const [errors, setErrors] = useState<CardFormErrors>({});
  const [metadata, setMetadata] = useState<CardMetadata | null>(null);

  // Memoize callbacks to prevent infinite re-initialization
  const handleMetadataChange = useCallback((data: any) => {
    setMetadata(data);
    options?.onMetadataChange?.(data);
  }, [options?.onMetadataChange]);

  const handleValidation = useCallback((valid: boolean, rawErrors: PrimerError[] | undefined) => {
    setIsValid(valid);
    const parsedErrors = parseValidationErrors(rawErrors);
    setErrors(parsedErrors);
    options?.onValidationChange?.(valid, rawErrors);
  }, [options?.onValidationChange]);

  // Initialize RawDataManager - ONLY when SDK is ready
  const { manager, isInitialized, requiredFields, error: bridgeError } = useRawDataManagerBridge({
    paymentMethodType: 'PAYMENT_CARD',
    enabled: context.isReady, // Wait for SDK to be ready before initializing
    onMetadataChange: handleMetadataChange,
    onValidation: handleValidation,
  });

  // Log bridge errors
  useEffect(() => {
    if (bridgeError) {
      console.error('useCardForm: RawDataManager bridge error:', bridgeError);
    }
  }, [bridgeError]);

  // Auto-sync form data to RawDataManager whenever fields change
  useEffect(() => {
    if (!manager || !isInitialized) {
      return;
    }

    const cardData: PrimerCardData = {
      cardNumber,
      expiryDate,
      cvv,
    };

    // Only include cardholder name if option is enabled
    if (options?.collectCardholderName) {
      cardData.cardholderName = cardholderName;
    }

    // Update RawDataManager with current form data
    manager.setRawData(cardData).catch((err) => {
      console.error('Failed to set raw data:', err);
    });
  }, [manager, isInitialized, cardNumber, expiryDate, cvv, cardholderName, options?.collectCardholderName]);

  // Submit action
  const submit = useCallback(async () => {
    if (!manager) {
      throw new Error('Card form not initialized');
    }

    if (!isValid) {
      throw new Error('Cannot submit invalid card form');
    }

    // Ensure data is set immediately before submitting
    const cardData: PrimerCardData = {
      cardNumber,
      expiryDate,
      cvv,
    };

    // Only include cardholder name if option is enabled
    if (options?.collectCardholderName) {
      cardData.cardholderName = cardholderName;
    }

    // Set the data and wait for it to complete before submitting
    await manager.setRawData(cardData);
    await manager.submit();
  }, [manager, isValid, cardNumber, expiryDate, cvv, cardholderName, options?.collectCardholderName]);

  // Reset action
  const reset = useCallback(() => {
    setCardNumber('');
    setExpiryDate('');
    setCvv('');
    setCardholderName('');
    setIsValid(false);
    setErrors({});
    setMetadata(null);
  }, []);

  return {
    // Field values
    cardNumber,
    expiryDate,
    cvv,
    cardholderName,

    // Validation state
    isValid,
    errors,
    metadata,
    requiredFields,

    // Field updaters
    updateCardNumber: setCardNumber,
    updateExpiryDate: setExpiryDate,
    updateCVV: setCvv,
    updateCardholderName: setCardholderName,

    // Actions
    submit,
    reset,
  };
}
