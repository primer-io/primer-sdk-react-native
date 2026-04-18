import { useEffect, useRef } from 'react';
import { Image, StyleSheet, type TextInputProps } from 'react-native';
import { PrimerTextInput } from './PrimerTextInput';
import { caretFromDigitIndex, countDigits, countDigitsBefore, targetDigitIndex } from './caret';
import { PLACEHOLDER_ICON_HEIGHT, PLACEHOLDER_ICON_WIDTH, TRAILING_ICON_MARGIN } from './dimensions';
import { useLocalization } from '../internal/localization';
import type { CardNumberInputProps, PrimerTextInputRef } from '../../models/components/CardInputTypes';

type SelectionChangeHandler = NonNullable<TextInputProps['onSelectionChange']>;

const placeholderSource = require('../../assets/images/ic-card-placeholder.png');

export function CardNumberInput({ cardForm, placeholder, label, ...rest }: CardNumberInputProps) {
  const { t } = useLocalization();
  const resolvedLabel = label ?? t('primer_card_form_label_number');
  const resolvedPlaceholder = placeholder ?? t('primer_card_form_placeholder_number');

  const inputRef = useRef<PrimerTextInputRef>(null);
  const lastSelectionRef = useRef({ start: 0, end: 0 });
  const pendingDigitIndexRef = useRef<number | null>(null);

  useEffect(() => {
    if (pendingDigitIndexRef.current == null) return;
    const pos = caretFromDigitIndex(cardForm.cardNumber, pendingDigitIndexRef.current);
    inputRef.current?.setCaret(pos);
    pendingDigitIndexRef.current = null;
  }, [cardForm.cardNumber]);

  const handleChangeText = (text: string) => {
    const prev = cardForm.cardNumber;
    const prevCaret = lastSelectionRef.current.start;
    const prevDigits = countDigits(prev);
    const nextDigits = countDigits(text);

    // Smart separator-delete: backspacing a space deletes the digit before it.
    if (prevDigits === nextDigits && text.length < prev.length) {
      const digitsBefore = countDigitsBefore(prev, prevCaret);
      if (digitsBefore > 0) {
        const raw = text.replace(/\D/g, '');
        const adjusted = raw.slice(0, digitsBefore - 1) + raw.slice(digitsBefore);
        pendingDigitIndexRef.current = digitsBefore - 1;
        cardForm.updateCardNumber(adjusted);
        return;
      }
    }

    pendingDigitIndexRef.current = targetDigitIndex(prev, prevCaret, text);
    cardForm.updateCardNumber(text);
  };

  const handleSelectionChange: SelectionChangeHandler = (e) => {
    lastSelectionRef.current = e.nativeEvent.selection;
  };

  return (
    <PrimerTextInput
      ref={inputRef}
      value={cardForm.cardNumber}
      onChangeText={handleChangeText}
      onBlur={() => cardForm.markFieldTouched('cardNumber')}
      keyboardType="number-pad"
      maxLength={19}
      autoComplete="cc-number"
      label={resolvedLabel}
      placeholder={resolvedPlaceholder}
      onSelectionChange={handleSelectionChange}
      trailingContent={
        <Image
          source={placeholderSource}
          style={styles.placeholder}
          resizeMode="contain"
          testID={rest.testID ? `${rest.testID}-placeholder-icon` : undefined}
        />
      }
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  placeholder: {
    height: PLACEHOLDER_ICON_HEIGHT,
    marginLeft: TRAILING_ICON_MARGIN,
    width: PLACEHOLDER_ICON_WIDTH,
  },
});
