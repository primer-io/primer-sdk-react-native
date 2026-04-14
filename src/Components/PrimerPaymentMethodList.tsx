import { useState, useMemo, useCallback } from 'react';
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View, StyleSheet } from 'react-native';
import type { TextStyle } from 'react-native';
import { useTheme } from './internal/theme';
import type { PrimerTokens } from './internal/theme';
import { usePaymentMethods } from './hooks/usePaymentMethods';
import { PaymentMethodButton } from './internal/ui/PaymentMethodButton';
import type { PaymentMethodItem } from '../models/components/PaymentMethodTypes';
import type { PrimerPaymentMethodListProps } from '../models/components/PrimerPaymentMethodListTypes';

export function PrimerPaymentMethodList({
  include,
  exclude,
  showCardFirst,
  collapsedCount,
  onSelect,
  onLoad,
  style,
}: PrimerPaymentMethodListProps) {
  const tokens = useTheme();
  const styles = useMemo(() => createStyles(tokens), [tokens]);
  const [isExpanded, setIsExpanded] = useState(false);

  const { paymentMethods, isLoading } = usePaymentMethods({
    include,
    exclude,
    showCardFirst,
    onLoad,
  });

  const handlePress = useCallback(
    (item: PaymentMethodItem) => {
      // TODO: Fire PAYMENT_METHOD_SELECTION analytics event when analytics bridge is available
      onSelect(item);
    },
    [onSelect]
  );

  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const Separator = useCallback(() => <View style={styles.separator} />, [styles.separator]);

  // Loading state
  if (isLoading) {
    return (
      <View style={[styles.centered, style]}>
        <ActivityIndicator size="small" color={tokens.colors.primary} />
      </View>
    );
  }

  // Empty state
  if (paymentMethods.length === 0) {
    return <View style={style} />;
  }

  // Determine visible methods based on collapse state
  const shouldCollapse = collapsedCount != null && paymentMethods.length > collapsedCount;
  const visibleMethods = shouldCollapse && !isExpanded ? paymentMethods.slice(0, collapsedCount) : paymentMethods;

  return (
    <View style={style}>
      <FlatList
        data={visibleMethods}
        keyExtractor={(item) => item.type}
        renderItem={({ item }) => <PaymentMethodButton item={item} onPress={() => handlePress(item)} />}
        ItemSeparatorComponent={Separator}
        scrollEnabled={false}
      />
      {shouldCollapse && (
        <TouchableOpacity onPress={toggleExpanded} style={styles.toggleButton} activeOpacity={0.7}>
          <Text style={styles.toggleText}>{isExpanded ? 'Show less' : 'Show more'}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function createStyles(tokens: PrimerTokens) {
  const { colors, spacing, typography } = tokens;

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
    toggleButton: {
      alignItems: 'center',
      paddingVertical: spacing.medium,
    },
    toggleText: {
      color: colors.textLink,
      fontFamily: typography.bodyMedium.fontFamily,
      fontSize: typography.bodyMedium.fontSize,
      fontWeight: typography.bodyMedium.fontWeight as TextStyle['fontWeight'],
      letterSpacing: typography.bodyMedium.letterSpacing,
      lineHeight: typography.bodyMedium.lineHeight,
    },
  });
  /* eslint-enable react-native/no-unused-styles */
}
