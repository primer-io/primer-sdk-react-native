import { createContext } from 'react';
import type { NavigationState, CheckoutRoute, RouteParamMap, RouteEntry } from './types';

export interface NavigationContextValue {
  state: NavigationState;
  push: <R extends CheckoutRoute>(
    route: R,
    ...args: undefined extends RouteParamMap[R] ? [RouteParamMap[R]?] : [RouteParamMap[R]]
  ) => void;
  pop: () => void;
  replace: <R extends CheckoutRoute>(
    route: R,
    ...args: undefined extends RouteParamMap[R] ? [RouteParamMap[R]?] : [RouteParamMap[R]]
  ) => void;
  popToRoot: () => void;
  setAnimating: (isAnimating: boolean) => void;
}

export const NavigationContext = createContext<NavigationContextValue | null>(null);

export const RouteEntryContext = createContext<RouteEntry | null>(null);
