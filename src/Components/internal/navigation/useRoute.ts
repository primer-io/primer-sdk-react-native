import { useContext } from 'react';
import { RouteEntryContext, NavigationContext } from './NavigationContext';
import type { CheckoutRoute, RouteParamMap } from './types';

export function useRoute<R extends CheckoutRoute>() {
  const entry = useContext(RouteEntryContext);
  const navContext = useContext(NavigationContext);

  if (!entry && !navContext) {
    throw new Error('useRoute must be used within a NavigationProvider');
  }

  const current = entry ?? navContext!.state.stack[navContext!.state.stack.length - 1]!;
  return {
    route: current.route as R,
    params: current.params as RouteParamMap[R],
  };
}
