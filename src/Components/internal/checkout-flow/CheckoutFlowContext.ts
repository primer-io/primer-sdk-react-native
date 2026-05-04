import { createContext, useContext } from 'react';

export interface CheckoutFlowContextValue {
  /** Called when the user requests to cancel/close the checkout flow */
  onCancel: () => void;
}

export const CheckoutFlowContext = createContext<CheckoutFlowContextValue | null>(null);

export function useCheckoutFlow(): CheckoutFlowContextValue {
  const context = useContext(CheckoutFlowContext);
  if (!context) {
    throw new Error('useCheckoutFlow must be used within a CheckoutFlow');
  }
  return context;
}
