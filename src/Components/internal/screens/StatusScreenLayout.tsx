import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { TextStyle } from 'react-native';
import { useTheme } from '../theme';
import type { PrimerTokens } from '../theme';

export interface StatusScreenLayoutProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children?: React.ReactNode;
}

export function StatusScreenLayout({ icon, title, subtitle, children }: StatusScreenLayoutProps) {
  const tokens = useTheme();
  const styles = useMemo(() => createStyles(tokens), [tokens]);

  return (
    <View style={styles.container}>
      <View style={styles.messageArea}>
        {icon}
        <View style={styles.textContent}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </View>
      {children != null && <View style={styles.childrenArea}>{children}</View>}
    </View>
  );
}

function createStyles(tokens: PrimerTokens) {
  const { colors, spacing, typography } = tokens;

  /* eslint-disable react-native/no-unused-styles */
  return StyleSheet.create({
    childrenArea: {
      paddingHorizontal: spacing.large,
      paddingTop: spacing.large,
      width: '100%',
    },
    container: {
      alignItems: 'center',
      width: '100%',
    },
    messageArea: {
      alignItems: 'center',
      gap: spacing.small,
      paddingHorizontal: spacing.xxxlarge,
      paddingVertical: spacing.xlarge,
    },
    subtitle: {
      color: colors.textSecondary,
      fontFamily: typography.bodyMedium.fontFamily,
      fontSize: typography.bodyMedium.fontSize,
      fontWeight: typography.bodyMedium.fontWeight as TextStyle['fontWeight'],
      letterSpacing: typography.bodyMedium.letterSpacing,
      lineHeight: typography.bodyMedium.lineHeight,
      textAlign: 'center',
    },
    textContent: {
      alignItems: 'center',
      gap: spacing.xsmall,
      width: '100%',
    },
    title: {
      color: colors.textPrimary,
      fontFamily: typography.bodyLarge.fontFamily,
      fontSize: typography.bodyLarge.fontSize,
      fontWeight: typography.bodyLarge.fontWeight as TextStyle['fontWeight'],
      letterSpacing: typography.bodyLarge.letterSpacing,
      lineHeight: typography.bodyLarge.lineHeight,
      textAlign: 'center',
    },
  });
  /* eslint-enable react-native/no-unused-styles */
}
