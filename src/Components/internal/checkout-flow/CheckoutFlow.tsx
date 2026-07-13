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
import { CountrySelectorScreen } from '../screens/CountrySelectorScreen';
import { ErrorScreen } from '../screens/ErrorScreen';
import { SuccessScreen } from '../screens/SuccessScreen';
import { VaultedMethodsScreen } from '../screens/VaultedMethodsScreen';
import { PrimerCardFormProvider, BillingAddressFormStateProvider } from '../form-state';
import { CheckoutFlowContext } from './CheckoutFlowContext';
import { ReadinessTransitioner } from './ReadinessTransitioner';
import { PaymentOutcomeTransitioner } from './PaymentOutcomeTransitioner';

const SUCCESS_AUTO_DISMISS_MS = 3000;

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
  [CheckoutRoute.bankSelection]: BankSelectionScreen,
  [CheckoutRoute.rawDataForm]: RawDataFormScreen,
  [CheckoutRoute.klarna]: KlarnaScreen,
  [CheckoutRoute.countrySelector]: CountrySelectorScreen,
  [CheckoutRoute.processing]: LoadingScreen,
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
        <PrimerCardFormProvider>
          <BillingAddressFormStateProvider>
            <NavigationContainer screenMap={screenMap} />
          </BillingAddressFormStateProvider>
        </PrimerCardFormProvider>
      </NavigationProvider>
    </CheckoutFlowContext.Provider>
  );
}
