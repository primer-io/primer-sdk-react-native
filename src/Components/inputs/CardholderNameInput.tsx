import { forwardRef } from 'react';
import { PrimerTextInput } from './PrimerTextInput';
import { useLocalization } from '../internal/localization';
import type { CardholderNameInputProps, PrimerTextInputRef } from '../types/CardInputTypes';

export const CardholderNameInput = forwardRef<PrimerTextInputRef, CardholderNameInputProps>(
  function CardholderNameInput({ cardForm, placeholder, label, ...rest }, ref) {
    const { t } = useLocalization();
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
