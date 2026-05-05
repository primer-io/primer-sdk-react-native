import { useCallback, useMemo } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import type { TextStyle } from 'react-native';

import { useTheme } from './internal/theme';
import type { PrimerTokens } from './internal/theme';
import { useLocalization } from './internal/localization';
import { CheckoutRoute } from './internal/navigation/types';
import { useNavigation } from './internal/navigation/useNavigation';
import { CheckoutButton } from './internal/ui';
import { useVaultedPaymentMethods } from './hooks/useVaultedPaymentMethods';
import type { PrimerVaultedPaymentMethodProps, VaultedPaymentMethodItem } from './types/VaultedPaymentMethodTypes';

export const VAULTED_PAYMENT_METHOD_ROW_HEIGHT = 68;

export function PrimerVaultedPaymentMethod({ data, onPay, style }: PrimerVaultedPaymentMethodProps) {
  const tokens = useTheme();
  const styles = useMemo(() => createStyles(tokens), [tokens]);
  const { t } = useLocalization();

  const hook = useVaultedPaymentMethods();
  const { replace } = useNavigation();
  const method = data !== undefined ? data : hook.primaryMethod;

  const handlePress = useCallback(() => {
    if (!method) return;
    if (onPay) {
      onPay(method);
      return;
    }
    // Jump to processing on Pay so the user doesn't stare at a stale form during tokenization.
    // Matches the CardFormScreen submit pattern.
    replace(CheckoutRoute.processing);
    void hook.pay();
  }, [method, onPay, hook, replace]);

  if (!method) return null;

  const maskedNumber = method.last4 != null ? t('primer_vault_format_masked', { last4: method.last4 }) : null;
  const expiryText =
    method.expiryMonth != null && method.expiryYear != null
      ? t('primer_vault_format_expires', { month: method.expiryMonth, year: method.expiryYear })
      : null;

  return (
    <View style={[styles.outer, style]}>
      <View style={styles.tile}>
        <View style={styles.row}>
          <View style={styles.leftCol}>
            {method.cardholderName != null && (
              <Text style={styles.primaryText} numberOfLines={1}>
                {method.cardholderName}
              </Text>
            )}
            <View style={styles.brandRow}>
              {method.brandIconUri != null && (
                <Image source={{ uri: method.brandIconUri }} style={styles.brandIcon} resizeMode="contain" />
              )}
              {method.brandName != null && (
                <Text style={styles.secondaryText} numberOfLines={1}>
                  {method.brandName}
                </Text>
              )}
            </View>
          </View>
          <View style={styles.rightCol}>
            {maskedNumber != null && <Text style={styles.mediumText}>{maskedNumber}</Text>}
            {expiryText != null && <Text style={styles.secondaryText}>{expiryText}</Text>}
          </View>
        </View>
      </View>
      <CheckoutButton title={t('primer_common_button_pay')} variant="primary" onPress={handlePress} />
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
      padding: spacing.medium,
    },
  });
  /* eslint-enable react-native/no-unused-styles */
}

export type { VaultedPaymentMethodItem };
