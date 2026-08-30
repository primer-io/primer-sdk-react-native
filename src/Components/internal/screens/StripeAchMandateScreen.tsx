import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { TextStyle } from 'react-native';

import { usePrimerTheme } from '../theme';
import type { PrimerTokens } from '../theme';
import { NavigationHeader } from '../navigation/NavigationHeader';
import { useNavigation } from '../navigation/useNavigation';
import { usePrimerLocalization } from '../localization';
import { usePrimerCheckout } from '../../hooks/usePrimerCheckout';
import { CheckoutButton } from '../ui/CheckoutButton';
import { useBottomSafeArea } from './useBottomSafeArea';

// Prebuilt ACH mandate screen: accept completes the payment, decline cancels it (→ error screen); no dismiss while mid-flight.
export function StripeAchMandateScreen() {
  const tokens = usePrimerTheme();
  const styles = useMemo(() => createStyles(tokens), [tokens]);
  const { t } = usePrimerLocalization();
  const { popToRoot } = useNavigation();
  const { achMandate, achStep, acceptAchMandate, declineAchMandate } = usePrimerCheckout();
  const bottomInset = useBottomSafeArea();

  const answering = achStep === 'answeringMandate';

  // Defensive: this screen is only routed to while a mandate awaits an answer.
  if (!achMandate) {
    return null;
  }

  const handleAccept = () => {
    void acceptAchMandate();
  };

  const handleDecline = () => {
    void declineAchMandate();
    popToRoot();
  };

  return (
    <View style={styles.root}>
      <NavigationHeader title={t('primer_ach_mandate_title')} showBackButton={false} />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.mandateText}>{achMandate.text}</Text>
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: Math.max(bottomInset, tokens.spacing.large) }]}>
        <CheckoutButton
          title={t('primer_ach_mandate_button_accept')}
          onPress={handleAccept}
          variant="primary"
          loading={answering}
          accessibilityHint={t('accessibility_ach_mandate_accept_hint')}
        />
        <CheckoutButton
          title={t('primer_ach_mandate_button_decline')}
          onPress={handleDecline}
          variant="outlined"
          disabled={answering}
          accessibilityHint={t('accessibility_ach_mandate_decline_hint')}
        />
      </View>
    </View>
  );
}

function createStyles(tokens: PrimerTokens) {
  const { colors, spacing, typography } = tokens;
  /* eslint-disable react-native/no-unused-styles */
  return StyleSheet.create({
    footer: {
      backgroundColor: colors.backgroundPrimary,
      gap: spacing.small,
      paddingHorizontal: spacing.large,
      paddingTop: spacing.small,
    },
    mandateText: {
      color: colors.textPrimary,
      fontFamily: typography.bodyMedium.fontFamily,
      fontSize: typography.bodyMedium.fontSize,
      fontWeight: typography.bodyMedium.fontWeight as TextStyle['fontWeight'],
      letterSpacing: typography.bodyMedium.letterSpacing,
      lineHeight: typography.bodyMedium.lineHeight,
    },
    root: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: spacing.large,
      paddingTop: spacing.large,
    },
    scrollView: {
      flex: 1,
    },
  });
  /* eslint-enable react-native/no-unused-styles */
}
