import { useEffect, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { usePrimerTheme } from './internal/theme';
import type { PrimerTokens } from './internal/theme';
import { PrimerCardNumberInput } from './inputs/PrimerCardNumberInput';
import { PrimerExpiryDateInput } from './inputs/PrimerExpiryDateInput';
import { PrimerCVVInput } from './inputs/PrimerCVVInput';
import { PrimerCardholderNameInput } from './inputs/PrimerCardholderNameInput';
import { PrimerAcceptedCardNetworks } from './PrimerAcceptedCardNetworks';
import type { PrimerTextInputRef } from './types/CardInputTypes';
import type { PrimerCardFormProps } from './types/PrimerCardFormTypes';

export function PrimerCardForm({
  cardForm,
  onSubmit,
  autoFocus = false,
  style,
  testID = 'primer-card-form',
}: PrimerCardFormProps) {
  const tokens = usePrimerTheme();
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
      <PrimerAcceptedCardNetworks testID={`${testID}-accepted-networks`} />
      <PrimerCardNumberInput
        ref={cardRef}
        cardForm={cardForm}
        editable={!disabled}
        returnKeyType="next"
        onSubmitEditing={() => expiryRef.current?.focus()}
        testID={`${testID}-card-number`}
      />

      <View style={styles.row}>
        <View style={styles.halfField}>
          <PrimerExpiryDateInput
            ref={expiryRef}
            cardForm={cardForm}
            editable={!disabled}
            returnKeyType="next"
            onSubmitEditing={() => cvvRef.current?.focus()}
            testID={`${testID}-expiry`}
          />
        </View>
        <View style={styles.halfField}>
          <PrimerCVVInput
            ref={cvvRef}
            cardForm={cardForm}
            editable={!disabled}
            returnKeyType={cardForm.isCardholderNameVisible ? 'next' : 'done'}
            onSubmitEditing={cardForm.isCardholderNameVisible ? () => nameRef.current?.focus() : onSubmit}
            testID={`${testID}-cvv`}
            label={cardForm.descriptor.cvvLabel}
          />
        </View>
      </View>

      {cardForm.isCardholderNameVisible && (
        <PrimerCardholderNameInput
          ref={nameRef}
          cardForm={cardForm}
          editable={!disabled}
          returnKeyType="done"
          onSubmitEditing={onSubmit}
          testID={`${testID}-cardholder-name`}
        />
      )}
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
