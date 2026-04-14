import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { TextStyle } from 'react-native';
import { useTheme } from '../theme';
import type { PrimerTokens } from '../theme';
import { NavigationHeader } from '../navigation/NavigationHeader';
import { PrimerPaymentMethodList } from '../../PrimerPaymentMethodList';
import { usePaymentMethods } from '../../hooks/usePaymentMethods';
import type { PaymentMethodItem } from '../../../models/components/PaymentMethodTypes';
import { useCheckoutFlow } from '../checkout-flow/CheckoutFlowContext';
import { useStatusScreenHeight } from './useStatusScreenHeight';
import { BOTTOM_SAFE_AREA } from './constants';
import { PAYMENT_METHOD_BUTTON_HEIGHT } from '../ui/PaymentMethodButton';

export function MethodSelectionScreen() {
  const tokens = useTheme();
  const styles = useMemo(() => createStyles(tokens), [tokens]);
  const { onCancel } = useCheckoutFlow();
  const { paymentMethods } = usePaymentMethods();

  const methodCount = paymentMethods.length;
  const buttonGap = tokens.spacing.small;
  const listHeight = methodCount > 0 ? methodCount * PAYMENT_METHOD_BUTTON_HEIGHT + (methodCount - 1) * buttonGap : 0;
  // Container paddingTop + NavigationHeader (singleRow paddingVertical + titleXLarge lineHeight)
  //   + content paddingTop + sectionTitle lineHeight + content gap + list + bottom safe area
  const headerArea = tokens.spacing.xxsmall * 2 + tokens.typography.titleXLarge.lineHeight;
  const titleArea = tokens.typography.titleLarge.lineHeight;
  const sheetHeight =
    tokens.spacing.large +
    headerArea +
    tokens.spacing.xxlarge +
    titleArea +
    tokens.spacing.medium +
    listHeight +
    BOTTOM_SAFE_AREA;
  useStatusScreenHeight(sheetHeight);

  const handleSelect = (_method: PaymentMethodItem) => {
    // Payment form navigation to be wired when forms are implemented
  };

  return (
    <View style={styles.container}>
      <NavigationHeader title="Pay" rightAction={{ label: 'Cancel', onPress: onCancel }} />
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Choose payment method</Text>
        <PrimerPaymentMethodList onSelect={handleSelect} />
      </View>
    </View>
  );
}

function createStyles(tokens: PrimerTokens) {
  const { colors, spacing, typography } = tokens;

  /* eslint-disable react-native/no-unused-styles */
  return StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: spacing.large,
    },
    content: {
      gap: spacing.medium,
      paddingHorizontal: spacing.large,
      paddingTop: spacing.xxlarge,
    },
    sectionTitle: {
      color: colors.textPrimary,
      fontFamily: typography.titleLarge.fontFamily,
      fontSize: typography.titleLarge.fontSize,
      fontWeight: typography.titleLarge.fontWeight as TextStyle['fontWeight'],
      letterSpacing: typography.titleLarge.letterSpacing,
      lineHeight: typography.titleLarge.lineHeight,
    },
  });
  /* eslint-enable react-native/no-unused-styles */
}
