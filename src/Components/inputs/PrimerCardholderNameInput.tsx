import { forwardRef } from 'react';
import { PrimerTextInput } from './PrimerTextInput';
import { usePrimerLocalization } from '../internal/localization';
import { usePrimerCardForm } from '../hooks/usePrimerCardForm';
import type { PrimerCardholderNameInputProps, PrimerTextInputRef } from '../types/CardInputTypes';

export const PrimerCardholderNameInput = forwardRef<PrimerTextInputRef, PrimerCardholderNameInputProps>(
  function PrimerCardholderNameInput({ placeholder, label, ...rest }, ref) {
    const cardForm = usePrimerCardForm();
    const { t } = usePrimerLocalization();
    const resolvedLabel = label ?? t('primer_card_form_label_name');
    const resolvedPlaceholder = placeholder ?? t('primer_card_form_placeholder_name');

    return (
      <PrimerTextInput
        ref={ref}
        value={cardForm.cardholderName}
        onChangeText={cardForm.updateCardholderName}
        onFocus={() => cardForm.markFieldFocused('cardholderName')}
        onBlur={() => cardForm.markFieldBlurred('cardholderName')}
        autoComplete="name"
        autoCapitalize="words"
        label={resolvedLabel}
        placeholder={resolvedPlaceholder}
        error={cardForm.errors.cardholderName}
        {...rest}
      />
    );
  }
);
