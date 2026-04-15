import { useContext } from 'react';
import { NavigationContext } from './NavigationContext';

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }

  return {
    push: context.push,
    pop: context.pop,
    replace: context.replace,
    popToRoot: context.popToRoot,
    canGoBack: context.state.stack.length > 1,
  };
}
