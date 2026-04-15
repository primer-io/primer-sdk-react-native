import React, { useEffect, useMemo, useRef } from 'react';
import { NavigationProvider } from '../navigation/NavigationProvider';
import { NavigationContainer } from '../navigation/NavigationContainer';
import { useNavigation } from '../navigation/useNavigation';
import { CheckoutRoute } from '../navigation/types';
import type { CheckoutRoute as CheckoutRouteType } from '../navigation/types';
import { usePrimerCheckout } from '../../hooks/usePrimerCheckout';
import { LoadingScreen } from '../screens/LoadingScreen';
import { MethodSelectionScreen } from '../screens/MethodSelectionScreen';
import { ErrorScreen } from '../screens/ErrorScreen';
import { CheckoutFlowContext } from './CheckoutFlowContext';

function CheckoutLoadingScreen() {
  return <LoadingScreen title="Loading your secure checkout" subtitle="This won't take long" />;
}

const screenMap: Partial<Record<CheckoutRouteType, React.ComponentType>> = {
  [CheckoutRoute.loading]: CheckoutLoadingScreen,
  [CheckoutRoute.methodSelection]: MethodSelectionScreen,
  [CheckoutRoute.error]: ErrorScreen,
};

/**
 * Watches checkout readiness and navigates from loading to method selection.
 * Renders nothing — purely a side-effect component.
 */
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

export interface CheckoutFlowProps {
  /** Called when the user requests to cancel/close the checkout flow */
  onCancel?: () => void;
}

export function CheckoutFlow({ onCancel }: CheckoutFlowProps = {}) {
  const contextValue = useMemo(() => ({ onCancel: onCancel ?? (() => {}) }), [onCancel]);

  return (
    <CheckoutFlowContext.Provider value={contextValue}>
      <NavigationProvider initialRoute={CheckoutRoute.loading}>
        <ReadinessTransitioner />
        <NavigationContainer screenMap={screenMap} />
      </NavigationProvider>
    </CheckoutFlowContext.Provider>
  );
}
