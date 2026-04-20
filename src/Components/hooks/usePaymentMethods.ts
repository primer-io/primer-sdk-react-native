import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { usePrimerCheckout } from './usePrimerCheckout';
import type { PaymentMethodItem, UsePaymentMethodsOptions, UsePaymentMethodsReturn } from '../types/PaymentMethodTypes';

export function usePaymentMethods(options: UsePaymentMethodsOptions = {}): UsePaymentMethodsReturn {
  const { include, exclude, showCardFirst = true, onLoad } = options;

  const {
    availablePaymentMethods,
    paymentMethodResources,
    isLoadingResources,
    resourcesError,
    isReady,
    clientSession,
  } = usePrimerCheckout();

  const [selectedType, setSelectedType] = useState<string | null>(null);

  const onLoadRef = useRef(onLoad);
  onLoadRef.current = onLoad;

  const hasFiredLoadRef = useRef(false);

  const isLoading = !isReady || isLoadingResources;

  const { items: paymentMethods, error } = useMemo(() => {
    if (isLoading) {
      return { items: [], error: null };
    }

    try {
      const resourceMap = new Map(paymentMethodResources.map((r) => [r.paymentMethodType, r]));

      const surchargeMap = new Map<string, number>();
      const paymentMethodOptions = clientSession?.paymentMethodOptions;
      if (paymentMethodOptions) {
        for (const [methodType, methodOpts] of Object.entries(paymentMethodOptions)) {
          const amount = methodOpts?.surcharge?.amount;
          if (amount != null) {
            surchargeMap.set(methodType, amount);
          }
        }
      }

      let result: PaymentMethodItem[] = availablePaymentMethods.map((method) => {
        const resource = resourceMap.get(method.paymentMethodType);

        let logo: string | undefined;
        let backgroundColor: string | undefined;

        if (resource && 'paymentMethodLogo' in resource) {
          logo = resource.paymentMethodLogo.colored ?? resource.paymentMethodLogo.light;
          backgroundColor = resource.paymentMethodBackgroundColor?.colored;
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
          resource,
          paymentMethod: method,
        };
      });

      // Filter: include first, then exclude
      if (include && include.length > 0) {
        result = result.filter((item) => include.includes(item.type));
      }
      if (exclude && exclude.length > 0) {
        result = result.filter((item) => !exclude.includes(item.type));
      }

      // Sort: PAYMENT_CARD first
      if (showCardFirst) {
        result.sort((a, b) => {
          if (a.type === 'PAYMENT_CARD') return -1;
          if (b.type === 'PAYMENT_CARD') return 1;
          return 0;
        });
      }

      return { items: result, error: null };
    } catch (err) {
      return { items: [], error: err as Error };
    }
  }, [availablePaymentMethods, paymentMethodResources, isLoading, clientSession, include, exclude, showCardFirst]);

  useEffect(() => {
    if (isLoading) {
      hasFiredLoadRef.current = false;
      return;
    }
    if (!hasFiredLoadRef.current) {
      hasFiredLoadRef.current = true;
      onLoadRef.current?.(paymentMethods);
    }
  }, [isLoading, paymentMethods]);

  const selectedMethod = useMemo(
    () => paymentMethods.find((m) => m.type === selectedType) ?? null,
    [paymentMethods, selectedType]
  );

  const selectMethod = useCallback((method: PaymentMethodItem | null) => {
    setSelectedType(method?.type ?? null);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedType(null);
  }, []);

  return {
    paymentMethods,
    isLoading,
    error,
    resourcesError,
    selectedMethod,
    selectMethod,
    clearSelection,
  };
}
