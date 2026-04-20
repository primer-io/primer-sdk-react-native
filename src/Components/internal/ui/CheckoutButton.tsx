import { useMemo } from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import type { TextStyle } from 'react-native';
import { useTheme } from '../theme';
import type { PrimerTokens } from '../theme';

export interface CheckoutButtonProps {
  title: string;
  onPress: () => void;
  variant: 'primary' | 'outlined';
}

export function CheckoutButton({ title, onPress, variant }: CheckoutButtonProps) {
  const tokens = useTheme();
  const styles = useMemo(() => createStyles(tokens), [tokens]);

  const buttonStyle = variant === 'primary' ? styles.primaryButton : styles.outlinedButton;
  const textStyle = variant === 'primary' ? styles.primaryText : styles.outlinedText;

  return (
    <TouchableOpacity style={buttonStyle} onPress={onPress} activeOpacity={0.7}>
      <Text style={textStyle}>{title}</Text>
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
