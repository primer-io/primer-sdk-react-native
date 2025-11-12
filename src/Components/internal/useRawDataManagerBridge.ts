import { useEffect, useRef, useState } from 'react';
import RawDataManager from '../../HeadlessUniversalCheckout/Managers/PaymentMethodManagers/RawDataManager';
import type { RawDataManagerProps } from '../../HeadlessUniversalCheckout/Managers/PaymentMethodManagers/RawDataManager';
import type { PrimerInputElementType } from '../../models/PrimerInputElementType';
import type { PrimerError } from '../../models/PrimerError';

/**
 * Options for useRawDataManagerBridge
 * @internal
 */
export interface UseRawDataManagerBridgeOptions {
  /**
   * Payment method type to configure (e.g., 'PAYMENT_CARD')
   */
  paymentMethodType: string;

  /**
   * Called when metadata changes
   */
  onMetadataChange?: (metadata: any) => void;

  /**
   * Called when validation state changes
   */
  onValidation?: (isValid: boolean, errors: PrimerError[] | undefined) => void;
}

/**
 * Return value from useRawDataManagerBridge
 * @internal
 */
export interface UseRawDataManagerBridgeReturn {
  /**
   * The RawDataManager instance
   */
  manager: RawDataManager | null;

  /**
   * Whether the manager is initialized
   */
  isInitialized: boolean;

  /**
   * Required input element types for this payment method
   */
  requiredFields: PrimerInputElementType[];

  /**
   * Initialization error, if any
   */
  error: Error | null;
}

/**
 * Hook to manage RawDataManager lifecycle within React components
 *
 * This hook:
 * - Creates a RawDataManager instance on mount
 * - Configures it with the payment method type and callbacks
 * - Retrieves required input fields
 * - Cleans up on unmount
 *
 * @internal This is a private implementation detail
 */
export function useRawDataManagerBridge(
  options: UseRawDataManagerBridgeOptions & { enabled?: boolean }
): UseRawDataManagerBridgeReturn {
  const { paymentMethodType, onMetadataChange, onValidation, enabled = true } = options;

  const managerRef = useRef<RawDataManager | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [requiredFields, setRequiredFields] = useState<PrimerInputElementType[]>([]);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Don't initialize if not enabled (e.g., waiting for PrimerHeadlessUniversalCheckout)
    if (!enabled) {
      return;
    }

    const manager = new RawDataManager();
    managerRef.current = manager;

    const initializeManager = async () => {
      try {
        // Configure manager with callbacks
        const configOptions: RawDataManagerProps = {
          paymentMethodType,
        };

        if (onMetadataChange) {
          configOptions.onMetadataChange = onMetadataChange;
        }

        if (onValidation) {
          configOptions.onValidation = onValidation;
        }

        await manager.configure(configOptions);

        // Get required fields
        const fields = await manager.getRequiredInputElementTypes();
        setRequiredFields(fields);

        setIsInitialized(true);
      } catch (err) {
        console.error('Failed to initialize RawDataManager:', err);
        setError(err as Error);
      }
    };

    initializeManager();

    // Cleanup on unmount
    return () => {
      if (managerRef.current) {
        managerRef.current.cleanUp().catch((err) => {
          console.error('Failed to clean up RawDataManager:', err);
        });
        managerRef.current = null;
      }
    };
    // Only re-initialize if paymentMethodType or enabled changes
    // Callbacks are captured in closure and don't need to trigger re-init
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentMethodType, enabled]);

  return {
    manager: managerRef.current,
    isInitialized,
    requiredFields,
    error,
  };
}
