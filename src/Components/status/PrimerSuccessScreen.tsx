import React, { useEffect } from 'react';
import { Image, StyleSheet } from 'react-native';

import { useLocalization } from '../internal/localization';
import { STATUS_SCREEN_ICON_SIZE } from '../internal/screens/constants';
import { PrimerStatusScreenLayout } from './PrimerStatusScreenLayout';

const checkCircleIcon = require('../internal/screens/assets/check-circle-large.png');

export interface PrimerSuccessScreenProps {
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  onDismiss?: () => void;
  autoDismissMs?: number;
}

export function PrimerSuccessScreen({ title, subtitle, icon, onDismiss, autoDismissMs }: PrimerSuccessScreenProps) {
  const { t } = useLocalization();

  useEffect(() => {
    if (!onDismiss || autoDismissMs == null) return;
    const id = setTimeout(onDismiss, autoDismissMs);
    return () => clearTimeout(id);
  }, [onDismiss, autoDismissMs]);

  const resolvedTitle = title ?? t('primer_checkout_success_title');
  const resolvedSubtitle = subtitle ?? t('primer_checkout_success_subtitle');
  const resolvedIcon = icon ?? <Image source={checkCircleIcon} style={styles.icon} />;

  return <PrimerStatusScreenLayout icon={resolvedIcon} title={resolvedTitle} subtitle={resolvedSubtitle} />;
}

const styles = StyleSheet.create({
  icon: {
    height: STATUS_SCREEN_ICON_SIZE,
    width: STATUS_SCREEN_ICON_SIZE,
  },
});
