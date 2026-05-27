import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import type { TextStyle } from 'react-native';
import { useTheme } from '../theme';
import type { PrimerTokens } from '../theme';
import { NavigationHeader } from '../navigation/NavigationHeader';
import { useNavigation } from '../navigation/useNavigation';
import { CheckoutRoute } from '../navigation/types';
import { useLocalization } from '../localization';
import { useCheckoutFlow } from '../checkout-flow/CheckoutFlowContext';
import { PrimerCardForm } from '../../PrimerCardForm';
import { PrimerBillingAddressForm } from '../../PrimerBillingAddressForm';
import { useCardForm } from '../../hooks/useCardForm';
import { useBillingAddressForm } from '../../hooks/useBillingAddressForm';
import { useSheetHeight } from '../checkout-sheet';
import { useBottomSafeArea } from './useBottomSafeArea';
import { useKeyboardPadding } from './useKeyboardPadding';

// CheckoutSheet drag-handle chrome above our content: paddingTop(12) + handle(4) + paddingBottom(4).
const DRAG_HANDLE_AREA = 20;
// Matches CheckoutSheet's DEFAULT_HEIGHT_RATIO — the sheet never exceeds 92% of the screen.
const MAX_SHEET_HEIGHT_RATIO = 0.92;

export function CardFormScreen() {
  const tokens = useTheme();
  const { t } = useLocalization();
  const { pop, replace, canGoBack } = useNavigation();
  const { onCancel } = useCheckoutFlow();
  const cardForm = useCardForm();
  const billingForm = useBillingAddressForm();
  const bottomInset = useBottomSafeArea();
  const keyboardPadding = useKeyboardPadding();
  const { height: screenHeight } = useWindowDimensions();
  const { requestHeight } = useSheetHeight();

  // Measured so the sheet can shrink to fit a short form (92% height is just the cap).
  const [headerHeight, setHeaderHeight] = useState(0);
  const [scrollContentHeight, setScrollContentHeight] = useState(0);
  const [footerHeight, setFooterHeight] = useState(0);

  // Re-request even with the keyboard open: `scrollContentHeight` already inflates by
  // `keyboardPadding`, so the sheet grows by the keyboard height and the portion above
  // the keyboard fits header + form + Pay button exactly.
  useEffect(() => {
    if (headerHeight === 0 || scrollContentHeight === 0 || footerHeight === 0) return;
    const desired = DRAG_HANDLE_AREA + headerHeight + scrollContentHeight + footerHeight;
    const max = screenHeight * MAX_SHEET_HEIGHT_RATIO;
    const release = requestHeight(Math.min(desired, max));
    return release;
  }, [headerHeight, scrollContentHeight, footerHeight, screenHeight, requestHeight]);
  // Gap between the Pay button and the keyboard / system inset:
  //   - keyboard closed: max(bottomInset, spacing.large) — clears home indicator / gesture pill.
  //   - iOS keyboard open: spacing.large (16). `keyboard.endCoordinates.height` already
  //     includes the home-indicator area, so the bottom inset isn't needed.
  //   - Android keyboard open: spacing.large + bottomInset (≈40). Android reports just the
  //     keys area in `endCoordinates.height`, NOT the suggestion / GIF strip above. The extra
  //     `bottomInset` compensates so the visible gap matches iOS.
  const footerPaddingBottom =
    keyboardPadding === 0
      ? Math.max(bottomInset, tokens.spacing.large)
      : Platform.OS === 'ios'
        ? tokens.spacing.large
        : tokens.spacing.large + Math.max(bottomInset, tokens.spacing.large);
  const styles = useMemo(() => createStyles(tokens), [tokens]);

  const canSubmit = cardForm.isValid && billingForm.isValid && !cardForm.isSubmitting;

  // Flush pending billing-address debounce before navigating so native has the full address;
  // if anything fails before submit dispatches, the user stays on the form instead of stranded
  // on the processing screen with nothing in flight.
  const handlePay = useCallback(async () => {
    if (!canSubmit) return;
    if (billingForm.sectionVisible) {
      await billingForm.flush();
    }
    replace(CheckoutRoute.processing);
    cardForm.submit();
  }, [canSubmit, cardForm, billingForm, replace]);

  return (
    <View style={styles.root}>
      <View onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}>
        <NavigationHeader
          title={t('primer_card_form_title')}
          showBackButton={canGoBack}
          backLabel={t('primer_common_back')}
          onBackPress={pop}
          rightAction={{ label: t('primer_common_button_cancel'), onPress: onCancel }}
        />
      </View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: tokens.spacing.medium + keyboardPadding }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        onContentSizeChange={(_, h) => setScrollContentHeight(h)}
      >
        <PrimerCardForm cardForm={cardForm} autoFocus onSubmit={handlePay} />
        {billingForm.sectionVisible && (
          <>
            <View style={styles.divider} />
            <Text style={styles.sectionTitle}>{t('primer_card_form_billing_address_title')}</Text>
            <PrimerBillingAddressForm billingForm={billingForm} />
          </>
        )}
      </ScrollView>
      {/* Opaque overlay over the keyboard's area so form fields don't show through the
        translucent iOS keyboard. Absolute so it stays out of the flex layout. */}
      {keyboardPadding > 0 && (
        <View pointerEvents="none" style={[styles.keyboardOverlay, { height: keyboardPadding }]} />
      )}
      <View
        onLayout={(e) => setFooterHeight(e.nativeEvent.layout.height)}
        style={[
          styles.footer,
          {
            paddingBottom: footerPaddingBottom,
            transform: [{ translateY: -keyboardPadding }],
          },
        ]}
      >
        <TouchableOpacity
          onPress={handlePay}
          disabled={!canSubmit}
          activeOpacity={0.7}
          style={[styles.payButton, !canSubmit && styles.payButtonDisabled]}
          accessibilityRole="button"
          accessibilityState={{ disabled: !canSubmit, busy: cardForm.isSubmitting }}
          accessibilityLabel={t('accessibility_card_form_submit_label')}
          accessibilityHint={
            cardForm.isSubmitting
              ? t('accessibility_card_form_submit_loading')
              : canSubmit
                ? t('accessibility_card_form_submit_hint')
                : t('accessibility_card_form_submit_disabled')
          }
          testID="primer-card-form-submit"
        >
          {cardForm.isSubmitting ? (
            <ActivityIndicator color={tokens.colors.background} />
          ) : (
            <Text style={styles.payButtonText}>{t('primer_common_button_pay')}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

function createStyles(tokens: PrimerTokens) {
  const { colors, radii, spacing, typography } = tokens;
  /* eslint-disable react-native/no-unused-styles */
  return StyleSheet.create({
    divider: {
      backgroundColor: colors.border,
      height: StyleSheet.hairlineWidth,
      marginVertical: spacing.small,
    },
    footer: {
      backgroundColor: colors.background,
      paddingHorizontal: spacing.large,
      paddingTop: spacing.small,
    },
    keyboardOverlay: {
      backgroundColor: colors.background,
      bottom: 0,
      left: 0,
      position: 'absolute',
      right: 0,
    },
    payButton: {
      alignItems: 'center',
      backgroundColor: colors.primary,
      borderRadius: radii.medium,
      justifyContent: 'center',
      minHeight: 44,
      padding: spacing.medium,
      width: '100%',
    },
    payButtonDisabled: {
      opacity: 0.5,
    },
    payButtonText: {
      color: colors.background,
      fontFamily: typography.titleLarge.fontFamily,
      fontSize: typography.titleLarge.fontSize,
      fontWeight: typography.titleLarge.fontWeight as TextStyle['fontWeight'],
      letterSpacing: typography.titleLarge.letterSpacing,
      lineHeight: typography.titleLarge.lineHeight,
      textAlign: 'center',
    },
    root: {
      flex: 1,
    },
    scrollContent: {
      gap: spacing.medium,
      paddingBottom: spacing.medium,
      paddingHorizontal: spacing.large,
      paddingTop: spacing.large,
    },
    scrollView: {
      flex: 1,
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
