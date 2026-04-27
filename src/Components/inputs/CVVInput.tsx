import { forwardRef } from 'react';
import { Image, StyleSheet } from 'react-native';
import { PrimerTextInput } from './PrimerTextInput';
import { TRAILING_ICON_MARGIN, TRAILING_ICON_SIZE } from './dimensions';
import { useLocalization } from '../internal/localization';
import type { CVVInputProps, PrimerTextInputRef } from '../types/CardInputTypes';

const cvvSource = require('../../assets/images/ic-cvv-hint.png');

export const CVVInput = forwardRef<PrimerTextInputRef, CVVInputProps>(function CVVInput(
  { cardForm, placeholder, label, ...rest },
  ref
) {
  const { t } = useLocalization();
  const resolvedLabel = label ?? t('primer_card_form_label_cvv');
  const resolvedPlaceholder = placeholder ?? t('primer_card_form_placeholder_cvv');

  return (
    <PrimerTextInput
      ref={ref}
      value={cardForm.cvv}
      onChangeText={cardForm.updateCVV}
      onBlur={() => cardForm.markFieldTouched('cvv')}
      keyboardType="number-pad"
      maxLength={4}
      secureTextEntry
      autoComplete="cc-csc"
      label={resolvedLabel}
      placeholder={resolvedPlaceholder}
      error={cardForm.errors.cvv}
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
});

const styles = StyleSheet.create({
  icon: {
    height: TRAILING_ICON_SIZE,
    marginLeft: TRAILING_ICON_MARGIN,
    width: TRAILING_ICON_SIZE,
  },
});
