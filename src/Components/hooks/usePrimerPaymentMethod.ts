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
    banks,
    selectedBankId,
    isBanksLoading,
    startBanks,
    filterBanks,
    selectBank,
    submitBanks,
    cardFormState,
    setRawData,
    submit,
    qrCode,
    isQrPending,
    klarnaPaymentCategories,
    selectedKlarnaCategoryId,
    isKlarnaViewLoaded,
    isKlarnaLoading,
    startKlarna,
    selectKlarnaCategory,
    authorizeKlarna,
    finalizeKlarna,
  } = usePrimerCheckout();

  const method = availablePaymentMethods.find((m) => m.paymentMethodType === type);
  const isPresent = method != null;
  const kind = routeMethodSelection(type, method?.paymentMethodManagerCategories ?? []);

  const start = useCallback(() => startNativeUI(type), [startNativeUI, type]);
  const cancel = useCallback(() => cancelNativeUI(type), [cancelNativeUI, type]);
  const startCard = useCallback(() => setActiveMethod(type), [setActiveMethod, type]);
  const startBank = useCallback(() => startBanks(type), [startBanks, type]);
  const startRawDataForm = useCallback(async () => {
    setActiveMethod(type);
  }, [setActiveMethod, type]);
  const startKlarnaFlow = useCallback(() => startKlarna(type), [startKlarna, type]);

  return useMemo<UsePrimerPaymentMethodReturn>(() => {
    if (kind === 'nativeUi') {
      const isAvailable = isNativeUiAvailable(type, availablePaymentMethods);
      return {
        kind: 'nativeUi',
        isAvailable,
        isLoading: nativeUiInFlightType === type,
        paymentOutcome,
        availabilityError: isAvailable ? null : availabilityError(type),
        isPending: isQrPending,
        qrCode,
        start,
        cancel,
        clearPaymentOutcome,
      };
    }
    if (kind === 'bankSelection') {
      return {
        kind: 'bankSelection',
        isAvailable: isPresent,
        isLoading: isBanksLoading,
        paymentOutcome,
        banks,
        selectedBankId,
        start: startBank,
        filter: filterBanks,
        selectBank,
        submit: submitBanks,
        clearPaymentOutcome,
      };
    }
    if (kind === 'rawDataForm') {
      return {
        kind: 'rawDataForm',
        isAvailable: isPresent,
        requiredInputs: cardFormState.requiredFields,
        validationErrors: Object.values(cardFormState.errors).filter((e): e is string => Boolean(e)),
        isValid: cardFormState.isValid,
        paymentOutcome,
        start: startRawDataForm,
        setData: setRawData,
        submit,
        clearPaymentOutcome,
      };
    }
    if (kind === 'klarna') {
      return {
        kind: 'klarna',
        isAvailable: isPresent,
        paymentCategories: klarnaPaymentCategories,
        selectedCategoryId: selectedKlarnaCategoryId,
        isViewLoaded: isKlarnaViewLoaded,
        isLoading: isKlarnaLoading,
        paymentOutcome,
        start: startKlarnaFlow,
        selectCategory: selectKlarnaCategory,
        authorize: authorizeKlarna,
        finalize: finalizeKlarna,
        clearPaymentOutcome,
      };
    }
    if (kind === 'card') {
      return { kind: 'card', isAvailable: isPresent, start: startCard, clearPaymentOutcome };
    }
    if (kind === 'unsupported') {
      return { kind: 'unsupported', isAvailable: false };
    }
    // Exhaustiveness: adding a kind without a branch above fails to compile (mirrors MethodSelectionScreen).
    const _exhaustive: never = kind;
    return _exhaustive;
  }, [
    kind,
    type,
    isPresent,
    availablePaymentMethods,
    nativeUiInFlightType,
    qrCode,
    isQrPending,
    paymentOutcome,
    start,
    cancel,
    startCard,
    startBank,
    filterBanks,
    selectBank,
    submitBanks,
    banks,
    selectedBankId,
    isBanksLoading,
    cardFormState,
    setRawData,
    submit,
    startRawDataForm,
    klarnaPaymentCategories,
    selectedKlarnaCategoryId,
    isKlarnaViewLoaded,
    isKlarnaLoading,
    startKlarnaFlow,
    selectKlarnaCategory,
    authorizeKlarna,
    finalizeKlarna,
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
