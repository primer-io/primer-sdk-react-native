import type { StyleProp, ViewStyle } from 'react-native';

/** Merchant-facing props for the composed `<PrimerCardForm />` component. */
export interface PrimerCardFormProps {
  /**
   * Fires when the user hits the return key on the last input. The host screen
   * typically routes this to the same handler that its Pay button uses.
   */
  onSubmit?: () => void;
  /**
   * Focus the card number field after mount. Deferred until interactions settle so
   * the keyboard opens after any nav transition, not during it.
   */
  autoFocus?: boolean;
  /** Optional outer container style. */
  style?: StyleProp<ViewStyle>;
  /** Test ID root for the form. Nested elements derive suffixed IDs. */
  testID?: string;
}
