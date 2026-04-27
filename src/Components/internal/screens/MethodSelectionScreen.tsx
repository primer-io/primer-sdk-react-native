import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { usePaymentMethods } from '../../hooks/usePaymentMethods';
import { usePrimerCheckout } from '../../hooks/usePrimerCheckout';
import { useVaultedPaymentMethods } from '../../hooks/useVaultedPaymentMethods';
import { PrimerPaymentMethodList } from '../../PrimerPaymentMethodList';
import { PrimerVaultedPaymentMethod } from '../../PrimerVaultedPaymentMethod';
import { useCheckoutFlow } from '../checkout-flow/CheckoutFlowContext';
import { useLocalization } from '../localization';
import { NavigationHeader } from '../navigation/NavigationHeader';
import { CheckoutRoute } from '../navigation/types';
import { useNavigation } from '../navigation/useNavigation';
import { useTheme } from '../theme';
import { PAYMENT_METHOD_BUTTON_HEIGHT } from '../ui/PaymentMethodButton';
import { useBottomSafeArea } from './useBottomSafeArea';
import { useStatusScreenHeight } from './useStatusScreenHeight';

import type { TextStyle } from 'react-native';
import type { PrimerTokens } from '../theme';
import type { PaymentMethodItem } from '../../types/PaymentMethodTypes';

const LOG = '[MethodSelectionScreen]';

// Inner vault tile content height (cardholder line + brand row + inner gap).
// Outer grey padding + tile padding are added into sheetHeight separately below.
const VAULT_TILE_CONTENT_HEIGHT = 44;

export function MethodSelectionScreen() {
  const tokens = useTheme();
  const styles = useMemo(() => createStyles(tokens), [tokens]);
  const { t } = useLocalization();
  const { onCancel } = useCheckoutFlow();
  const { paymentMethods } = usePaymentMethods();
  const { push } = useNavigation();
  const { setActiveMethod } = usePrimerCheckout();
  const { primaryMethod: primaryVaultedMethod } = useVaultedPaymentMethods();

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
  // Vault section = section title + content gap + outer padding*2 + tile padding*2 + tile content
  //   + tile-to-button gap + Pay button (CheckoutButton: padding.medium*2 + titleLarge lineHeight)
  //   + section-to-APM gap.
  const vaultSectionHeight =
    primaryVaultedMethod != null
      ? titleArea +
        tokens.spacing.medium +
        tokens.spacing.small * 2 +
        tokens.spacing.medium * 2 +
        VAULT_TILE_CONTENT_HEIGHT +
        tokens.spacing.small +
        (tokens.spacing.medium * 2 + tokens.typography.titleLarge.lineHeight) +
        tokens.spacing.medium
      : 0;
  const sheetHeight =
    tokens.spacing.large +
    headerArea +
    tokens.spacing.xxlarge +
    vaultSectionHeight +
    titleArea +
    tokens.spacing.medium +
    listHeight +
    bottomInset +
    tokens.spacing.xlarge;
  useStatusScreenHeight(sheetHeight);

  const handleSelect = (method: PaymentMethodItem) => {
    if (method.type === 'PAYMENT_CARD') {
      setActiveMethod(method.type);
      push(CheckoutRoute.cardForm, { paymentMethodType: method.type });
      return;
    }
    console.warn(`${LOG} payment method ${method.type} not yet wired`);
  };

  return (
    <View style={[styles.container, { paddingBottom: bottomInset }]}>
      <NavigationHeader
        title={t('primer_checkout_title')}
        rightAction={{ label: t('primer_common_button_cancel'), onPress: onCancel }}
      />
      <View style={styles.content}>
        {primaryVaultedMethod != null && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('primer_vault_section_title')}</Text>
            <PrimerVaultedPaymentMethod />
          </View>
        )}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('primer_payment_selection_header')}</Text>
          <PrimerPaymentMethodList data={paymentMethods} onSelect={handleSelect} />
        </View>
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
    section: {
      gap: spacing.medium,
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
