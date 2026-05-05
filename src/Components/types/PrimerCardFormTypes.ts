import type { StyleProp, ViewStyle } from 'react-native';
import type { UseCardFormReturn } from './CardFormTypes';

/** Merchant-facing props for the composed `<PrimerCardForm />` component. */
export interface PrimerCardFormProps {
  /**
   * The card-form state returned by `useCardForm()`. Hoisted so the host screen
   * can share it with a Pay button rendered outside the form, compose sibling
   * sections that rely on the same state (e.g. billing address), and drive submit.
   */
  cardForm: UseCardFormReturn;
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
