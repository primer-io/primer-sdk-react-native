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
}

export function CheckoutButton({
  title,
  onPress,
  variant,
  loading = false,
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
}: CheckoutButtonProps) {
  const tokens = usePrimerTheme();
  const styles = useMemo(() => createStyles(tokens), [tokens]);

  const buttonStyle = variant === 'primary' ? styles.primaryButton : styles.outlinedButton;
  const textStyle = variant === 'primary' ? styles.primaryText : styles.outlinedText;
  const spinnerColor = variant === 'primary' ? tokens.colors.background : tokens.colors.textPrimary;
  const isInteractive = !disabled && !loading;
  const showDisabledTint = disabled && !loading;

  return (
    <TouchableOpacity
      style={[buttonStyle, showDisabledTint ? styles.dimmed : styles.opaque]}
      onPress={onPress}
      disabled={!isInteractive}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !isInteractive, busy: loading }}
    >
      {loading ? <ActivityIndicator color={spinnerColor} /> : <Text style={textStyle}>{title}</Text>}
    </TouchableOpacity>
  );
}

function createStyles(tokens: PrimerTokens) {
  const { colors, spacing, typography, radii, borders } = tokens;

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
      backgroundColor: colors.background,
      borderColor: colors.border,
      borderWidth: borders.default,
    },
    outlinedText: {
      ...baseText,
      color: colors.textPrimary,
    },
    primaryButton: {
      ...baseButton,
      backgroundColor: colors.primary,
    },
    primaryText: {
      ...baseText,
      color: colors.background,
    },
  });
  /* eslint-enable react-native/no-unused-styles */
}
