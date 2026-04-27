import React, { useContext, useEffect, useMemo, useRef } from 'react';
import { NavigationProvider } from '../navigation/NavigationProvider';
import { NavigationContainer } from '../navigation/NavigationContainer';
import { useNavigation } from '../navigation/useNavigation';
import { CheckoutRoute } from '../navigation/types';
import type { CheckoutRoute as CheckoutRouteType } from '../navigation/types';
import { usePrimerCheckout } from '../../hooks/usePrimerCheckout';
import { LoadingScreen } from '../screens/LoadingScreen';
import { MethodSelectionScreen } from '../screens/MethodSelectionScreen';
import { CardFormScreen } from '../screens/CardFormScreen';
import { ErrorScreen } from '../screens/ErrorScreen';
import { SuccessScreen } from '../screens/SuccessScreen';
import { CardFormStateProvider, BillingAddressFormStateProvider } from '../form-state';
import { CheckoutFlowContext } from './CheckoutFlowContext';

const SUCCESS_AUTO_DISMISS_MS = 5000;

function CheckoutSuccessScreen() {
  const flow = useContext(CheckoutFlowContext);
  const { clearPaymentOutcome } = usePrimerCheckout();

  useEffect(() => {
    const t = setTimeout(() => {
      clearPaymentOutcome();
      flow?.onCancel();
    }, SUCCESS_AUTO_DISMISS_MS);
    return () => clearTimeout(t);
  }, [flow, clearPaymentOutcome]);

  return <SuccessScreen />;
}

const screenMap: Partial<Record<CheckoutRouteType, React.ComponentType>> = {
  [CheckoutRoute.splash]: LoadingScreen,
  [CheckoutRoute.methodSelection]: MethodSelectionScreen,
  [CheckoutRoute.cardForm]: CardFormScreen,
  [CheckoutRoute.processing]: LoadingScreen,
  [CheckoutRoute.success]: CheckoutSuccessScreen,
  [CheckoutRoute.error]: ErrorScreen,
};

function ReadinessTransitioner() {
  const { isReady, isLoadingResources, error } = usePrimerCheckout();
  const { replace } = useNavigation();
  const hasTransitioned = useRef(false);

  useEffect(() => {
    if (hasTransitioned.current) return;

    if (error) {
      hasTransitioned.current = true;
      replace(CheckoutRoute.error, { error });
      return;
    }

    if (isReady && !isLoadingResources) {
      hasTransitioned.current = true;
      replace(CheckoutRoute.methodSelection);
    }
  }, [isReady, isLoadingResources, error, replace]);

  return null;
}

function PaymentOutcomeTransitioner() {
  const { paymentOutcome, settings, clearPaymentOutcome } = usePrimerCheckout();
  const { replace } = useNavigation();
  const flow = useContext(CheckoutFlowContext);
  const lastOutcomeRef = useRef<typeof paymentOutcome>(null);

  useEffect(() => {
    // Guard against re-fires when unrelated context fields change.
    if (paymentOutcome === lastOutcomeRef.current) return;
    lastOutcomeRef.current = paymentOutcome;

    if (!paymentOutcome) return;

    const uiOptions = settings?.uiOptions;

    if (paymentOutcome.status === 'success') {
      if (uiOptions?.isSuccessScreenEnabled === false) {
        clearPaymentOutcome();
        flow?.onCancel();
        return;
      }
      replace(CheckoutRoute.success, { checkoutData: paymentOutcome.data });
    } else {
      if (uiOptions?.isErrorScreenEnabled === false) {
        clearPaymentOutcome();
        flow?.onCancel();
        return;
      }
      replace(CheckoutRoute.error, { error: paymentOutcome.error });
    }
  }, [paymentOutcome, settings, replace, clearPaymentOutcome, flow]);

  return null;
}

export interface CheckoutFlowProps {
  onCancel?: () => void;
}

export function CheckoutFlow({ onCancel }: CheckoutFlowProps = {}) {
  const contextValue = useMemo(() => ({ onCancel: onCancel ?? (() => {}) }), [onCancel]);

  return (
    <CheckoutFlowContext.Provider value={contextValue}>
      <NavigationProvider initialRoute={CheckoutRoute.splash}>
        <ReadinessTransitioner />
        <PaymentOutcomeTransitioner />
        <CardFormStateProvider>
          <BillingAddressFormStateProvider>
            <NavigationContainer screenMap={screenMap} />
          </BillingAddressFormStateProvider>
        </CardFormStateProvider>
      </NavigationProvider>
    </CheckoutFlowContext.Provider>
  );
}
