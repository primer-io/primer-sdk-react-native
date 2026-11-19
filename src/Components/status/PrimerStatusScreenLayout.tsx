import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { usePrimerTheme } from '../internal/theme';
import type { PrimerTokens } from '../internal/theme';
import { toTextStyle } from '../internal/theme/typography';

export interface PrimerStatusScreenLayoutProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children?: React.ReactNode;
}

export function PrimerStatusScreenLayout({ icon, title, subtitle, children }: PrimerStatusScreenLayoutProps) {
  const tokens = usePrimerTheme();
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
  const { colors, sizes, spacing, typography } = tokens;

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
      paddingHorizontal: sizes.xlarge,
      paddingVertical: spacing.xlarge,
    },
    subtitle: {
      color: colors.textSecondary,
      ...toTextStyle(typography.bodyMedium),
      textAlign: 'center',
    },
    textContent: {
      alignItems: 'center',
      gap: spacing.xsmall,
      width: '100%',
    },
    title: {
      color: colors.textPrimary,
      ...toTextStyle(typography.bodyLarge),
      textAlign: 'center',
    },
  });
  /* eslint-enable react-native/no-unused-styles */
}
