import { useEffect, useMemo, useRef, useState } from 'react';
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

import { usePrimerTheme } from '../theme';
import type { PrimerTokens } from '../theme';
import { NavigationHeader } from '../navigation/NavigationHeader';
import { useNavigation } from '../navigation/useNavigation';
import { useRoute } from '../navigation/useRoute';
import { CheckoutRoute } from '../navigation/types';
import { usePrimerLocalization } from '../localization';
import { useCheckoutFlow } from '../checkout-flow/CheckoutFlowContext';
import { usePrimerCheckout } from '../../hooks/usePrimerCheckout';
import { usePrimerPaymentMethod } from '../../hooks/usePrimerPaymentMethod';
import { PrimerTextInput } from '../../inputs';
import { useSheetHeight } from '../checkout-sheet';
import { useBottomSafeArea } from './useBottomSafeArea';
import { useKeyboardPadding } from './useKeyboardPadding';

// CheckoutSheet drag-handle chrome above our content: paddingTop(12) + handle(4) + paddingBottom(4).
const DRAG_HANDLE_AREA = 20;
// Matches CheckoutSheet's DEFAULT_HEIGHT_RATIO — the sheet never exceeds 92% of the screen.
const MAX_SHEET_HEIGHT_RATIO = 0.92;

/**
 * Prebuilt Stripe ACH user-details screen: collects the account holder's first name, last name
 * and email address (prefilled from the client session when available), validated natively per
 * keystroke. Continue hands off to the native Stripe bank collector — this screen never renders
 * bank-account fields. The mandate then arrives flow-level (AchMandateTransitioner) and the
 * outcome through the shared handling. Dogfoods the public `usePrimerPaymentMethod` API.
 */
export function StripeAchUserDetailsScreen() {
  const tokens = usePrimerTheme();
  const styles = useMemo(() => createStyles(tokens), [tokens]);
  const { t } = usePrimerLocalization();
  const { params } = useRoute<CheckoutRoute.stripeAchUserDetails>();
  const { pop, canGoBack } = useNavigation();
  const { onCancel } = useCheckoutFlow();
  const { stopAch } = usePrimerCheckout();
  const bottomInset = useBottomSafeArea();
  const keyboardPadding = useKeyboardPadding();
  const { height: screenHeight } = useWindowDimensions();
  const { requestHeight } = useSheetHeight();

  // Measured so the sheet can shrink to fit the short form (92% height is just the cap).
  const [headerHeight, setHeaderHeight] = useState(0);
  const [scrollContentHeight, setScrollContentHeight] = useState(0);
  const [footerHeight, setFooterHeight] = useState(0);

  const method = usePrimerPaymentMethod(params.paymentMethodType);
  const ach = method.kind === 'stripeAch' ? method : null;

  // Defensive arm: the selection screen normally arms the flow before pushing here, but a direct
  // mount (custom navigation) still works. Arm once per mount — the outcome gate stops a terminal
  // reset (error/decline) re-arming, and the ref stops a Back-tap disarm re-arming during the pop.
  const start = ach?.start;
  const needsArm = ach?.step === 'idle' && !ach?.paymentOutcome;
  const hasArmedRef = useRef(false);
  useEffect(() => {
    if (needsArm && !hasArmedRef.current) {
      hasArmedRef.current = true;
      void start?.();
    }
  }, [needsArm, start]);

  // Size the sheet to header + form + footer, capped at 92%. scrollContentHeight already inflates
  // by keyboardPadding, so an open keyboard grows the sheet and the area above it fits exactly.
  // Only fires once the form is measured, so the brief starting spinner keeps the default height.
  useEffect(() => {
    if (headerHeight === 0 || scrollContentHeight === 0 || footerHeight === 0) return;
    const desired = DRAG_HANDLE_AREA + headerHeight + scrollContentHeight + footerHeight;
    return requestHeight(Math.min(desired, screenHeight * MAX_SHEET_HEIGHT_RATIO));
  }, [headerHeight, scrollContentHeight, footerHeight, screenHeight, requestHeight]);

  // Defensive: this screen is only routed to for the stripeAch kind.
  if (!ach) {
    return null;
  }

  const { step, userDetails, fieldErrors, isValid } = ach;
  const isStarting = step === 'idle' || step === 'starting';
  // The native bank collector owns these states — no navigation, no edits, no back.
  const isWaiting = step === 'submittingDetails' || step === 'awaitingBankLink';
  const canSubmit = isValid && step === 'collectingDetails';

  // Gap between the Continue button and the keyboard / system inset (mirrors CardFormScreen):
  //   - keyboard closed: max(bottomInset, spacing.large) — clears the home indicator.
  //   - iOS keyboard open: spacing.large; the keyboard height already includes the inset.
  //   - Android keyboard open: spacing.large + bottomInset; Android omits the suggestion strip.
  const footerPaddingBottom =
    keyboardPadding === 0
      ? Math.max(bottomInset, tokens.spacing.large)
      : Platform.OS === 'ios'
        ? tokens.spacing.large
        : tokens.spacing.large + Math.max(bottomInset, tokens.spacing.large);

  const handleBack = () => {
    if (isWaiting) {
      return;
    }
    stopAch();
    pop();
  };

  const handleContinue = () => {
    if (!canSubmit) {
      return;
    }
    void ach.submit();
  };

  return (
    <View style={styles.root}>
      <View onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}>
        <NavigationHeader
          title={t('primer_ach_title')}
          showBackButton={canGoBack && !isWaiting}
          backLabel={t('primer_common_back')}
          onBackPress={handleBack}
          rightAction={{ label: t('primer_common_button_cancel'), onPress: onCancel }}
        />
      </View>
      {isStarting ? (
        <View style={styles.loading}>
          <ActivityIndicator color={tokens.colors.primary} />
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: tokens.spacing.large + keyboardPadding }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          onContentSizeChange={(_, h) => setScrollContentHeight(h)}
        >
          <Text style={styles.title}>{t('primer_ach_user_details_title')}</Text>
          <Text style={styles.subtitle}>{t('primer_ach_personal_details_subtitle')}</Text>
          <View style={styles.nameRow}>
            <PrimerTextInput
              style={styles.nameField}
              label={t('primer_ach_first_name_label')}
              value={userDetails.firstName}
              onChangeText={(text) => void ach.setFirstName(text)}
              error={fieldErrors.firstName}
              autoCapitalize="words"
              autoComplete="name-given"
              editable={!isWaiting}
            />
            <PrimerTextInput
              style={styles.nameField}
              label={t('primer_ach_last_name_label')}
              value={userDetails.lastName}
              onChangeText={(text) => void ach.setLastName(text)}
              error={fieldErrors.lastName}
              autoCapitalize="words"
              autoComplete="name-family"
              editable={!isWaiting}
            />
          </View>
          <PrimerTextInput
            label={t('primer_ach_email_address_label')}
            value={userDetails.emailAddress}
            onChangeText={(text) => void ach.setEmailAddress(text)}
            error={fieldErrors.emailAddress}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            editable={!isWaiting}
          />
          <Text style={styles.disclaimer}>{t('primer_ach_email_disclaimer')}</Text>
        </ScrollView>
      )}
      {/* Opaque overlay over the keyboard's area so form fields don't show through the
        translucent iOS keyboard. Absolute so it stays out of the flex layout. */}
      {keyboardPadding > 0 && (
        <View pointerEvents="none" style={[styles.keyboardOverlay, { height: keyboardPadding }]} />
      )}
      <View
        onLayout={(e) => setFooterHeight(e.nativeEvent.layout.height)}
        style={[styles.footer, { paddingBottom: footerPaddingBottom, transform: [{ translateY: -keyboardPadding }] }]}
      >
        <TouchableOpacity
          onPress={handleContinue}
          disabled={!canSubmit}
          activeOpacity={0.7}
          style={[styles.continueButton, !canSubmit && styles.continueButtonDisabled]}
          accessibilityRole="button"
          accessibilityState={{ disabled: !canSubmit, busy: isWaiting }}
          accessibilityHint={t('accessibility_ach_continue_hint')}
        >
          {isWaiting ? (
            <ActivityIndicator color={tokens.colors.background} />
          ) : (
            <Text style={styles.continueButtonText}>{t('primer_ach_button_continue')}</Text>
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
    continueButton: {
      alignItems: 'center',
      backgroundColor: colors.primary,
      borderRadius: radii.medium,
      justifyContent: 'center',
      minHeight: 44,
      padding: spacing.medium,
      width: '100%',
    },
    continueButtonDisabled: {
      opacity: 0.5,
    },
    continueButtonText: {
      color: colors.background,
      fontFamily: typography.titleLarge.fontFamily,
      fontSize: typography.titleLarge.fontSize,
      fontWeight: typography.titleLarge.fontWeight as TextStyle['fontWeight'],
      letterSpacing: typography.titleLarge.letterSpacing,
      lineHeight: typography.titleLarge.lineHeight,
      textAlign: 'center',
    },
    disclaimer: {
      color: colors.textSecondary,
      fontFamily: typography.bodySmall.fontFamily,
      fontSize: typography.bodySmall.fontSize,
      fontWeight: typography.bodySmall.fontWeight as TextStyle['fontWeight'],
      letterSpacing: typography.bodySmall.letterSpacing,
      lineHeight: typography.bodySmall.lineHeight,
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
    loading: {
      alignItems: 'center',
      flex: 1,
      justifyContent: 'center',
    },
    nameField: {
      flex: 1,
    },
    nameRow: {
      alignItems: 'flex-start',
      flexDirection: 'row',
      gap: spacing.medium,
    },
    root: {
      flex: 1,
    },
    scrollContent: {
      gap: spacing.medium,
      paddingHorizontal: spacing.large,
      paddingTop: spacing.large,
    },
    scrollView: {
      flex: 1,
    },
    subtitle: {
      color: colors.textSecondary,
      fontFamily: typography.bodyMedium.fontFamily,
      fontSize: typography.bodyMedium.fontSize,
      fontWeight: typography.bodyMedium.fontWeight as TextStyle['fontWeight'],
      letterSpacing: typography.bodyMedium.letterSpacing,
      lineHeight: typography.bodyMedium.lineHeight,
    },
    title: {
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
