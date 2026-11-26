import { useMemo, useCallback } from 'react';
import { ActivityIndicator, FlatList, View, StyleSheet } from 'react-native';
import { usePrimerTheme } from './internal/theme';
import type { PrimerTokens } from './internal/theme';
import { usePrimerCheckout } from './hooks/usePrimerCheckout';
import { usePrimerPaymentMethods } from './hooks/usePrimerPaymentMethods';
import { groupBySurcharge } from './internal/groupBySurcharge';
import { PaymentMethodButton } from './internal/ui/PaymentMethodButton';
import { SurchargeGroupCard } from './internal/ui/SurchargeGroupCard';
import type { PaymentMethodItem } from './types/PaymentMethodTypes';
import type { PrimerPaymentMethodListProps } from './types/PrimerPaymentMethodListTypes';

export function PrimerPaymentMethodList({
  data,
  include,
  exclude,
  onSelect,
  onLoad,
  style,
}: PrimerPaymentMethodListProps) {
  const tokens = usePrimerTheme();
  const styles = useMemo(() => createStyles(tokens), [tokens]);

  const hook = usePrimerPaymentMethods(
    data != null
      ? {}
      : {
          include,
          exclude,
          onLoad,
        }
  );
  const paymentMethods = data ?? hook.paymentMethods;
  const isLoading = data != null ? false : hook.isLoading;
  const { acceptedCardNetworks } = usePrimerCheckout();
  const groups = groupBySurcharge(paymentMethods, acceptedCardNetworks ?? []);

  const handlePress = useCallback(
    (item: PaymentMethodItem) => {
      onSelect(item);
    },
    [onSelect]
  );

  const Separator = useCallback(() => <View style={styles.separator} />, [styles.separator]);

  if (isLoading) {
    return (
      <View style={[styles.centered, style]}>
        <ActivityIndicator size="small" color={tokens.colors.loader} />
      </View>
    );
  }

  if (paymentMethods.length === 0) {
    return <View style={style} />;
  }

  if (groups.length > 0) {
    return (
      <View style={[styles.groups, style]}>
        {groups.map((group) => (
          <SurchargeGroupCard key={group.title} title={group.title}>
            {group.methods.map((item) => (
              <PaymentMethodButton key={item.type} item={item} onPress={() => handlePress(item)} />
            ))}
          </SurchargeGroupCard>
        ))}
      </View>
    );
  }

  return (
    <View style={style}>
      <FlatList
        data={paymentMethods}
        keyExtractor={(item) => item.type}
        renderItem={({ item }) => <PaymentMethodButton item={item} onPress={() => handlePress(item)} />}
        ItemSeparatorComponent={Separator}
        scrollEnabled={false}
      />
    </View>
  );
}

function createStyles(tokens: PrimerTokens) {
  const { spacing } = tokens;

  /* eslint-disable react-native/no-unused-styles */
  return StyleSheet.create({
    centered: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.large,
    },
    groups: {
      gap: spacing.small,
    },
    separator: {
      height: spacing.small,
    },
  });
  /* eslint-enable react-native/no-unused-styles */
}
