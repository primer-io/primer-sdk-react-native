import { useMemo } from 'react';
import { Image, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { TextStyle } from 'react-native';
import { useTheme } from '../theme';
import type { PrimerTokens } from '../theme';
import type { PaymentMethodButtonProps } from '../../../models/components/PrimerPaymentMethodListTypes';

export const PAYMENT_METHOD_BUTTON_HEIGHT = 44;
const BUTTON_HEIGHT = PAYMENT_METHOD_BUTTON_HEIGHT;

export function PaymentMethodButton({ item, onPress }: PaymentMethodButtonProps) {
  const tokens = useTheme();
  const styles = useMemo(() => createStyles(tokens), [tokens]);

  const isColorStyle = item.backgroundColor != null && item.logo != null;

  const surchargeLabel = item.surcharge != null ? `+${item.surcharge}` : null;

  if (isColorStyle) {
    return (
      <TouchableOpacity
        style={[styles.button, { backgroundColor: item.backgroundColor }]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Image source={{ uri: item.logo }} style={styles.logo} resizeMode="contain" />
        {surchargeLabel != null && <Text style={styles.surchargeLight}>{surchargeLabel}</Text>}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={[styles.button, styles.outlinedButton]} onPress={onPress} activeOpacity={0.7}>
      {item.logo != null && <Image source={{ uri: item.logo }} style={styles.icon} resizeMode="contain" />}
      <Text style={styles.outlinedText}>Pay with {item.name.toLowerCase()}</Text>
      {surchargeLabel != null && <Text style={styles.surchargeDark}>{surchargeLabel}</Text>}
    </TouchableOpacity>
  );
}

function createStyles(tokens: PrimerTokens) {
  const { colors, spacing, radii, borders, typography } = tokens;

  /* eslint-disable react-native/no-unused-styles */
  return StyleSheet.create({
    button: {
      alignItems: 'center',
      borderRadius: radii.medium,
      flexDirection: 'row',
      height: BUTTON_HEIGHT,
      justifyContent: 'center',
      overflow: 'hidden',
      paddingHorizontal: spacing.small,
      width: '100%',
    },
    icon: {
      height: 20,
      marginRight: spacing.small,
      width: 20,
    },
    logo: {
      height: BUTTON_HEIGHT * 0.5,
      width: '40%',
    },
    outlinedButton: {
      backgroundColor: colors.background,
      borderColor: colors.border,
      borderWidth: borders.default,
    },
    outlinedText: {
      color: colors.textPrimary,
      fontFamily: typography.titleLarge.fontFamily,
      fontSize: typography.titleLarge.fontSize,
      fontWeight: typography.titleLarge.fontWeight as TextStyle['fontWeight'],
      letterSpacing: typography.titleLarge.letterSpacing,
      lineHeight: typography.titleLarge.lineHeight,
      textAlign: 'center',
    },
    surchargeDark: {
      color: colors.textSecondary,
      fontFamily: typography.bodySmall.fontFamily,
      fontSize: typography.bodySmall.fontSize,
      fontWeight: typography.bodySmall.fontWeight as TextStyle['fontWeight'],
      marginLeft: spacing.small,
      position: 'absolute',
      right: spacing.small,
    },
    surchargeLight: {
      color: colors.background,
      fontFamily: typography.bodySmall.fontFamily,
      fontSize: typography.bodySmall.fontSize,
      fontWeight: typography.bodySmall.fontWeight as TextStyle['fontWeight'],
      opacity: 0.8,
      position: 'absolute',
      right: spacing.small,
    },
  });
  /* eslint-enable react-native/no-unused-styles */
}
