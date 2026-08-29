import { useCallback, useEffect, useMemo, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import type { TextStyle } from 'react-native';

import { PrimerAnalytics } from './analytics';
import { usePrimerTheme } from './internal/theme';
import type { PrimerTokens } from './internal/theme';
import { usePrimerLocalization } from './internal/localization';
import { getVaultRowDisplay } from './internal/vaultRowDisplay';
import { CheckoutRoute } from './internal/navigation/types';
import { useNavigation } from './internal/navigation/useNavigation';
import { CheckoutButton, VaultedCardCvvRow } from './internal/ui';
import { useCardNetworkDescriptor } from './hooks/useCardNetworkDescriptor';
import { usePrimerVaultManager } from './hooks/usePrimerVaultManager';
import { usePrimerCheckout } from './hooks/usePrimerCheckout';
import type { PrimerVaultedPaymentMethodProps, VaultedPaymentMethodItem } from './types/VaultedPaymentMethodTypes';

export const VAULTED_PAYMENT_METHOD_ROW_HEIGHT = 68;

export function PrimerVaultedPaymentMethod({ data, onPay, style }: PrimerVaultedPaymentMethodProps) {
  const tokens = usePrimerTheme();
  const styles = useMemo(() => createStyles(tokens), [tokens]);
  const { t } = usePrimerLocalization();

  const hook = usePrimerVaultManager();
  const { setCvvInputVisible } = usePrimerCheckout();
  const { replace } = useNavigation();
  const method = data !== undefined ? data : hook.activeMethod;

  const requiresCvvInput = hook.cvvInputVisible;
  const [cvvValue, setCvvValue] = useState('');

  const network = method?.kind === 'card' ? (method.network ?? null) : null;
  const shouldRequireCvv = hook.requiresVaultedCardCvv && method?.kind === 'card';
  const descriptor = useCardNetworkDescriptor(network);
  const expectedCvvLength = descriptor.cvvLength;
  const isCvvComplete = !requiresCvvInput || cvvValue.length === expectedCvvLength;

  useEffect(() => {
    setCvvInputVisible(false);
    setCvvValue('');
  }, [method?.id, setCvvInputVisible]);

  useEffect(() => {
    if (hook.vaultDisplayMode !== 'expanded') return;
    if (!requiresCvvInput) return;
    void PrimerAnalytics.trackEvent('VAULT_CVV_REQUIRED_DISMISSED', {
      vaultedMethodId: method?.id ?? '',
    });
    setCvvInputVisible(false);
    setCvvValue('');
  }, [hook.vaultDisplayMode, requiresCvvInput, method?.id, setCvvInputVisible]);

  // Recover if the merchant flag flips false mid-session while the CVV row is open —
  // otherwise the next Pay tap would still try to submit with a CVV.
  useEffect(() => {
    if (hook.requiresVaultedCardCvv) return;
    if (!requiresCvvInput) return;
    setCvvInputVisible(false);
    setCvvValue('');
  }, [hook.requiresVaultedCardCvv, requiresCvvInput, setCvvInputVisible]);

  const handlePress = useCallback(() => {
    if (!method) return;
    if (onPay) {
      onPay(method);
      return;
    }
    if (requiresCvvInput) {
      if (cvvValue.length !== expectedCvvLength) return;
      void PrimerAnalytics.trackEvent('VAULT_CVV_SUBMITTED', {
        vaultedMethodId: method.id,
        network: network ?? '',
      });
      replace(CheckoutRoute.processing);
      void hook.pay({ cvv: cvvValue });
      return;
    }
    if (shouldRequireCvv) {
      // Commit the selection so the layout collapses to lite — this is also what the
      // dismiss effect above listens for via vaultDisplayMode === 'expanded'.
      hook.selectVaultedMethodId(method.id);
      void PrimerAnalytics.trackEvent('VAULT_CVV_REQUIRED_RENDERED', {
        vaultedMethodId: method.id,
        network: network ?? '',
        expectedCvvLength: String(expectedCvvLength),
      });
      setCvvInputVisible(true);
      return;
    }
    replace(CheckoutRoute.processing);
    void hook.pay();
  }, [
    method,
    onPay,
    hook,
    replace,
    requiresCvvInput,
    cvvValue,
    expectedCvvLength,
    shouldRequireCvv,
    network,
    setCvvInputVisible,
  ]);

  if (!method) return null;

  const display = getVaultRowDisplay(method, t);

  return (
    <View style={[styles.outer, style]}>
      <View style={styles.tile}>
        <View style={styles.row} accessible accessibilityLabel={display.accessibilityLabel}>
          <View style={styles.leftCol}>
            {display.title != null && (
              <Text style={styles.primaryText} numberOfLines={1}>
                {display.title}
              </Text>
            )}
            <View style={styles.brandRow}>
              {display.iconUri != null && (
                <Image source={{ uri: display.iconUri }} style={styles.brandIcon} resizeMode="contain" />
              )}
              {display.secondaryLabel != null && (
                <Text style={styles.secondaryText} numberOfLines={1}>
                  {display.secondaryLabel}
                </Text>
              )}
            </View>
          </View>
          <View style={styles.rightCol}>
            {display.maskedNumber != null && <Text style={styles.mediumText}>{display.maskedNumber}</Text>}
            {display.expiryText != null && <Text style={styles.secondaryText}>{display.expiryText}</Text>}
          </View>
        </View>
        {requiresCvvInput && (
          <VaultedCardCvvRow
            value={cvvValue}
            onChangeValue={setCvvValue}
            cvvLabel={descriptor.cvvLabel}
            maxLength={descriptor.cvvLength}
            autoFocus
          />
        )}
      </View>
      <CheckoutButton
        title={t('primer_common_button_pay')}
        variant="primary"
        onPress={handlePress}
        disabled={!isCvvComplete}
      />
    </View>
  );
}

function createStyles(tokens: PrimerTokens) {
  const { colors, spacing, radii, borders, typography } = tokens;

  /* eslint-disable react-native/no-unused-styles */
  return StyleSheet.create({
    brandIcon: {
      height: 16,
      width: 22.4,
    },
    brandRow: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: spacing.xsmall,
    },
    leftCol: {
      flex: 1,
      gap: spacing.xsmall,
      justifyContent: 'center',
    },
    mediumText: {
      color: colors.textPrimary,
      fontFamily: typography.bodyMedium.fontFamily,
      fontSize: typography.bodyMedium.fontSize,
      fontWeight: typography.bodyMedium.fontWeight as TextStyle['fontWeight'],
      letterSpacing: typography.bodyMedium.letterSpacing,
      lineHeight: typography.bodyMedium.lineHeight,
      textAlign: 'right',
    },
    outer: {
      backgroundColor: colors.surface,
      borderRadius: radii.large,
      gap: spacing.small,
      padding: spacing.small,
      width: '100%',
    },
    primaryText: {
      color: colors.textPrimary,
      fontFamily: typography.bodyLarge.fontFamily,
      fontSize: typography.bodyLarge.fontSize,
      fontWeight: typography.bodyLarge.fontWeight as TextStyle['fontWeight'],
      letterSpacing: typography.bodyLarge.letterSpacing,
      lineHeight: typography.bodyLarge.lineHeight,
    },
    rightCol: {
      alignItems: 'flex-end',
      gap: spacing.xsmall,
    },
    row: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: spacing.medium,
    },
    secondaryText: {
      color: colors.textSecondary,
      fontFamily: typography.bodySmall.fontFamily,
      fontSize: typography.bodySmall.fontSize,
      fontWeight: typography.bodySmall.fontWeight as TextStyle['fontWeight'],
      letterSpacing: typography.bodySmall.letterSpacing,
      lineHeight: typography.bodySmall.lineHeight,
    },
    tile: {
      backgroundColor: colors.background,
      borderColor: colors.primary,
      borderRadius: radii.medium,
      borderWidth: borders.strong,
      gap: spacing.medium,
      padding: spacing.medium,
    },
  });
  /* eslint-enable react-native/no-unused-styles */
}

export type { VaultedPaymentMethodItem };
