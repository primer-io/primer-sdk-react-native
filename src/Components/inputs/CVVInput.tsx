import { Image, StyleSheet } from 'react-native';
import { PrimerTextInput } from './PrimerTextInput';
import { TRAILING_ICON_MARGIN, TRAILING_ICON_SIZE } from './dimensions';
import { useLocalization } from '../internal/localization';
import type { CVVInputProps } from '../../models/components/CardInputTypes';

const cvvSource = require('../../assets/images/ic-cvv-hint.png');

export function CVVInput({ cardForm, placeholder, label, ...rest }: CVVInputProps) {
  const { t } = useLocalization();
  const resolvedLabel = label ?? t('primer_card_form_label_cvv');
  const resolvedPlaceholder = placeholder ?? t('primer_card_form_placeholder_cvv');

  return (
    <PrimerTextInput
      value={cardForm.cvv}
      onChangeText={cardForm.updateCVV}
      error={cardForm.errors.cvv}
      onBlur={() => cardForm.markFieldTouched('cvv')}
      keyboardType="number-pad"
      maxLength={4}
      secureTextEntry
      autoComplete="cc-csc"
      label={resolvedLabel}
      placeholder={resolvedPlaceholder}
      trailingContent={
        <Image
          source={cvvSource}
          style={styles.icon}
          resizeMode="contain"
          testID={rest.testID ? `${rest.testID}-hint-icon` : undefined}
        />
      }
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  icon: {
    height: TRAILING_ICON_SIZE,
    marginLeft: TRAILING_ICON_MARGIN,
    width: TRAILING_ICON_SIZE,
  },
});
