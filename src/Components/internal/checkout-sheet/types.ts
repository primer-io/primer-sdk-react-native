import type { ReactNode } from 'react';

export interface CheckoutSheetProps {
  /** Whether the sheet is visible. Drives show/hide animation. */
  visible: boolean;

  /** Called when the sheet finishes its dismiss animation (fully hidden). */
  onDismiss?: () => void;

  /**
   * Called when the user requests dismissal (backdrop tap, Android back at root).
   * The parent must set `visible` to false in response.
   */
  onRequestDismiss?: () => void;

  /** Whether tapping the backdrop dismisses the sheet. Default: true. */
  dismissOnBackdropPress?: boolean;

  /** Whether swiping down on the drag handle dismisses the sheet. Default: true. */
  dismissOnSwipeDown?: boolean;

  /** Whether to render the drag handle at the top of the sheet. Default: true when swipe is enabled. */
  showDragHandle?: boolean;

  /** Sheet content. Expected to contain NavigationProvider + NavigationContainer. */
  children: ReactNode;
}
