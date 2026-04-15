import { PrimerTextInput } from './PrimerTextInput';
import type { CVVInputProps } from '../../models/components/CardInputTypes';

export function CVVInput({ cardForm, placeholder = '123', label = 'CVV', ...rest }: CVVInputProps) {
  return (
    <PrimerTextInput
      value={cardForm.cvv}
      onChangeText={cardForm.updateCVV}
      error={cardForm.errors.cvv}
      editable={!cardForm.isSubmitting}
      onBlur={() => cardForm.markFieldTouched('cvv')}
      keyboardType="number-pad"
      maxLength={4}
      secureTextEntry
      autoComplete="cc-csc"
      label={label}
      placeholder={placeholder}
      {...rest}
    />
  );
}
