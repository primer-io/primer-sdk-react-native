import { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Platform } from 'react-native';
import { NativeResourceView } from '../HeadlessUniversalCheckout/Components/NativeResourceView';
import type {
  PaymentMethodItemProps,
  PaymentMethodListTheme,
} from '../models/components/PaymentMethodListTypes';

/**
 * Default theme for PaymentMethodItem
 */
const defaultTheme: PaymentMethodListTheme = {
  primaryColor: '#0066FF',
  backgroundColor: '#FFFFFF',
  textColor: '#000000',
  secondaryTextColor: '#666666',
  borderColor: '#E0E0E0',
  borderWidth: 1,
  borderRadius: 8,
  itemHeight: 56,
  itemSpacing: 12,
  itemPadding: 16,
  selectedBorderColor: '#0066FF',
  selectedBorderWidth: 2,
  disabledOpacity: 0.5,
  fontSize: 16,
  fontWeight: '600',
  badgeBackgroundColor: '#FFA500',
  badgeTextColor: '#FFFFFF',
  badgeFontSize: 12,
};

/**
 * Payment Method Item Component
 *
 * Renders an individual payment method button with logo, name,
 * and optional "Coming Soon" badge.
 *
 * @example
 * ```tsx
 * <PaymentMethodItem
 *   paymentMethod={method}
 *   onPress={(m) => selectMethod(m)}
 *   showComingSoonBadge={method.type !== 'PAYMENT_CARD'}
 *   theme={{ primaryColor: '#0066FF' }}
 * />
 * ```
 */
export function PaymentMethodItem(props: PaymentMethodItemProps) {
  const {
    paymentMethod,
    onPress,
    onFocus,
    onBlur,
    isSelected = false,
    disabled = false,
    showComingSoonBadge = false,
    theme: customTheme,
    style,
    labelStyle,
    badgeStyle,
    testID = `payment-method-item-${paymentMethod.type}`,
  } = props;

  const [isFocused, setIsFocused] = useState(false);

  const theme = {
    primaryColor: customTheme?.primaryColor ?? defaultTheme.primaryColor,
    backgroundColor: customTheme?.backgroundColor ?? defaultTheme.backgroundColor,
    textColor: customTheme?.textColor ?? defaultTheme.textColor,
    secondaryTextColor: customTheme?.secondaryTextColor ?? defaultTheme.secondaryTextColor,
    borderColor: customTheme?.borderColor ?? defaultTheme.borderColor,
    borderWidth: customTheme?.borderWidth ?? defaultTheme.borderWidth,
    borderRadius: customTheme?.borderRadius ?? defaultTheme.borderRadius,
    itemHeight: customTheme?.itemHeight ?? defaultTheme.itemHeight,
    itemPadding: customTheme?.itemPadding ?? defaultTheme.itemPadding,
    selectedBorderColor: customTheme?.selectedBorderColor ?? customTheme?.primaryColor ?? defaultTheme.selectedBorderColor,
    selectedBorderWidth: customTheme?.selectedBorderWidth ?? defaultTheme.selectedBorderWidth,
    disabledOpacity: customTheme?.disabledOpacity ?? defaultTheme.disabledOpacity,
    fontSize: customTheme?.fontSize ?? defaultTheme.fontSize,
    fontWeight: customTheme?.fontWeight ?? defaultTheme.fontWeight,
    fontFamily: customTheme?.fontFamily,
    badgeBackgroundColor: customTheme?.badgeBackgroundColor ?? defaultTheme.badgeBackgroundColor,
    badgeTextColor: customTheme?.badgeTextColor ?? defaultTheme.badgeTextColor,
    badgeFontSize: customTheme?.badgeFontSize ?? defaultTheme.badgeFontSize,
  };

  const handlePress = () => {
    if (!disabled && onPress) {
      onPress(paymentMethod);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (onFocus) {
      onFocus(paymentMethod);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (onBlur) {
      onBlur(paymentMethod);
    }
  };

  const getBorderColor = () => {
    if (isSelected || isFocused) return theme.selectedBorderColor;
    return theme.borderColor;
  };

  const getBorderWidth = () => {
    if (isSelected || isFocused) return theme.selectedBorderWidth;
    return theme.borderWidth;
  };

  // Use custom background color from resource if available
  const containerBackgroundColor = paymentMethod.backgroundColor || theme.backgroundColor;

  // Render native view if available
  if (paymentMethod.isNativeView && paymentMethod.nativeViewName) {
    return (
      <TouchableOpacity
        style={[
          styles.container,
          {
            height: theme.itemHeight,
            borderRadius: theme.borderRadius,
            borderColor: getBorderColor(),
            borderWidth: getBorderWidth(),
            opacity: disabled ? theme.disabledOpacity : 1,
          },
          style,
        ]}
        onPress={handlePress}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
        activeOpacity={0.7}
        testID={testID}
      >
        <NativeResourceView
          onPress={handlePress}
          nativeViewName={paymentMethod.nativeViewName}
        />
        {showComingSoonBadge && (
          <View
            style={[
              styles.badge,
              {
                backgroundColor: theme.badgeBackgroundColor,
                borderRadius: (theme.borderRadius || 8) / 2,
              },
              badgeStyle,
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                {
                  color: theme.badgeTextColor,
                  fontSize: theme.badgeFontSize,
                  fontFamily: theme.fontFamily,
                },
              ]}
            >
              Coming Soon
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  // Render standard button with logo and name
  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          height: theme.itemHeight,
          backgroundColor: containerBackgroundColor,
          borderRadius: theme.borderRadius,
          borderColor: getBorderColor(),
          borderWidth: getBorderWidth(),
          paddingHorizontal: theme.itemPadding,
          opacity: disabled ? theme.disabledOpacity : 1,
        },
        style,
      ]}
      onPress={handlePress}
      onFocus={handleFocus}
      onBlur={handleBlur}
      disabled={disabled}
      activeOpacity={0.7}
      testID={testID}
    >
      <View style={styles.content}>
        {/* Logo */}
        {paymentMethod.logo && (
          <Image
            source={{ uri: paymentMethod.logo }}
            style={styles.logo}
            resizeMode="contain"
          />
        )}

        {/* Payment Method Name */}
        <Text
          style={[
            styles.label,
            {
              color: theme.textColor,
              fontSize: theme.fontSize,
              fontWeight: theme.fontWeight,
              fontFamily: theme.fontFamily,
            },
            labelStyle,
          ]}
          numberOfLines={1}
        >
          {paymentMethod.name}
        </Text>

        {/* Coming Soon Badge */}
        {showComingSoonBadge && (
          <View
            style={[
              styles.badge,
              {
                backgroundColor: theme.badgeBackgroundColor,
                borderRadius: (theme.borderRadius || 8) / 2,
              },
              badgeStyle,
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                {
                  color: theme.badgeTextColor,
                  fontSize: theme.badgeFontSize,
                  fontFamily: theme.fontFamily,
                },
              ]}
            >
              Coming Soon
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  logo: {
    width: 40,
    height: 24,
    marginRight: 12,
  },
  label: {
    flex: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
  },
  badgeText: {
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
