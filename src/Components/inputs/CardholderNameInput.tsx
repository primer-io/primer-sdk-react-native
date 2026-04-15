import { PrimerTextInput } from './PrimerTextInput';
import type { CardholderNameInputProps } from '../../models/components/CardInputTypes';

export function CardholderNameInput({
  cardForm,
  placeholder = 'Full name',
  label = 'Cardholder name',
  ...rest
}: CardholderNameInputProps) {
  return (
    <PrimerTextInput
      value={cardForm.cardholderName}
      onChangeText={cardForm.updateCardholderName}
      error={cardForm.errors.cardholderName}
      editable={!cardForm.isSubmitting}
      onBlur={() => cardForm.markFieldTouched('cardholderName')}
      autoComplete="name"
      autoCapitalize="words"
      label={label}
      placeholder={placeholder}
      {...rest}
    />
  );
}
