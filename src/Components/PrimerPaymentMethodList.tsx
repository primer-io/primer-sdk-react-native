import { useMemo, useCallback } from 'react';
import { ActivityIndicator, FlatList, View, StyleSheet } from 'react-native';
import { useTheme } from './internal/theme';
import type { PrimerTokens } from './internal/theme';
import { usePaymentMethods } from './hooks/usePaymentMethods';
import { PaymentMethodButton } from './internal/ui/PaymentMethodButton';
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
  const tokens = useTheme();
  const styles = useMemo(() => createStyles(tokens), [tokens]);

  const hook = usePaymentMethods(
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

  const handlePress = useCallback(
    (item: PaymentMethodItem) => {
      // TODO: Fire PAYMENT_METHOD_SELECTION analytics event when analytics bridge is available
      onSelect(item);
    },
    [onSelect]
  );

  const Separator = useCallback(() => <View style={styles.separator} />, [styles.separator]);

  if (isLoading) {
    return (
      <View style={[styles.centered, style]}>
        <ActivityIndicator size="small" color={tokens.colors.primary} />
      </View>
    );
  }

  if (paymentMethods.length === 0) {
    return <View style={style} />;
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
    separator: {
      height: spacing.small,
    },
  });
  /* eslint-enable react-native/no-unused-styles */
}
