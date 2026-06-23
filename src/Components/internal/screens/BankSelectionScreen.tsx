import { useEffect, useMemo } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { TextStyle } from 'react-native';

import { usePrimerTheme } from '../theme';
import type { PrimerTokens } from '../theme';
import { NavigationHeader } from '../navigation/NavigationHeader';
import { useNavigation } from '../navigation/useNavigation';
import { useRoute } from '../navigation/useRoute';
import { CheckoutRoute } from '../navigation/types';
import { usePrimerLocalization } from '../localization';
import { useCheckoutFlow } from '../checkout-flow/CheckoutFlowContext';
import { usePrimerPaymentMethod } from '../../hooks/usePrimerPaymentMethod';
import { useBottomSafeArea } from './useBottomSafeArea';

/**
 * Prebuilt bank-selection screen for COMPONENT_WITH_REDIRECT methods (iDEAL; Android Dotpay).
 * Fetches the issuer list, lets the shopper pick a bank, and on submit hands off to the native
 * redirect — the outcome returns through the shared handling (→ processing → result), so the
 * native SDK owns the redirect + polling. Dogfoods the public `usePrimerPaymentMethod` API.
 */
export function BankSelectionScreen() {
  const tokens = usePrimerTheme();
  const styles = useMemo(() => createStyles(tokens), [tokens]);
  const { t } = usePrimerLocalization();
  const { params } = useRoute<CheckoutRoute.bankSelection>();
  const { pop, replace, canGoBack } = useNavigation();
  const { onCancel } = useCheckoutFlow();
  const bottomInset = useBottomSafeArea();

  const method = usePrimerPaymentMethod(params.paymentMethodType);
  const bank = method.kind === 'bankSelection' ? method : null;
  const start = bank?.start;

  // Fetch the issuer list on mount.
  useEffect(() => {
    void start?.();
  }, [start]);

  // Defensive: this screen is only routed to for bank-selection methods.
  if (!bank) {
    return null;
  }

  const { banks, isLoading, selectedBankId, selectBank, submit } = bank;
  const canSubmit = selectedBankId != null && !isLoading;

  const handleSubmit = () => {
    if (!canSubmit) return;
    // Mirror the card form: jump to processing while the native redirect runs;
    // PaymentOutcomeTransitioner navigates away once the outcome arrives.
    replace(CheckoutRoute.processing);
    void submit();
  };

  return (
    <View style={styles.root}>
      <NavigationHeader
        title={t('primer_checkout_title')}
        showBackButton={canGoBack}
        backLabel={t('primer_common_back')}
        onBackPress={pop}
        rightAction={{ label: t('primer_common_button_cancel'), onPress: onCancel }}
      />
      {isLoading && banks.length === 0 ? (
        <View style={styles.loading}>
          <ActivityIndicator color={tokens.colors.primary} />
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {banks.map((bankItem) => {
            const selected = bankItem.id === selectedBankId;
            return (
              <TouchableOpacity
                key={bankItem.id}
                onPress={() => selectBank(bankItem.id)}
                disabled={bankItem.disabled}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityState={{ selected, disabled: !!bankItem.disabled }}
                style={[
                  styles.bankRow,
                  selected && styles.bankRowSelected,
                  bankItem.disabled && styles.bankRowDisabled,
                ]}
              >
                {bankItem.iconUrl ? (
                  <Image source={{ uri: bankItem.iconUrl }} style={styles.bankIcon} resizeMode="contain" />
                ) : (
                  <View style={styles.bankIcon} />
                )}
                <Text style={styles.bankName}>{bankItem.name}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
      <View style={[styles.footer, { paddingBottom: Math.max(bottomInset, tokens.spacing.large) }]}>
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!canSubmit}
          activeOpacity={0.7}
          style={[styles.payButton, !canSubmit && styles.payButtonDisabled]}
          accessibilityRole="button"
          accessibilityState={{ disabled: !canSubmit }}
        >
          <Text style={styles.payButtonText}>{t('primer_common_button_pay')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function createStyles(tokens: PrimerTokens) {
  const { colors, radii, spacing, typography } = tokens;
  /* eslint-disable react-native/no-unused-styles */
  return StyleSheet.create({
    bankIcon: {
      height: 28,
      width: 28,
    },
    bankName: {
      color: colors.textPrimary,
      fontFamily: typography.titleLarge.fontFamily,
      fontSize: typography.titleLarge.fontSize,
      fontWeight: typography.titleLarge.fontWeight as TextStyle['fontWeight'],
      letterSpacing: typography.titleLarge.letterSpacing,
      lineHeight: typography.titleLarge.lineHeight,
    },
    bankRow: {
      alignItems: 'center',
      borderColor: colors.border,
      borderRadius: radii.medium,
      borderWidth: StyleSheet.hairlineWidth,
      flexDirection: 'row',
      gap: spacing.medium,
      minHeight: 56,
      padding: spacing.medium,
    },
    bankRowDisabled: {
      opacity: 0.4,
    },
    bankRowSelected: {
      borderColor: colors.primary,
      borderWidth: 2,
    },
    footer: {
      backgroundColor: colors.background,
      paddingHorizontal: spacing.large,
      paddingTop: spacing.small,
    },
    loading: {
      alignItems: 'center',
      flex: 1,
      justifyContent: 'center',
    },
    payButton: {
      alignItems: 'center',
      backgroundColor: colors.primary,
      borderRadius: radii.medium,
      justifyContent: 'center',
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
    scrollContent: {
      gap: spacing.small,
      paddingHorizontal: spacing.large,
      paddingTop: spacing.large,
    },
    scrollView: {
      flex: 1,
    },
  });
  /* eslint-enable react-native/no-unused-styles */
}
