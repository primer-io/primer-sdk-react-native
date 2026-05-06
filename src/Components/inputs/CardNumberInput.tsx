import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { Image, StyleSheet, Text, View, type TextInputProps } from 'react-native';
import { PrimerTextInput } from './PrimerTextInput';
import { caretFromDigitIndex, countDigits, countDigitsBefore, targetDigitIndex } from './caret';
import { PLACEHOLDER_ICON_HEIGHT, PLACEHOLDER_ICON_WIDTH, TRAILING_ICON_MARGIN } from './dimensions';
import { useLocalization } from '../internal/localization';
import { useTheme } from '../internal/theme';
import { useCardNetwork } from '../hooks/useCardNetwork';
import { getNetworkAbbreviation } from '../internal/cardNetwork';
import type { CardNumberInputProps, PrimerTextInputRef } from '../types/CardInputTypes';

type SelectionChangeHandler = NonNullable<TextInputProps['onSelectionChange']>;

const placeholderSource = require('../../assets/images/ic-card-placeholder.png');

export const CardNumberInput = forwardRef<PrimerTextInputRef, CardNumberInputProps>(function CardNumberInput(
  { cardForm, placeholder, label, ...rest },
  ref
) {
  const { t } = useLocalization();
  const resolvedLabel = label ?? t('primer_card_form_label_number');
  const resolvedPlaceholder = placeholder ?? t('primer_card_form_placeholder_number');
  const { network, iconSource } = useCardNetwork();
  const tokens = useTheme();
  const abbreviation = iconSource == null && network ? getNetworkAbbreviation(network) : '';

  const innerRef = useRef<PrimerTextInputRef>(null);
  const lastSelectionRef = useRef({ start: 0, end: 0 });
  const pendingDigitIndexRef = useRef<number | null>(null);

  // Proxy focus/blur/setCaret to parent while keeping caret logic using innerRef.
  useImperativeHandle(
    ref,
    () => ({
      focus: () => innerRef.current?.focus(),
      blur: () => innerRef.current?.blur(),
      setCaret: (start: number, end?: number) => innerRef.current?.setCaret(start, end),
    }),
    []
  );

  useEffect(() => {
    if (pendingDigitIndexRef.current == null) return;
    const pos = caretFromDigitIndex(cardForm.cardNumber, pendingDigitIndexRef.current);
    innerRef.current?.setCaret(pos);
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
      ref={innerRef}
      value={cardForm.cardNumber}
      onChangeText={handleChangeText}
      onBlur={() => cardForm.markFieldTouched('cardNumber')}
      keyboardType="number-pad"
      maxLength={19}
      autoComplete="cc-number"
      label={resolvedLabel}
      placeholder={resolvedPlaceholder}
      error={cardForm.errors.cardNumber}
      onSelectionChange={handleSelectionChange}
      trailingContent={
        abbreviation ? (
          <View
            style={[
              styles.abbreviationChip,
              {
                borderColor: tokens.colors.border,
                borderRadius: tokens.radii.small,
                borderWidth: tokens.borders.input,
              },
            ]}
            testID={rest.testID ? `${rest.testID}-network-abbreviation` : undefined}
          >
            <Text
              style={{
                color: tokens.colors.textPrimary,
                fontFamily: tokens.typography.fontFamily,
                fontSize: tokens.typography.bodySmall.fontSize,
              }}
            >
              {abbreviation}
            </Text>
          </View>
        ) : (
          <Image
            source={iconSource ?? placeholderSource}
            style={styles.placeholder}
            resizeMode="contain"
            testID={rest.testID ? `${rest.testID}-network-icon` : undefined}
          />
        )
      }
      {...rest}
    />
  );
});

const styles = StyleSheet.create({
  abbreviationChip: {
    alignItems: 'center',
    height: PLACEHOLDER_ICON_HEIGHT,
    justifyContent: 'center',
    marginLeft: TRAILING_ICON_MARGIN,
    width: PLACEHOLDER_ICON_WIDTH,
  },
  placeholder: {
    height: PLACEHOLDER_ICON_HEIGHT,
    marginLeft: TRAILING_ICON_MARGIN,
    width: PLACEHOLDER_ICON_WIDTH,
  },
});
