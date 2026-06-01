import { usePrimerCheckout } from './usePrimerCheckout';
import type { GooglePayController } from '../types/PrimerGooglePayTypes';

/**
 * Google Pay for Checkout Components (Android). `isAvailable` is always `false` on iOS, so one
 * render path works with no `Platform.OS` check. Throws outside `<PrimerCheckoutProvider>`.
 */
export function useGooglePay(): GooglePayController {
  const ctx = usePrimerCheckout();
  return {
    isAvailable: ctx.isGooglePayAvailable,
    isLoading: ctx.isGooglePayLoading,
    availabilityError: ctx.googlePayAvailabilityError,
    paymentOutcome: ctx.paymentOutcome,
    startPayment: ctx.startGooglePay,
    cancel: ctx.cancelGooglePay,
    clearPaymentOutcome: ctx.clearPaymentOutcome,
  };
}
