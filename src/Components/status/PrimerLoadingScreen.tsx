import type { ReactNode } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

import { useTheme } from '../internal/theme';
import { useLocalization } from '../internal/localization';
import { STATUS_SCREEN_ICON_SIZE } from '../internal/screens/constants';
import { PrimerStatusScreenLayout } from './PrimerStatusScreenLayout';

const SPINNER_SCALE = 1.1;

export interface PrimerLoadingScreenProps {
  title?: string;
  subtitle?: string;
  /** Custom loading visual rendered in the centered slot. Defaults to the SDK spinner. */
  icon?: ReactNode;
}

export function PrimerLoadingScreen({ title, subtitle, icon }: PrimerLoadingScreenProps) {
  const tokens = useTheme();
  const { t } = useLocalization();

  const resolvedTitle = title ?? t('primer_checkout_loading_indicator');
  const resolvedSubtitle = subtitle ?? t('primer_checkout_loading_subtitle');
  const resolvedIcon = icon ?? (
    <View style={styles.iconWrapper}>
      <ActivityIndicator size="large" color={tokens.colors.primary} style={styles.spinner} />
    </View>
  );

  return <PrimerStatusScreenLayout icon={resolvedIcon} title={resolvedTitle} subtitle={resolvedSubtitle} />;
}

const styles = StyleSheet.create({
  iconWrapper: {
    alignItems: 'center',
    height: STATUS_SCREEN_ICON_SIZE,
    justifyContent: 'center',
    width: STATUS_SCREEN_ICON_SIZE,
  },
  spinner: {
    transform: [{ scale: SPINNER_SCALE }],
  },
});
