import { createContext, useContext } from 'react';

export type HeightReleaseFn = () => void;

export interface SheetHeightContextValue {
  /**
   * Request `height` px of sheet. Returns a release for this specific request — the
   * per-request release (instead of a free-standing reset) prevents a stale screen's
   * cleanup from clobbering a newer screen's active request.
   */
  requestHeight: (height: number) => HeightReleaseFn;
  /** Same as `requestHeight` but expressed as a 0–1 ratio of screen height. */
  requestHeightRatio: (ratio: number) => HeightReleaseFn;
}

export const SheetHeightContext = createContext<SheetHeightContextValue | null>(null);

export function useSheetHeight(): SheetHeightContextValue {
  const context = useContext(SheetHeightContext);
  if (!context) {
    throw new Error('useSheetHeight must be used within a CheckoutSheet');
  }
  return context;
}
