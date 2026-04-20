import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { usePrimerCheckout } from './usePrimerCheckout';
import type { PrimerPaymentMethodAsset } from '../../models/PrimerPaymentMethodResource';
import type { PaymentMethodItem, UsePaymentMethodsOptions, UsePaymentMethodsReturn } from '../types/PaymentMethodTypes';

export function usePaymentMethods(options: UsePaymentMethodsOptions = {}): UsePaymentMethodsReturn {
  const { include, exclude, showCardFirst = true, onLoad } = options;

  const { availablePaymentMethods, paymentMethodResources, isLoadingResources, isReady, clientSession } =
    usePrimerCheckout();

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodItem | null>(null);

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

  const selectMethod = useCallback((method: PaymentMethodItem | null) => {
    setSelectedMethod(method);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedMethod(null);
  }, []);

  return {
    paymentMethods,
    isLoading,
    error,
    selectedMethod,
    selectMethod,
    clearSelection,
  };
}
