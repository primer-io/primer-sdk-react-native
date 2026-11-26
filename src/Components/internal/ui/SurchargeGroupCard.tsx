import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { usePrimerCheckout } from '../../hooks/usePrimerCheckout';
import { usePrimerLocalization } from '../localization';
import { usePrimerTheme } from '../theme';
import { toTextStyle } from '../theme/typography';
import type { SurchargeGroupTitle } from '../groupBySurcharge';

export interface SurchargeGroupCardProps {
  title: SurchargeGroupTitle;
  children: ReactNode;
}

export function SurchargeGroupCard({ title, children }: SurchargeGroupCardProps) {
  const { colors, radii, spacing, typography } = usePrimerTheme();
  const { t, formatCurrency } = usePrimerLocalization();
  const currencyCode = usePrimerCheckout().clientSession?.currencyCode;

  return (
    <View
      style={{
        backgroundColor: colors.backgroundSecondary,
        borderRadius: radii.large,
        gap: spacing.small,
        padding: spacing.small,
      }}
    >
      {typeof title === 'number' ? (
        <View style={[styles.feeRow, { gap: spacing.small }]} accessible accessibilityRole="header">
          <Text style={[styles.feeLabel, { color: colors.textSecondary, ...toTextStyle(typography.bodyMedium) }]}>
            {t('primer_payment_selection_surcharge_label')}
          </Text>
          {currencyCode ? (
            <Text style={{ color: colors.textPrimary, ...toTextStyle(typography.titleLarge) }}>
              {`+ ${formatCurrency(title, currencyCode)}`}
            </Text>
          ) : null}
        </View>
      ) : (
        <Text
          style={[styles.title, { color: colors.textPrimary, ...toTextStyle(typography.bodyMedium) }]}
          accessibilityRole="header"
        >
          {t(
            title === 'none'
              ? 'primer_payment_selection_surcharge_none'
              : 'primer_payment_selection_surcharge_may_apply'
          )}
        </Text>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  feeLabel: {
    flexShrink: 1,
  },
  feeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    textAlign: 'right',
  },
});
