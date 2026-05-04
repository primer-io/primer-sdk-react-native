import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { usePaymentMethods } from '../../hooks/usePaymentMethods';
import { PrimerPaymentMethodList } from '../../PrimerPaymentMethodList';
import { useCheckoutFlow } from '../checkout-flow/CheckoutFlowContext';
import { useLocalization } from '../localization';
import { NavigationHeader } from '../navigation/NavigationHeader';
import { useTheme } from '../theme';
import { PAYMENT_METHOD_BUTTON_HEIGHT } from '../ui/PaymentMethodButton';
import { useBottomSafeArea } from './useBottomSafeArea';
import { useStatusScreenHeight } from './useStatusScreenHeight';

import type { TextStyle } from 'react-native';
import type { PrimerTokens } from '../theme';
import type { PaymentMethodItem } from '../../types/PaymentMethodTypes';

export function MethodSelectionScreen() {
  const tokens = useTheme();
  const styles = useMemo(() => createStyles(tokens), [tokens]);
  const { t } = useLocalization();
  const { onCancel } = useCheckoutFlow();
  const { paymentMethods } = usePaymentMethods();

  const methodCount = paymentMethods.length;
  const buttonGap = tokens.spacing.small;
  const listHeight = methodCount > 0 ? methodCount * PAYMENT_METHOD_BUTTON_HEIGHT + (methodCount - 1) * buttonGap : 0;
  const rawBottomInset = useBottomSafeArea();
  const bottomInset = Math.max(rawBottomInset, tokens.spacing.large);
  // Container paddingTop + NavigationHeader (singleRow paddingVertical + titleXLarge lineHeight)
  //   + content paddingTop + sectionTitle lineHeight + content gap + list + bottom safe area
  //   + spacing.xlarge for the sheet's drag-handle area (not part of screen content).
  const headerArea = tokens.spacing.xxsmall * 2 + tokens.typography.titleXLarge.lineHeight;
  const titleArea = tokens.typography.titleLarge.lineHeight;
  const sheetHeight =
    tokens.spacing.large +
    headerArea +
    tokens.spacing.xxlarge +
    titleArea +
    tokens.spacing.medium +
    listHeight +
    bottomInset +
    tokens.spacing.xlarge;
  useStatusScreenHeight(sheetHeight);

  const handleSelect = (_method: PaymentMethodItem) => {
    // Payment form navigation to be wired when forms are implemented
  };

  return (
    <View style={[styles.container, { paddingBottom: bottomInset }]}>
      <NavigationHeader
        title={t('primer_checkout_title')}
        rightAction={{ label: t('primer_common_button_cancel'), onPress: onCancel }}
      />
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>{t('primer_payment_selection_header')}</Text>
        <PrimerPaymentMethodList data={paymentMethods} onSelect={handleSelect} />
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
