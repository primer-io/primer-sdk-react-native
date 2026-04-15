import { createContext, useContext } from 'react';

export interface SheetHeightContextValue {
  /** Set sheet height in absolute pixels. */
  setHeight: (height: number) => void;
  /** Set sheet height as a fraction of screen height (0-1). */
  setHeightRatio: (ratio: number) => void;
}

export const SheetHeightContext = createContext<SheetHeightContextValue | null>(null);

export function useSheetHeight(): SheetHeightContextValue {
  const context = useContext(SheetHeightContext);
  if (!context) {
    throw new Error('useSheetHeight must be used within a CheckoutSheet');
  }
  return context;
}
