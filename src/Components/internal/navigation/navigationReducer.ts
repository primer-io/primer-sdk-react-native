import type { NavigationState, NavigationAction } from './types';

export function navigationReducer(state: NavigationState, action: NavigationAction): NavigationState {
  switch (action.type) {
    case 'push':
      return {
        ...state,
        stack: [...state.stack, { route: action.route, params: action.params, key: action.key }],
      };

    case 'pop':
      if (state.stack.length <= 1) {
        return state;
      }
      return {
        ...state,
        stack: state.stack.slice(0, -1),
      };

    case 'replace': {
      const newStack = [...state.stack];
      newStack[newStack.length - 1] = { route: action.route, params: action.params, key: action.key };
      return {
        ...state,
        stack: newStack,
      };
    }

    case 'popToRoot':
      if (state.stack.length <= 1) {
        return state;
      }
      return {
        ...state,
        stack: [state.stack[0]!],
      };

    case 'setAnimating':
      return {
        ...state,
        isAnimating: action.isAnimating,
      };

    default:
      return state;
  }
}
