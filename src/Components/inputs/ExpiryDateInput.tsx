import { PrimerTextInput } from './PrimerTextInput';
import type { ExpiryDateInputProps } from '../../models/components/CardInputTypes';

export function ExpiryDateInput({
  cardForm,
  placeholder = 'MM/YY',
  label = 'Expiry (MM/YY)',
  ...rest
}: ExpiryDateInputProps) {
  return (
    <PrimerTextInput
      value={cardForm.expiryDate}
      onChangeText={cardForm.updateExpiryDate}
      error={cardForm.errors.expiryDate}
      editable={!cardForm.isSubmitting}
      onBlur={() => cardForm.markFieldTouched('expiryDate')}
      keyboardType="number-pad"
      maxLength={5}
      autoComplete="cc-exp"
      label={label}
      placeholder={placeholder}
      {...rest}
    />
  );
}
