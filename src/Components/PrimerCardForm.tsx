import { useEffect, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from './internal/theme';
import type { PrimerTokens } from './internal/theme';
import { CardNumberInput } from './inputs/CardNumberInput';
import { ExpiryDateInput } from './inputs/ExpiryDateInput';
import { CVVInput } from './inputs/CVVInput';
import { CardholderNameInput } from './inputs/CardholderNameInput';
import type { PrimerTextInputRef } from './types/CardInputTypes';
import type { PrimerCardFormProps } from './types/PrimerCardFormTypes';

export function PrimerCardForm({
  cardForm,
  onSubmit,
  autoFocus = false,
  style,
  testID = 'primer-card-form',
}: PrimerCardFormProps) {
  const tokens = useTheme();
  const styles = useMemo(() => createStyles(tokens), [tokens]);

  const cardRef = useRef<PrimerTextInputRef>(null);
  const expiryRef = useRef<PrimerTextInputRef>(null);
  const cvvRef = useRef<PrimerTextInputRef>(null);
  const nameRef = useRef<PrimerTextInputRef>(null);

  // Delay tracks NavigationContainer's 250ms push; focusing sooner opens the
  // keyboard mid-slide and jumps the layout.
  useEffect(() => {
    if (!autoFocus) return;
    const handle = setTimeout(() => cardRef.current?.focus(), 300);
    return () => clearTimeout(handle);
  }, [autoFocus]);

  const disabled = cardForm.isSubmitting;

  return (
    <View style={[styles.container, style]} testID={testID}>
      <CardNumberInput
        ref={cardRef}
        cardForm={cardForm}
        editable={!disabled}
        returnKeyType="next"
        onSubmitEditing={() => expiryRef.current?.focus()}
        testID={`${testID}-card-number`}
      />

      <View style={styles.row}>
        <View style={styles.halfField}>
          <ExpiryDateInput
            ref={expiryRef}
            cardForm={cardForm}
            editable={!disabled}
            returnKeyType="next"
            onSubmitEditing={() => cvvRef.current?.focus()}
            testID={`${testID}-expiry`}
          />
        </View>
        <View style={styles.halfField}>
          <CVVInput
            ref={cvvRef}
            cardForm={cardForm}
            editable={!disabled}
            returnKeyType="next"
            onSubmitEditing={() => nameRef.current?.focus()}
            testID={`${testID}-cvv`}
            label={cardForm.descriptor.cvvLabel}
          />
        </View>
      </View>

      <CardholderNameInput
        ref={nameRef}
        cardForm={cardForm}
        editable={!disabled}
        returnKeyType="done"
        onSubmitEditing={onSubmit}
        testID={`${testID}-cardholder-name`}
      />
    </View>
  );
}

function createStyles(tokens: PrimerTokens) {
  const { spacing } = tokens;
  /* eslint-disable react-native/no-unused-styles */
  return StyleSheet.create({
    container: {
      gap: spacing.medium,
      width: '100%',
    },
    halfField: {
      flex: 1,
    },
    row: {
      flexDirection: 'row',
      gap: spacing.medium,
    },
  });
  /* eslint-enable react-native/no-unused-styles */
}
