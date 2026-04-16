import React, { useCallback, useEffect, useReducer, useRef } from 'react';
import { BackHandler, Platform } from 'react-native';
import { NavigationContext } from './NavigationContext';
import { navigationReducer } from './navigationReducer';
import type { CheckoutRoute, NavigationState, RouteParamMap } from './types';

interface NavigationProviderProps<R extends CheckoutRoute> {
  initialRoute: R;
  initialParams?: RouteParamMap[R];
  children: React.ReactNode;
}

let keyCounter = 0;
function generateKey(): string {
  keyCounter += 1;
  return `route-${keyCounter}`;
}

export function NavigationProvider<R extends CheckoutRoute>({
  initialRoute,
  initialParams,
  children,
}: NavigationProviderProps<R>) {
  const [state, dispatch] = useReducer(
    navigationReducer,
    undefined,
    (): NavigationState => ({
      stack: [{ route: initialRoute, params: initialParams as RouteParamMap[CheckoutRoute], key: generateKey() }],
      isAnimating: false,
    })
  );
  const stateRef = useRef(state);
  stateRef.current = state;

  const push = useCallback(
    <Route extends CheckoutRoute>(
      route: Route,
      ...args: undefined extends RouteParamMap[Route] ? [RouteParamMap[Route]?] : [RouteParamMap[Route]]
    ) => {
      if (stateRef.current.isAnimating) return;
      const params = (args[0] ?? undefined) as RouteParamMap[CheckoutRoute];
      dispatch({ type: 'push', route, params, key: generateKey() });
    },
    []
  );

  const pop = useCallback(() => {
    if (stateRef.current.isAnimating) return;
    dispatch({ type: 'pop' });
  }, []);

  const replace = useCallback(
    <Route extends CheckoutRoute>(
      route: Route,
      ...args: undefined extends RouteParamMap[Route] ? [RouteParamMap[Route]?] : [RouteParamMap[Route]]
    ) => {
      if (stateRef.current.isAnimating) return;
      const params = (args[0] ?? undefined) as RouteParamMap[CheckoutRoute];
      dispatch({ type: 'replace', route, params, key: generateKey() });
    },
    []
  );

  const popToRoot = useCallback(() => {
    if (stateRef.current.isAnimating) return;
    dispatch({ type: 'popToRoot' });
  }, []);

  const setAnimating = useCallback((isAnimating: boolean) => {
    dispatch({ type: 'setAnimating', isAnimating });
  }, []);

  // Android hardware back button
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const handler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (stateRef.current.stack.length > 1) {
        pop();
        return true;
      }
      return false;
    });

    return () => handler.remove();
  }, [pop]);

  const contextValue = React.useMemo(
    () => ({ state, push, pop, replace, popToRoot, setAnimating }),
    [state, push, pop, replace, popToRoot, setAnimating]
  );

  return <NavigationContext.Provider value={contextValue}>{children}</NavigationContext.Provider>;
}
