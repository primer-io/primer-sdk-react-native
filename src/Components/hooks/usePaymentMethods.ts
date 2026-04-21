import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { usePrimerCheckout } from './usePrimerCheckout';
import { titleCaseFromType } from '../internal/utils/formatting';
import { toError } from '../internal/utils/errors';
import type { PrimerClientSessionPaymentMethodOption } from '../../models/PrimerClientSession';
import type {
  PaymentMethodItem,
  PaymentMethodSurcharge,
  UsePaymentMethodsOptions,
  UsePaymentMethodsReturn,
} from '../types/PaymentMethodTypes';

const PAYMENT_CARD_TYPE = 'PAYMENT_CARD';

// Mirrors Android's `PaymentMethodDataResponse.surcharges()` mapping:
// PAYMENT_CARD → CardNetworksSurcharge; everything else → PaymentMethodSurcharge.
function buildSurchargeMap(
  paymentMethodOptions: Record<string, PrimerClientSessionPaymentMethodOption> | undefined
): Map<string, PaymentMethodSurcharge> {
  const result = new Map<string, PaymentMethodSurcharge>();
  if (!paymentMethodOptions) return result;

  for (const [methodType, methodOpts] of Object.entries(paymentMethodOptions)) {
    if (methodType === PAYMENT_CARD_TYPE) {
      const amounts: Record<string, number> = {};
      for (const [network, networkOpts] of Object.entries(methodOpts?.networks ?? {})) {
        const amount = networkOpts?.surcharge?.amount;
        if (amount != null) {
          amounts[network] = amount;
        }
      }
      if (Object.keys(amounts).length > 0) {
        result.set(methodType, { kind: 'perNetwork', amounts });
      }
    } else {
      const amount = methodOpts?.surcharge?.amount;
      if (amount != null) {
        result.set(methodType, { kind: 'flat', amount });
      }
    }
  }
  return result;
}

export function usePaymentMethods(options: UsePaymentMethodsOptions = {}): UsePaymentMethodsReturn {
  const { include, exclude, onLoad } = options;

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

  const lastFiredSignatureRef = useRef<string | null>(null);

  const isLoading = !isReady || isLoadingResources;

  const { items: paymentMethods, error } = useMemo(() => {
    if (isLoading) {
      return { items: [], error: null };
    }

    try {
      const resourceMap = new Map(paymentMethodResources.map((r) => [r.paymentMethodType, r]));

      const surchargeMap = buildSurchargeMap(clientSession?.paymentMethodOptions);

      let result: PaymentMethodItem[] = availablePaymentMethods.map((method) => {
        const resource = resourceMap.get(method.paymentMethodType);

        let logo: string | undefined;
        let backgroundColor: string | undefined;

        if (resource && 'paymentMethodLogo' in resource) {
          logo = resource.paymentMethodLogo.colored ?? resource.paymentMethodLogo.light;
          backgroundColor = resource.paymentMethodBackgroundColor?.colored;
        }

        return {
          type: method.paymentMethodType,
          name: resource?.paymentMethodName ?? titleCaseFromType(method.paymentMethodType),
          logo,
          backgroundColor,
          nativeViewName: resource?.nativeViewName,
          categories: [...method.paymentMethodManagerCategories],
          intents: [...method.supportedPrimerSessionIntents],
          surcharge: surchargeMap.get(method.paymentMethodType),
          resource,
          paymentMethod: method,
        };
      });

      if (include && include.length > 0) {
        result = result.filter((item) => include.includes(item.type));
      }
      if (exclude && exclude.length > 0) {
        result = result.filter((item) => !exclude.includes(item.type));
      }

      return { items: result, error: null };
    } catch (err) {
      return { items: [], error: toError(err) };
    }
  }, [availablePaymentMethods, paymentMethodResources, isLoading, clientSession, include, exclude]);

  // Fires onLoad once per distinct set of payment-method types, after resources load.
  // Re-fires if the set of types changes (e.g. client-session update adds/removes a method).
  useEffect(() => {
    if (isLoading) {
      lastFiredSignatureRef.current = null;
      return;
    }
    const signature = paymentMethods
      .map((m) => m.type)
      .sort()
      .join('|');
    if (signature !== lastFiredSignatureRef.current) {
      lastFiredSignatureRef.current = signature;
      onLoadRef.current?.(paymentMethods);
    }
  }, [isLoading, paymentMethods]);

  // Clear selection if the selected type is no longer present (e.g. filtered out).
  useEffect(() => {
    if (isLoading) return;
    if (selectedType != null && !paymentMethods.some((m) => m.type === selectedType)) {
      setSelectedType(null);
    }
  }, [isLoading, selectedType, paymentMethods]);

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
