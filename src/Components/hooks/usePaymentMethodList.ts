import { useState, useEffect, useMemo, useCallback } from 'react';
import { usePrimerCheckout } from './usePrimerCheckout';
import type {
  PaymentMethodItem,
  UsePaymentMethodListOptions,
  UsePaymentMethodListReturn,
} from '../../models/components/PaymentMethodListTypes';
import type { PrimerPaymentMethodAsset } from '../../models/PrimerPaymentMethodResource';

/**
 * Hook to access and manage payment method list
 *
 * This hook provides filtered payment methods with display information,
 * selection state management, and utility functions.
 *
 * @example
 * ```tsx
 * function PaymentScreen() {
 *   const {
 *     paymentMethods,
 *     isLoading,
 *     selectedMethod,
 *     selectMethod
 *   } = usePaymentMethodList({
 *     showCardFirst: true,
 *     exclude: ['APPLE_PAY'],
 *   });
 *
 *   return (
 *     <>
 *       {paymentMethods.map(method => (
 *         <TouchableOpacity
 *           key={method.type}
 *           onPress={() => selectMethod(method)}
 *         >
 *           <Text>{method.name}</Text>
 *         </TouchableOpacity>
 *       ))}
 *     </>
 *   );
 * }
 * ```
 */
export function usePaymentMethodList(
  options: UsePaymentMethodListOptions = {}
): UsePaymentMethodListReturn {
  const {
    include,
    exclude,
    showCardFirst = true,
    onLoad,
  } = options;

  const {
    availablePaymentMethods,
    paymentMethodResources,
    isLoadingResources,
    isReady,
  } = usePrimerCheckout();

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodItem | null>(null);
  const [error, setError] = useState<Error | null>(null);

  // Merge payment methods with resources to create PaymentMethodItems
  const paymentMethods = useMemo(() => {
    if (!isReady || isLoadingResources) {
      return [];
    }

    try {
      // Create a map of resources by type for quick lookup
      const resourceMap = new Map(
        paymentMethodResources.map(resource => [resource.paymentMethodType, resource])
      );

      // Merge available payment methods with their resources
      let items: PaymentMethodItem[] = availablePaymentMethods
        .map(method => {
          const resource = resourceMap.get(method.paymentMethodType);

          if (!resource) {
            // If no resource found, create a minimal item
            return {
              type: method.paymentMethodType,
              name: method.paymentMethodType.replace(/_/g, ' '),
              isNativeView: false,
              categories: method.paymentMethodManagerCategories,
              intents: method.supportedPrimerSessionIntents,
              resource: resource as any,
              paymentMethod: method,
            };
          }

          const isNativeView = 'nativeViewName' in resource && typeof resource.nativeViewName === 'string';

          // Extract logo URL (prefer colored, fallback to light)
          let logo: string | undefined;
          if ('paymentMethodLogo' in resource) {
            const assetResource = resource as PrimerPaymentMethodAsset;
            logo = assetResource.paymentMethodLogo.colored || assetResource.paymentMethodLogo.light;
          }

          // Extract background color
          let backgroundColor: string | undefined;
          if ('paymentMethodBackgroundColor' in resource) {
            const assetResource = resource as PrimerPaymentMethodAsset;
            backgroundColor = assetResource.paymentMethodBackgroundColor.colored;
          }

          return {
            type: method.paymentMethodType,
            name: resource.paymentMethodName,
            logo,
            backgroundColor,
            isNativeView,
            nativeViewName: resource.nativeViewName,
            categories: method.paymentMethodManagerCategories,
            intents: method.supportedPrimerSessionIntents,
            resource,
            paymentMethod: method,
          };
        })
        .filter(Boolean) as PaymentMethodItem[];

      // Apply filtering
      if (include && include.length > 0) {
        items = items.filter(item => include.includes(item.type));
      }

      if (exclude && exclude.length > 0) {
        items = items.filter(item => !exclude.includes(item.type));
      }

      // Sort: PAYMENT_CARD first if requested
      if (showCardFirst) {
        items.sort((a, b) => {
          if (a.type === 'PAYMENT_CARD') return -1;
          if (b.type === 'PAYMENT_CARD') return 1;
          return 0;
        });
      }

      return items;
    } catch (err) {
      console.error('Error processing payment methods:', err);
      setError(err as Error);
      return [];
    }
  }, [availablePaymentMethods, paymentMethodResources, isReady, isLoadingResources, include, exclude, showCardFirst]);

  // Call onLoad when payment methods change
  useEffect(() => {
    if (paymentMethods.length > 0 && onLoad) {
      onLoad(paymentMethods);
    }
  }, [paymentMethods, onLoad]);

  // Select method handler
  const selectMethod = useCallback((method: PaymentMethodItem | null) => {
    setSelectedMethod(method);
  }, []);

  // Refresh methods by re-fetching from AssetsManager
  const refreshMethods = useCallback(async () => {
    try {
      setError(null);
      // Resources are fetched in the provider, so we don't need to do anything here
      // This is mainly for future extensibility
    } catch (err) {
      console.error('Error refreshing payment methods:', err);
      setError(err as Error);
    }
  }, []);

  // Filter by category
  const filterByCategory = useCallback((category: string): PaymentMethodItem[] => {
    return paymentMethods.filter(method => method.categories.includes(category));
  }, [paymentMethods]);

  // Filter by types
  const filterByType = useCallback((types: string[]): PaymentMethodItem[] => {
    return paymentMethods.filter(method => types.includes(method.type));
  }, [paymentMethods]);

  // Get specific method by type
  const getMethodByType = useCallback((type: string): PaymentMethodItem | undefined => {
    return paymentMethods.find(method => method.type === type);
  }, [paymentMethods]);

  return {
    paymentMethods,
    isLoading: !isReady || isLoadingResources,
    error,
    selectedMethod,
    selectMethod,
    refreshMethods,
    filterByCategory,
    filterByType,
    getMethodByType,
  };
}
