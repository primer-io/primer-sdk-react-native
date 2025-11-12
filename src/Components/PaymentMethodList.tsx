import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { usePaymentMethodList } from './hooks/usePaymentMethodList';
import { PaymentMethodItem } from './PaymentMethodItem';
import type { PaymentMethodListProps } from '../models/components/PaymentMethodListTypes';

/**
 * Payment Method List Component
 *
 * Pre-built component that displays available payment methods
 * with automatic loading states and filtering.
 *
 * @example
 * ```tsx
 * <PaymentMethodList
 *   onPaymentMethodPress={(method) => {
 *     if (method.type === 'PAYMENT_CARD') {
 *       setShowCardForm(true);
 *     } else {
 *       Alert.alert('Coming Soon!');
 *     }
 *   }}
 *   showCardFirst={true}
 *   showComingSoonBadge={true}
 *   theme={{ primaryColor: '#0066FF' }}
 * />
 * ```
 */
export function PaymentMethodList(props: PaymentMethodListProps) {
  const {
    include,
    exclude,
    onPaymentMethodPress,
    onPaymentMethodsLoad,
    theme,
    style,
    itemStyle,
    showCardFirst = true,
    disabled = false,
    showComingSoonBadge = true,
    renderItem,
    ListEmptyComponent,
    ListHeaderComponent,
    ListFooterComponent,
    testID = 'payment-method-list',
  } = props;

  const {
    paymentMethods,
    isLoading,
    error,
    selectMethod,
  } = usePaymentMethodList({
    include,
    exclude,
    showCardFirst,
    onLoad: onPaymentMethodsLoad,
  });

  const handlePress = (method: any) => {
    selectMethod(method);
    if (onPaymentMethodPress) {
      onPaymentMethodPress(method);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <View style={[styles.container, styles.loadingContainer, style]} testID={`${testID}-loading`}>
        <ActivityIndicator size="large" color={theme?.primaryColor || '#0066FF'} />
        <Text
          style={[
            styles.loadingText,
            {
              color: theme?.textColor || '#000000',
              fontSize: theme?.fontSize || 16,
              fontFamily: theme?.fontFamily,
            },
          ]}
        >
          Loading payment methods...
        </Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={[styles.container, styles.errorContainer, style]} testID={`${testID}-error`}>
        <Text
          style={[
            styles.errorText,
            {
              color: theme?.primaryColor || '#FF3B30',
              fontSize: theme?.fontSize || 16,
              fontFamily: theme?.fontFamily,
            },
          ]}
        >
          Failed to load payment methods
        </Text>
        <Text
          style={[
            styles.errorSubtext,
            {
              color: theme?.secondaryTextColor || '#666666',
              fontSize: (theme?.fontSize || 16) - 2,
              fontFamily: theme?.fontFamily,
            },
          ]}
        >
          {error.message}
        </Text>
      </View>
    );
  }

  // Empty state
  if (paymentMethods.length === 0) {
    if (ListEmptyComponent) {
      return (
        <View style={[styles.container, style]} testID={`${testID}-empty`}>
          {ListEmptyComponent}
        </View>
      );
    }

    return (
      <View style={[styles.container, styles.emptyContainer, style]} testID={`${testID}-empty`}>
        <Text
          style={[
            styles.emptyText,
            {
              color: theme?.secondaryTextColor || '#666666',
              fontSize: theme?.fontSize || 16,
              fontFamily: theme?.fontFamily,
            },
          ]}
        >
          No payment methods available
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]} testID={testID}>
      {/* Header */}
      {ListHeaderComponent && (
        <View style={styles.header}>
          {ListHeaderComponent}
        </View>
      )}

      {/* Payment Method Items */}
      <View style={styles.list}>
        {paymentMethods.map((method, index) => {
          // Custom render if provided
          if (renderItem) {
            return <View key={method.type}>{renderItem(method, index)}</View>;
          }

          // Default render with PaymentMethodItem
          const marginBottom = index < paymentMethods.length - 1 ? theme?.itemSpacing || 12 : 0;
          const isCard = method.type === 'PAYMENT_CARD';
          const shouldShowBadge = showComingSoonBadge && !isCard;

          return (
            <PaymentMethodItem
              key={method.type}
              paymentMethod={method}
              onPress={handlePress}
              disabled={disabled}
              showComingSoonBadge={shouldShowBadge}
              theme={theme}
              style={[{ marginBottom }, itemStyle]}
              testID={`${testID}-item-${method.type}`}
            />
          );
        })}
      </View>

      {/* Footer */}
      {ListFooterComponent && (
        <View style={styles.footer}>
          {ListFooterComponent}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorText: {
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorSubtext: {
    textAlign: 'center',
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    textAlign: 'center',
  },
  header: {
    marginBottom: 16,
  },
  list: {
    // List items rendered here
  },
  footer: {
    marginTop: 16,
  },
});
