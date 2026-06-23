import { useCallback, useMemo } from 'react';
import { Platform } from 'react-native';

import { usePrimerCheckout } from './usePrimerCheckout';
import { GOOGLE_PAY, isGooglePaySupported } from '../internal/googlePay';
import { APPLE_PAY, isApplePaySupported } from '../internal/applePay';
import { routeMethodSelection } from '../internal/routeMethodSelection';

import type { PaymentMethodAvailabilityError, UsePrimerPaymentMethodReturn } from '../types/PrimerPaymentMethodTypes';

/**
 * One generic hook for any payment method — narrow the return on `kind`. Replaces the per-method
 * hooks: render the provided button (or your own) and call `start()`; the native Headless SDK owns
 * the flow, and outcomes arrive via `paymentOutcome`. The card method keeps its dedicated
 * `usePrimerCardForm` for field-level layouts. Throws outside `<PrimerCheckoutProvider>`.
 */
export function usePrimerPaymentMethod(type: string): UsePrimerPaymentMethodReturn {
  const {
    availablePaymentMethods,
    nativeUiInFlightType,
    paymentOutcome,
    startNativeUI,
    cancelNativeUI,
    clearPaymentOutcome,
    setActiveMethod,
  } = usePrimerCheckout();

  const method = availablePaymentMethods.find((m) => m.paymentMethodType === type);
  const isPresent = method != null;
  const kind = routeMethodSelection(type, method?.paymentMethodManagerCategories ?? []);

  const start = useCallback(() => startNativeUI(type), [startNativeUI, type]);
  const cancel = useCallback(() => cancelNativeUI(type), [cancelNativeUI, type]);
  const startCard = useCallback(() => setActiveMethod(type), [setActiveMethod, type]);

  return useMemo<UsePrimerPaymentMethodReturn>(() => {
    if (kind === 'nativeUi') {
      const isAvailable = isNativeUiAvailable(type, availablePaymentMethods);
      return {
        kind: 'nativeUi',
        isAvailable,
        isLoading: nativeUiInFlightType === type,
        paymentOutcome,
        availabilityError: isAvailable ? null : availabilityError(type),
        start,
        cancel,
        clearPaymentOutcome,
      };
    }
    if (kind === 'card') {
      return { kind: 'card', isAvailable: isPresent, start: startCard, clearPaymentOutcome };
    }
    return { kind: 'unsupported', isAvailable: false };
  }, [
    kind,
    type,
    isPresent,
    availablePaymentMethods,
    nativeUiInFlightType,
    paymentOutcome,
    start,
    cancel,
    startCard,
    clearPaymentOutcome,
  ]);
}

/** Native-UI availability — platform-gated for Google/Apple Pay (single-platform), list-membership otherwise. */
function isNativeUiAvailable(type: string, methods: ReadonlyArray<{ paymentMethodType: string }>): boolean {
  if (type === GOOGLE_PAY) {
    return isGooglePaySupported(methods);
  }
  if (type === APPLE_PAY) {
    return isApplePaySupported(methods);
  }
  return methods.some((m) => m.paymentMethodType === type);
}

function availabilityError(type: string): PaymentMethodAvailabilityError {
  if (type === GOOGLE_PAY) {
    return Platform.OS === 'android'
      ? { code: 'NOT_READY', message: 'Google Pay is not ready on this device.' }
      : { code: 'PLATFORM_NOT_SUPPORTED', message: 'Google Pay is only available on Android.' };
  }
  if (type === APPLE_PAY) {
    return Platform.OS === 'ios'
      ? { code: 'NOT_AVAILABLE', message: 'Apple Pay is not available on this device.' }
      : { code: 'PLATFORM_NOT_SUPPORTED', message: 'Apple Pay is only available on iOS.' };
  }
  return { code: 'NOT_AVAILABLE', message: `${type} is not available. Ensure it is configured for this session.` };
}
