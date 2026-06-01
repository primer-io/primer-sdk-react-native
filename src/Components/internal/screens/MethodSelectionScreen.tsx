import { useCallback, useMemo } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { PrimerAnalytics } from '../../analytics';
import { usePrimerPaymentMethods } from '../../hooks/usePrimerPaymentMethods';
import { usePrimerCheckout } from '../../hooks/usePrimerCheckout';
import { usePrimerVaultManager } from '../../hooks/usePrimerVaultManager';
import { PrimerPaymentMethodList } from '../../PrimerPaymentMethodList';
import { PrimerVaultedPaymentMethod } from '../../PrimerVaultedPaymentMethod';
import { useCheckoutFlow } from '../checkout-flow/CheckoutFlowContext';
import { usePrimerLocalization } from '../localization';
import { NavigationHeader } from '../navigation/NavigationHeader';
import { CheckoutRoute } from '../navigation/types';
import { useNavigation } from '../navigation/useNavigation';
import { usePrimerTheme } from '../theme';
import { CheckoutButton } from '../ui/CheckoutButton';
import { PAYMENT_METHOD_BUTTON_HEIGHT } from '../ui/PaymentMethodButton';
import { useBottomSafeArea } from './useBottomSafeArea';
import { getLastSeenKeyboardHeight, useKeyboardHeight } from './useKeyboardHeight';
import { useStatusScreenHeight } from './useStatusScreenHeight';

import type { TextStyle } from 'react-native';
import type { PrimerTokens } from '../theme';
import type { PaymentMethodItem } from '../../types/PaymentMethodTypes';

const LOG = '[MethodSelectionScreen]';

// Inner vault tile content height (cardholder line + brand row + inner gap).
// Outer grey padding + tile padding are added into sheetHeight separately below.
const VAULT_TILE_CONTENT_HEIGHT = 44;

// Matches `FIELD_HEIGHT` in `Components/inputs/dimensions.ts`.
const VAULT_TILE_CVV_ROW_HEIGHT = 44;

const CHEVRON_ICON_SIZE = 20;
const chevronDownIcon = require('./assets/chevron-down.png');

export function MethodSelectionScreen() {
  const tokens = usePrimerTheme();
  const styles = useMemo(() => createStyles(tokens), [tokens]);
  const { t } = usePrimerLocalization();
  const { onCancel } = useCheckoutFlow();
  const { paymentMethods } = usePrimerPaymentMethods();
  const { push } = useNavigation();
  const { setActiveMethod, startGooglePay } = usePrimerCheckout();
  const {
    activeMethod: activeVaultedMethod,
    vaultDisplayMode,
    requestExpandedVaultDisplay,
    cvvInputVisible,
  } = usePrimerVaultManager();

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
  //   (+ inner-tile gap + CVV row, when CVV state is open)
  //   + tile-to-button gap + Pay button (CheckoutButton: padding.medium*2 + titleLarge lineHeight)
  //   + section-to-APM gap.
  const cvvExtraHeight = cvvInputVisible ? tokens.spacing.medium + VAULT_TILE_CVV_ROW_HEIGHT : 0;
  const vaultSectionHeight =
    activeVaultedMethod != null
      ? titleArea +
        tokens.spacing.medium +
        tokens.spacing.small * 2 +
        tokens.spacing.medium * 2 +
        VAULT_TILE_CONTENT_HEIGHT +
        cvvExtraHeight +
        tokens.spacing.small +
        (tokens.spacing.medium * 2 + tokens.typography.titleLarge.lineHeight) +
        tokens.spacing.medium
      : 0;
  // CheckoutButton intrinsic height = padding.medium*2 + titleLarge lineHeight (matches Pay button).
  const checkoutButtonHeight = tokens.spacing.medium * 2 + tokens.typography.titleLarge.lineHeight;
  const apmSectionHeight =
    vaultDisplayMode === 'lite' ? checkoutButtonHeight : titleArea + tokens.spacing.medium + listHeight;
  // Grow the sheet by `keyboardHeight - bottomInset` so content stays above the keyboard.
  // When CVV opens we use the last-seen height as an estimate to avoid a shrink-then-grow
  // jump during the ~74ms gap before `keyboardWillShow` fires.
  const keyboardHeight = useKeyboardHeight();
  const effectiveKeyboardHeight =
    keyboardHeight > 0 ? keyboardHeight : cvvInputVisible ? getLastSeenKeyboardHeight() : 0;
  const keyboardSheetGrowth = effectiveKeyboardHeight > 0 ? Math.max(0, effectiveKeyboardHeight - bottomInset) : 0;
  // Extra breathing room above the keyboard when CVV is open, so the input isn't flush
  // against the keyboard's top edge.
  const cvvBreathingRoom = cvvInputVisible ? tokens.spacing.xlarge : 0;
  const sheetHeight =
    tokens.spacing.large +
    headerArea +
    tokens.spacing.xxlarge +
    vaultSectionHeight +
    apmSectionHeight +
    bottomInset +
    tokens.spacing.xlarge +
    keyboardSheetGrowth +
    cvvBreathingRoom;
  useStatusScreenHeight(sheetHeight);

  const handleSelect = (method: PaymentMethodItem) => {
    // Route by manager category (mirrors RN Headless), not by payment-method type.
    if (method.categories.includes('NATIVE_UI')) {
      // Google Pay is the only NATIVE_UI method today. Start it without pushing a processing
      // screen — launching the native sheet backgrounds the app, freezes the navigator's
      // `isAnimating` flag, and silently drops the later replace() to the result screen;
      // PaymentOutcomeTransitioner navigates away once the outcome arrives.
      void startGooglePay().catch(() => {});
      return;
    }
    if (method.categories.includes('RAW_DATA')) {
      setActiveMethod(method.type);
      push(CheckoutRoute.cardForm, { paymentMethodType: method.type });
      return;
    }
    console.warn(`${LOG} payment method ${method.type} not yet wired`);
  };

  const handleShowAll = useCallback(() => {
    void PrimerAnalytics.trackEvent('VAULT_LIST_OPENED', {
      currentVaultedMethodId: activeVaultedMethod?.id ?? '',
    });
    push(CheckoutRoute.vaultedMethods);
  }, [activeVaultedMethod, push]);

  const handleRequestExpanded = useCallback(() => {
    void PrimerAnalytics.trackEvent('VAULT_OTHER_PAY_METHODS_REQUESTED', {
      activeVaultedMethodId: activeVaultedMethod?.id ?? '',
    });
    requestExpandedVaultDisplay();
  }, [activeVaultedMethod, requestExpandedVaultDisplay]);

  return (
    <View style={[styles.root, { paddingBottom: bottomInset }]}>
      <NavigationHeader
        title={t('primer_checkout_title')}
        rightAction={{ label: t('primer_common_button_cancel'), onPress: onCancel }}
      />
      <View style={styles.content}>
        {activeVaultedMethod != null && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>{t('primer_vault_section_title')}</Text>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={t('accessibility_common_show_all')}
                onPress={handleShowAll}
                style={styles.showAllButton}
                hitSlop={{
                  top: tokens.spacing.small,
                  bottom: tokens.spacing.small,
                  left: tokens.spacing.small,
                  right: tokens.spacing.small,
                }}
              >
                <Text style={styles.showAllLabel}>{t('primer_vault_button_show_all')}</Text>
                <Image source={chevronDownIcon} style={styles.showAllIcon} resizeMode="contain" />
              </TouchableOpacity>
            </View>
            <PrimerVaultedPaymentMethod />
          </View>
        )}
        {vaultDisplayMode === 'lite' ? (
          <CheckoutButton
            title={t('primer_vault_selected_button_other')}
            variant="outlined"
            onPress={handleRequestExpanded}
          />
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('primer_payment_selection_header')}</Text>
            <PrimerPaymentMethodList data={paymentMethods} onSelect={handleSelect} />
          </View>
        )}
      </View>
    </View>
  );
}

function createStyles(tokens: PrimerTokens) {
  const { colors, radii, spacing, typography } = tokens;

  /* eslint-disable react-native/no-unused-styles */
  return StyleSheet.create({
    content: {
      gap: spacing.medium,
      paddingHorizontal: spacing.large,
      paddingTop: spacing.xxlarge,
    },
    root: {
      flex: 1,
      paddingTop: spacing.large,
    },
    section: {
      gap: spacing.medium,
    },
    sectionHeaderRow: {
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    sectionTitle: {
      color: colors.textPrimary,
      fontFamily: typography.titleLarge.fontFamily,
      fontSize: typography.titleLarge.fontSize,
      fontWeight: typography.titleLarge.fontWeight as TextStyle['fontWeight'],
      letterSpacing: typography.titleLarge.letterSpacing,
      lineHeight: typography.titleLarge.lineHeight,
    },
    showAllButton: {
      alignItems: 'center',
      borderRadius: radii.small,
      flexDirection: 'row',
      gap: spacing.xsmall,
      paddingHorizontal: spacing.xxsmall,
    },
    showAllIcon: {
      height: CHEVRON_ICON_SIZE,
      width: CHEVRON_ICON_SIZE,
    },
    showAllLabel: {
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
