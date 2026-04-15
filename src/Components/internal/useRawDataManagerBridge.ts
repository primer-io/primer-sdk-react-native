import { useEffect, useRef, useState, useCallback } from 'react';
import PrimerHeadlessUniversalCheckoutRawDataManager from '../../HeadlessUniversalCheckout/Managers/PaymentMethodManagers/RawDataManager';
import type { PrimerRawData } from '../../models/PrimerRawData';
import type { PrimerInputElementType } from '../../models/PrimerInputElementType';
import type { PrimerBinData } from '../../models/PrimerBinData';
import type { PrimerError } from '../../models/PrimerError';
import type { CardFormErrors } from '../../models/components/CardFormTypes';

export interface UseRawDataManagerBridgeOptions {
  paymentMethodType: string;
  enabled: boolean;
  onValidation?: (isValid: boolean, errors: CardFormErrors) => void;
  onMetadataChange?: (metadata: any) => void;
  onBinDataChange?: (binData: PrimerBinData) => void;
}

export interface UseRawDataManagerBridgeReturn {
  isInitialized: boolean;
  requiredFields: PrimerInputElementType[];
  setRawData: (data: PrimerRawData) => Promise<void>;
  submit: () => Promise<void>;
}

function parseValidationErrors(errors: PrimerError[] | undefined): CardFormErrors {
  const fieldErrors: CardFormErrors = {};
  if (!errors) return fieldErrors;

  for (const error of errors) {
    const id = (error.errorId ?? '').toLowerCase();
    const description = error.description ?? error.message ?? 'Invalid';

    if (id.includes('card') && id.includes('number')) {
      fieldErrors.cardNumber = description;
    } else if (id.includes('expir') || id.includes('expiry')) {
      fieldErrors.expiryDate = description;
    } else if (id.includes('cvv') || id.includes('cvc')) {
      fieldErrors.cvv = description;
    } else if (id.includes('cardholder') || id.includes('name')) {
      fieldErrors.cardholderName = description;
    }
  }

  return fieldErrors;
}

export function useRawDataManagerBridge({
  paymentMethodType,
  enabled,
  onValidation,
  onMetadataChange,
  onBinDataChange,
}: UseRawDataManagerBridgeOptions): UseRawDataManagerBridgeReturn {
  const managerRef = useRef<PrimerHeadlessUniversalCheckoutRawDataManager | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [requiredFields, setRequiredFields] = useState<PrimerInputElementType[]>([]);

  const onValidationRef = useRef(onValidation);
  onValidationRef.current = onValidation;
  const onMetadataChangeRef = useRef(onMetadataChange);
  onMetadataChangeRef.current = onMetadataChange;
  const onBinDataChangeRef = useRef(onBinDataChange);
  onBinDataChangeRef.current = onBinDataChange;

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    const manager = new PrimerHeadlessUniversalCheckoutRawDataManager();
    managerRef.current = manager;

    const init = async () => {
      try {
        await manager.configure({
          paymentMethodType,
          onValidation: (isValid, errors) => {
            const parsed = parseValidationErrors(errors);
            onValidationRef.current?.(isValid, parsed);
          },
          onMetadataChange: (metadata) => {
            onMetadataChangeRef.current?.(metadata);
          },
          onBinDataChange: (binData) => {
            onBinDataChangeRef.current?.(binData);
          },
        });

        if (cancelled) return;

        const fields = await manager.getRequiredInputElementTypes();
        if (cancelled) return;

        setRequiredFields(fields);
        setIsInitialized(true);
      } catch (err) {
        if (!cancelled) {
          console.error('[useRawDataManagerBridge] init failed:', err);
        }
      }
    };

    init();

    return () => {
      cancelled = true;
      manager.cleanUp().catch(() => {});
      manager.removeAllListeners();
      managerRef.current = null;
      setIsInitialized(false);
    };
  }, [enabled, paymentMethodType]);

  const setRawData = useCallback(
    async (data: PrimerRawData) => {
      if (managerRef.current && isInitialized) {
        await managerRef.current.setRawData(data);
      }
    },
    [isInitialized]
  );

  const submit = useCallback(async () => {
    if (managerRef.current && isInitialized) {
      await managerRef.current.submit();
    }
  }, [isInitialized]);

  return {
    isInitialized,
    requiredFields,
    setRawData,
    submit,
  };
}
