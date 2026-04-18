import { PrimerTextInput } from './PrimerTextInput';
import { useLocalization } from '../internal/localization';
import type { CardholderNameInputProps } from '../../models/components/CardInputTypes';

export function CardholderNameInput({ cardForm, placeholder, label, ...rest }: CardholderNameInputProps) {
  const { t } = useLocalization();
  const resolvedLabel = label ?? t('primer_card_form_label_name');
  const resolvedPlaceholder = placeholder ?? t('primer_card_form_placeholder_name');

  return (
    <PrimerTextInput
      value={cardForm.cardholderName}
      onChangeText={cardForm.updateCardholderName}
      onBlur={() => cardForm.markFieldTouched('cardholderName')}
      autoComplete="name"
      autoCapitalize="words"
      label={resolvedLabel}
      placeholder={resolvedPlaceholder}
      {...rest}
    />
  );
}
