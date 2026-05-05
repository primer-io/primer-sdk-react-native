import { useCallback, useMemo } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { TextStyle } from 'react-native';
import { useTheme } from '../theme';
import type { PrimerTokens } from '../theme';
import { NavigationHeader } from '../navigation/NavigationHeader';
import { useNavigation } from '../navigation/useNavigation';
import { CheckoutRoute } from '../navigation/types';
import { useLocalization } from '../localization';
import { useCheckoutFlow } from '../checkout-flow/CheckoutFlowContext';
import { PrimerCardForm } from '../../PrimerCardForm';
import { useCardForm } from '../../hooks/useCardForm';

export function CardFormScreen() {
  const tokens = useTheme();
  const { t } = useLocalization();
  const { pop, replace, canGoBack } = useNavigation();
  const { onCancel } = useCheckoutFlow();
  const cardForm = useCardForm();
  const styles = useMemo(() => createStyles(tokens), [tokens]);

  const canSubmit = cardForm.isValid && !cardForm.isSubmitting;

  // Jump to processing on Pay so the user doesn't stare at a stale form during tokenization.
  const handlePay = useCallback(() => {
    if (!canSubmit) return;
    replace(CheckoutRoute.processing);
    cardForm.submit();
  }, [canSubmit, cardForm, replace]);

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        automaticallyAdjustKeyboardInsets
      >
        <NavigationHeader
          title={t('primer_card_form_title')}
          showBackButton={canGoBack}
          backLabel={t('primer_common_back')}
          onBackPress={pop}
          rightAction={{ label: t('primer_common_button_cancel'), onPress: onCancel }}
        />
        <View style={styles.body}>
          <PrimerCardForm cardForm={cardForm} autoFocus onSubmit={handlePay} />
          <TouchableOpacity
            onPress={handlePay}
            disabled={!canSubmit}
            activeOpacity={0.7}
            style={[styles.payButton, !canSubmit && styles.payButtonDisabled]}
            accessibilityRole="button"
            accessibilityState={{ disabled: !canSubmit, busy: cardForm.isSubmitting }}
            accessibilityLabel={t('accessibility_card_form_submit_label')}
            accessibilityHint={
              cardForm.isSubmitting
                ? t('accessibility_card_form_submit_loading')
                : canSubmit
                  ? t('accessibility_card_form_submit_hint')
                  : t('accessibility_card_form_submit_disabled')
            }
            testID="primer-card-form-submit"
          >
            {cardForm.isSubmitting ? (
              <ActivityIndicator color={tokens.colors.background} />
            ) : (
              <Text style={styles.payButtonText}>{t('primer_common_button_pay')}</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

function createStyles(tokens: PrimerTokens) {
  const { colors, radii, spacing, typography } = tokens;
  /* eslint-disable react-native/no-unused-styles */
  return StyleSheet.create({
    body: {
      gap: spacing.medium,
      paddingBottom: spacing.large,
      paddingHorizontal: spacing.large,
      paddingTop: spacing.large,
    },
    payButton: {
      alignItems: 'center',
      backgroundColor: colors.primary,
      borderRadius: radii.medium,
      justifyContent: 'center',
      marginTop: spacing.small,
      minHeight: 44,
      padding: spacing.medium,
      width: '100%',
    },
    payButtonDisabled: {
      opacity: 0.5,
    },
    payButtonText: {
      color: colors.background,
      fontFamily: typography.titleLarge.fontFamily,
      fontSize: typography.titleLarge.fontSize,
      fontWeight: typography.titleLarge.fontWeight as TextStyle['fontWeight'],
      letterSpacing: typography.titleLarge.letterSpacing,
      lineHeight: typography.titleLarge.lineHeight,
      textAlign: 'center',
    },
    root: {
      flex: 1,
    },
    scroll: {
      flexGrow: 1,
      paddingTop: spacing.large,
    },
  });
  /* eslint-enable react-native/no-unused-styles */
}
