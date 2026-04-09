import { useState, useMemo, useCallback, useEffect } from 'react';
import { usePrimerCheckout } from './usePrimerCheckout';
import type { PrimerPaymentMethodAsset } from '../../models/PrimerPaymentMethodResource';
import type {
  PaymentMethodItem,
  UsePaymentMethodsOptions,
  UsePaymentMethodsReturn,
} from '../../models/components/PaymentMethodTypes';

export function usePaymentMethods(options: UsePaymentMethodsOptions = {}): UsePaymentMethodsReturn {
  const { include, exclude, showCardFirst = true, onLoad } = options;

  const { availablePaymentMethods, paymentMethodResources, isLoadingResources, isReady, clientSession } =
    usePrimerCheckout();

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodItem | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const paymentMethods = useMemo(() => {
    if (!isReady || isLoadingResources) {
      return [];
    }

    try {
      const resourceMap = new Map(paymentMethodResources.map((r) => [r.paymentMethodType, r]));

      // Extract surcharge map from clientSession if available
      const surchargeMap = new Map<string, number>();
      const sessionAny = clientSession as Record<string, any> | null;
      const paymentMethodOptions = sessionAny?.paymentMethodOptions;
      if (paymentMethodOptions && typeof paymentMethodOptions === 'object') {
        for (const [methodType, methodOpts] of Object.entries(paymentMethodOptions)) {
          const opts = methodOpts as Record<string, any>;
          if (opts?.surcharge?.amount != null) {
            surchargeMap.set(methodType, opts.surcharge.amount);
          }
        }
      }

      let items: PaymentMethodItem[] = availablePaymentMethods.map((method) => {
        const resource = resourceMap.get(method.paymentMethodType);

        let logo: string | undefined;
        let backgroundColor: string | undefined;

        if (resource && 'paymentMethodLogo' in resource) {
          const asset = resource as PrimerPaymentMethodAsset;
          logo = asset.paymentMethodLogo.colored ?? asset.paymentMethodLogo.light;
          backgroundColor = asset.paymentMethodBackgroundColor?.colored;
        }

        const isNativeView =
          resource != null && 'nativeViewName' in resource && typeof resource.nativeViewName === 'string';

        return {
          type: method.paymentMethodType,
          name: resource?.paymentMethodName ?? method.paymentMethodType.replace(/_/g, ' '),
          logo,
          backgroundColor,
          isNativeView,
          nativeViewName: resource?.nativeViewName,
          categories: [...method.paymentMethodManagerCategories],
          intents: [...method.supportedPrimerSessionIntents],
          surcharge: surchargeMap.get(method.paymentMethodType),
          resource: resource!,
          paymentMethod: method,
        };
      });

      // Filter: include first, then exclude
      if (include && include.length > 0) {
        items = items.filter((item) => include.includes(item.type));
      }
      if (exclude && exclude.length > 0) {
        items = items.filter((item) => !exclude.includes(item.type));
      }

      // Sort: PAYMENT_CARD first
      if (showCardFirst) {
        items.sort((a, b) => {
          if (a.type === 'PAYMENT_CARD') return -1;
          if (b.type === 'PAYMENT_CARD') return 1;
          return 0;
        });
      }

      return items;
    } catch (err) {
      setError(err as Error);
      return [];
    }
  }, [
    availablePaymentMethods,
    paymentMethodResources,
    isReady,
    isLoadingResources,
    clientSession,
    include,
    exclude,
    showCardFirst,
  ]);

  useEffect(() => {
    if (paymentMethods.length > 0 && onLoad) {
      onLoad(paymentMethods);
    }
  }, [paymentMethods, onLoad]);

  const selectMethod = useCallback((method: PaymentMethodItem | null) => {
    setSelectedMethod(method);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedMethod(null);
  }, []);

  return {
    paymentMethods,
    isLoading: !isReady || isLoadingResources,
    error,
    selectedMethod,
    selectMethod,
    clearSelection,
  };
}
