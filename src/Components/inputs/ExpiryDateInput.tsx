import { useEffect, useRef } from 'react';
import { Image, StyleSheet, type TextInputProps } from 'react-native';
import { PrimerTextInput } from './PrimerTextInput';
import { caretFromDigitIndex, countDigits, countDigitsBefore, targetDigitIndex } from './caret';
import { TRAILING_ICON_MARGIN, TRAILING_ICON_SIZE } from './dimensions';
import { useLocalization } from '../internal/localization';
import type { ExpiryDateInputProps, PrimerTextInputRef } from '../../models/components/CardInputTypes';

type SelectionChangeHandler = NonNullable<TextInputProps['onSelectionChange']>;

const calendarSource = require('../../assets/images/ic-expiry-calendar.png');

export function ExpiryDateInput({ cardForm, placeholder, label, ...rest }: ExpiryDateInputProps) {
  const { t } = useLocalization();
  const resolvedLabel = label ?? t('primer_card_form_label_expiry');
  const resolvedPlaceholder = placeholder ?? t('primer_card_form_placeholder_expiry');
  const inputRef = useRef<PrimerTextInputRef>(null);
  const lastSelectionRef = useRef({ start: 0, end: 0 });
  const pendingDigitIndexRef = useRef<number | null>(null);

  useEffect(() => {
    if (pendingDigitIndexRef.current == null) return;
    const pos = caretFromDigitIndex(cardForm.expiryDate, pendingDigitIndexRef.current);
    inputRef.current?.setCaret(pos);
    pendingDigitIndexRef.current = null;
  }, [cardForm.expiryDate]);

  const handleChangeText = (text: string) => {
    const prev = cardForm.expiryDate;
    const prevCaret = lastSelectionRef.current.start;
    const prevDigits = countDigits(prev);
    const nextDigits = countDigits(text);

    // Smart separator-delete: backspacing the "/" deletes the preceding month digit.
    if (prevDigits === nextDigits && text.length < prev.length) {
      const digitsBefore = countDigitsBefore(prev, prevCaret);
      if (digitsBefore > 0) {
        const raw = text.replace(/\D/g, '');
        const adjusted = raw.slice(0, digitsBefore - 1) + raw.slice(digitsBefore);
        pendingDigitIndexRef.current = digitsBefore - 1;
        cardForm.updateExpiryDate(adjusted);
        return;
      }
    }

    pendingDigitIndexRef.current = targetDigitIndex(prev, prevCaret, text);
    cardForm.updateExpiryDate(text);
  };

  const handleSelectionChange: SelectionChangeHandler = (e) => {
    lastSelectionRef.current = e.nativeEvent.selection;
  };

  return (
    <PrimerTextInput
      ref={inputRef}
      value={cardForm.expiryDate}
      onChangeText={handleChangeText}
      onBlur={() => cardForm.markFieldTouched('expiryDate')}
      keyboardType="number-pad"
      maxLength={5}
      autoComplete="cc-exp"
      label={resolvedLabel}
      placeholder={resolvedPlaceholder}
      onSelectionChange={handleSelectionChange}
      trailingContent={
        <Image
          source={calendarSource}
          style={styles.icon}
          resizeMode="contain"
          testID={rest.testID ? `${rest.testID}-calendar-icon` : undefined}
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
