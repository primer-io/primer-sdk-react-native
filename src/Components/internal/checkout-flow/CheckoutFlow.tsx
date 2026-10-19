import React, { useContext, useEffect, useMemo } from 'react';
import { NavigationProvider } from '../navigation/NavigationProvider';
import { NavigationContainer } from '../navigation/NavigationContainer';
import { CheckoutRoute } from '../navigation/types';
import type { CheckoutRoute as CheckoutRouteType } from '../navigation/types';
import { usePrimerCheckout } from '../../hooks/usePrimerCheckout';
import { LoadingScreen } from '../screens/LoadingScreen';
import { MethodSelectionScreen } from '../screens/MethodSelectionScreen';
import { CardFormScreen } from '../screens/CardFormScreen';
import { BankSelectionScreen } from '../screens/BankSelectionScreen';
import { RawDataFormScreen } from '../screens/RawDataFormScreen';
import { KlarnaScreen } from '../screens/KlarnaScreen';
import { StripeAchUserDetailsScreen } from '../screens/StripeAchUserDetailsScreen';
import { StripeAchMandateScreen } from '../screens/StripeAchMandateScreen';
import { PendingScreen } from '../screens/PendingScreen';
import { CountrySelectorScreen } from '../screens/CountrySelectorScreen';
import { ErrorScreen } from '../screens/ErrorScreen';
import { SuccessScreen } from '../screens/SuccessScreen';
import { VaultedMethodsScreen } from '../screens/VaultedMethodsScreen';
import { PrimerCardFormProvider, BillingAddressFormStateProvider } from '../form-state';
import { CheckoutFlowContext } from './CheckoutFlowContext';
import { ReadinessTransitioner } from './ReadinessTransitioner';
import { PaymentOutcomeTransitioner } from './PaymentOutcomeTransitioner';
import { AchMandateTransitioner } from './AchMandateTransitioner';

const SUCCESS_AUTO_DISMISS_MS = 3000;

// Auto-dismiss wrapper shared by the success + pending routes: clear the outcome so the next
// attempt re-fires the transitioner, then hand control back to the flow.
function withOutcomeAutoDismiss(Screen: React.ComponentType) {
  return function OutcomeAutoDismissScreen() {
    const flow = useContext(CheckoutFlowContext);
    const { clearPaymentOutcome } = usePrimerCheckout();

    useEffect(() => {
      const t = setTimeout(() => {
        clearPaymentOutcome();
        flow?.onCancel();
      }, SUCCESS_AUTO_DISMISS_MS);
      return () => clearTimeout(t);
    }, [flow, clearPaymentOutcome]);

    return <Screen />;
  };
}

const CheckoutSuccessScreen = withOutcomeAutoDismiss(SuccessScreen);
const CheckoutPendingScreen = withOutcomeAutoDismiss(PendingScreen);

const screenMap: Partial<Record<CheckoutRouteType, React.ComponentType>> = {
  [CheckoutRoute.splash]: LoadingScreen,
  [CheckoutRoute.methodSelection]: MethodSelectionScreen,
  [CheckoutRoute.cardForm]: CardFormScreen,
  [CheckoutRoute.bankSelection]: BankSelectionScreen,
  [CheckoutRoute.rawDataForm]: RawDataFormScreen,
  [CheckoutRoute.klarna]: KlarnaScreen,
  [CheckoutRoute.stripeAchUserDetails]: StripeAchUserDetailsScreen,
  [CheckoutRoute.stripeAchMandate]: StripeAchMandateScreen,
  [CheckoutRoute.countrySelector]: CountrySelectorScreen,
  [CheckoutRoute.processing]: LoadingScreen,
  [CheckoutRoute.pending]: CheckoutPendingScreen,
  [CheckoutRoute.success]: CheckoutSuccessScreen,
  [CheckoutRoute.error]: ErrorScreen,
  [CheckoutRoute.vaultedMethods]: VaultedMethodsScreen,
};

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
        <AchMandateTransitioner />
        <PrimerCardFormProvider>
          <BillingAddressFormStateProvider>
            <NavigationContainer screenMap={screenMap} />
          </BillingAddressFormStateProvider>
        </PrimerCardFormProvider>
      </NavigationProvider>
    </CheckoutFlowContext.Provider>
  );
}
