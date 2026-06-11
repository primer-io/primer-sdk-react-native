import React, { useMemo } from 'react';
import { Image, View, StyleSheet } from 'react-native';

import { useTheme } from '../internal/theme';
import type { PrimerTokens } from '../internal/theme';
import { useLocalization } from '../internal/localization';
import { STATUS_SCREEN_ICON_SIZE } from '../internal/screens/constants';
import { CheckoutButton } from '../internal/ui';
import { PrimerStatusScreenLayout } from './PrimerStatusScreenLayout';

const errorIcon = require('../internal/screens/assets/error-large.png');

export interface PrimerErrorScreenProps {
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  onRetry?: () => void;
  onChooseOtherMethod?: () => void;
  retryLabel?: string;
  otherMethodLabel?: string;
}

export function PrimerErrorScreen({
  title,
  subtitle,
  icon,
  onRetry,
  onChooseOtherMethod,
  retryLabel,
  otherMethodLabel,
}: PrimerErrorScreenProps) {
  const tokens = useTheme();
  const { t } = useLocalization();
  const styles = useMemo(() => createStyles(tokens), [tokens]);

  const resolvedTitle = title ?? t('primer_checkout_error_title');
  const resolvedSubtitle = subtitle ?? t('primer_checkout_error_subtitle');
  const resolvedIcon = icon ?? <Image source={errorIcon} style={styles.icon} />;

  const hasButtons = onRetry != null || onChooseOtherMethod != null;

  return (
    <PrimerStatusScreenLayout icon={resolvedIcon} title={resolvedTitle} subtitle={resolvedSubtitle}>
      {hasButtons && (
        <View style={styles.buttonGroup}>
          {onRetry != null && (
            <CheckoutButton title={retryLabel ?? t('primer_common_button_retry')} variant="primary" onPress={onRetry} />
          )}
          {onChooseOtherMethod != null && (
            <CheckoutButton
              title={otherMethodLabel ?? t('primer_checkout_error_button_other_methods')}
              variant="outlined"
              onPress={onChooseOtherMethod}
            />
          )}
        </View>
      )}
    </PrimerStatusScreenLayout>
  );
}

function createStyles(tokens: PrimerTokens) {
  const { spacing } = tokens;

  /* eslint-disable react-native/no-unused-styles */
  return StyleSheet.create({
    buttonGroup: {
      gap: spacing.small,
      width: '100%',
    },
    icon: {
      height: STATUS_SCREEN_ICON_SIZE,
      width: STATUS_SCREEN_ICON_SIZE,
    },
  });
  /* eslint-enable react-native/no-unused-styles */
}
