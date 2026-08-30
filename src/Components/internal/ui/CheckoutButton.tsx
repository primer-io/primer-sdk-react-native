import { useMemo } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { TextStyle } from 'react-native';
import { usePrimerTheme } from '../theme';
import type { PrimerTokens } from '../theme';

export interface CheckoutButtonProps {
  title: string;
  onPress: () => void;
  variant: 'primary' | 'outlined';
  loading?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
}

export function CheckoutButton({
  title,
  onPress,
  variant,
  loading = false,
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
  testID,
}: CheckoutButtonProps) {
  const tokens = usePrimerTheme();
  const styles = useMemo(() => createStyles(tokens), [tokens]);

  const isPrimary = variant === 'primary';
  const isInteractive = !disabled && !loading;
  const showDisabledTint = disabled && !loading;

  const buttonStyle = isPrimary
    ? showDisabledTint
      ? styles.primaryButtonDisabled
      : styles.primaryButton
    : styles.outlinedButton;
  const textStyle = isPrimary
    ? showDisabledTint
      ? styles.primaryTextDisabled
      : styles.primaryText
    : styles.outlinedText;
  const spinnerColor = isPrimary ? tokens.colors.onBrand : tokens.colors.textPrimary;

  return (
    <TouchableOpacity
      style={[buttonStyle, !isPrimary && showDisabledTint ? styles.dimmed : styles.opaque]}
      onPress={onPress}
      disabled={!isInteractive}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !isInteractive, busy: loading }}
      testID={testID}
    >
      {loading ? <ActivityIndicator color={spinnerColor} /> : <Text style={textStyle}>{title}</Text>}
    </TouchableOpacity>
  );
}

function createStyles(tokens: PrimerTokens) {
  const { colors, spacing, typography, radii, widths } = tokens;

  const baseButton = {
    alignItems: 'center' as const,
    borderRadius: radii.medium,
    justifyContent: 'center' as const,
    padding: spacing.medium,
    width: '100%' as const,
  };

  const baseText = {
    fontFamily: typography.titleLarge.fontFamily,
    fontSize: typography.titleLarge.fontSize,
    fontWeight: typography.titleLarge.fontWeight as TextStyle['fontWeight'],
    letterSpacing: typography.titleLarge.letterSpacing,
    lineHeight: typography.titleLarge.lineHeight,
    textAlign: 'center' as const,
  };

  /* eslint-disable react-native/no-unused-styles */
  return StyleSheet.create({
    dimmed: {
      opacity: 0.5,
    },
    opaque: {
      opacity: 1,
    },
    outlinedButton: {
      ...baseButton,
      backgroundColor: colors.backgroundPrimary,
      borderColor: colors.borderOutlinedDefault,
      borderWidth: widths.default,
    },
    outlinedText: {
      ...baseText,
      color: colors.textPrimary,
    },
    primaryButton: {
      ...baseButton,
      backgroundColor: colors.brand,
    },
    primaryButtonDisabled: {
      ...baseButton,
      backgroundColor: colors.backgroundOutlinedDisabled,
    },
    primaryText: {
      ...baseText,
      color: colors.onBrand,
    },
    primaryTextDisabled: {
      ...baseText,
      color: colors.textDisabled,
    },
  });
  /* eslint-enable react-native/no-unused-styles */
}
