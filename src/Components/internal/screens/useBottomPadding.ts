import { usePrimerTheme } from '../theme';
import { useBottomSafeArea } from './useBottomSafeArea';

// The native sheets keep the system bar's space and add spacing.large above it.
export function useBottomPadding(): number {
  const tokens = usePrimerTheme();
  return useBottomSafeArea() + tokens.spacing.large;
}
