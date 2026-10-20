import { createContext } from 'react';

/**
 * Gives the sheet the action Android back runs instead of closing it. Returns a release that clears
 * this action only, so a stale cleanup can't drop a newer one.
 */
export type SetSheetBackAction = (action: () => void) => () => void;

export const SheetBackContext = createContext<SetSheetBackAction | null>(null);
