import { useMemo } from 'react';
import { Image, Platform, Text, TouchableOpacity, StyleSheet, View } from 'react-native';
import type { TextStyle } from 'react-native';
import { PrimerGooglePayButton as PrimerGooglePayNativeButton } from '../../../HeadlessUniversalCheckout/Components/PrimerGooglePayButton';
import { APPLE_PAY } from '../applePay';
import { splitKlarnaLabel } from '../klarnaLabel';
import { partnerAssets } from '../paymentMethodAssetVariant';
import { usePrimerColorScheme, usePrimerTheme } from '../theme';
import type { PrimerTokens } from '../theme';
import { usePrimerLocalization } from '../localization';
import type { PaymentMethodButtonProps } from '../../types/PrimerPaymentMethodListTypes';
import { ApplePayNativeButton } from './ApplePayNativeButton';

const creditCardIcon = require('../screens/assets/credit-card.png');
const klarnaWordmark = require('../screens/assets/klarna-wordmark.png');

export const PAYMENT_METHOD_BUTTON_HEIGHT = 44;
const BUTTON_HEIGHT = PAYMENT_METHOD_BUTTON_HEIGHT;
// The design's logo frame (PayPal: 75 x 26 in a 44 high button), as in both native SDKs. The
// backend logos carry the design's transparent padding, so the frame is sized, not the ink.
const PARTNER_LOGO_HEIGHT = 26;
const PAYMENT_CARD_TYPE = 'PAYMENT_CARD';
const KLARNA_TYPE = 'KLARNA';
// the surcharge badge sits on the payment method's own brand colour, which merchant theming
// doesn't control, so it stays a fixed light value
const ON_BRAND_SURFACE_TEXT = '#ffffff';
// Klarna's brand colours: the same in both modes and outside merchant theming, as in both native SDKs.
const KLARNA_BLACK = '#0b051d';
const KLARNA_PINK = '#ffa8cd';
const KLARNA_ON_BLACK = '#ffffff';

export function PaymentMethodButton({ item, onPress }: PaymentMethodButtonProps) {
  const tokens = usePrimerTheme();
  const scheme = usePrimerColorScheme();
  const styles = useMemo(() => createStyles(tokens), [tokens]);
  const { t } = usePrimerLocalization();
  const methodLabel = t('accessibility_screen_payment_method', { paymentMethodName: item.name });

  // Native-view methods (e.g. Google Pay) render the SDK's own display-only button as the whole
  // row; pointerEvents="none" lets the row's TouchableOpacity own the tap, not the native button.
  if (item.nativeViewName === 'PrimerGooglePayButton') {
    return (
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={methodLabel}
        style={styles.nativeButton}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.nativeButton} pointerEvents="none">
          <PrimerGooglePayNativeButton style={styles.nativeButton} />
        </View>
      </TouchableOpacity>
    );
  }

  // PassKit's own button, as in the iOS SDK, in the list's scheme so a forced appearanceMode wins.
  // iOS only: the Android SDK never lists APPLE_PAY and Android registers no such view. It can't
  // carry text, so it shows no surcharge, and it stays 44 high as PassKit doesn't grow.
  if (item.type === APPLE_PAY && Platform.OS === 'ios') {
    return (
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={methodLabel}
        style={styles.nativeButton}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.nativeButton} pointerEvents="none">
          <ApplePayNativeButton colorScheme={scheme} cornerRadius={tokens.radii.medium} style={styles.nativeButton} />
        </View>
      </TouchableOpacity>
    );
  }

  // Only the flat surcharge has a single amount we can display on the button.
  // `perNetwork` (PAYMENT_CARD) depends on the card the user enters — skip here.
  const surchargeLabel = item.surcharge?.kind === 'flat' ? `+${item.surcharge.amount}` : null;
  // The row's label replaces its children for screen readers, so it carries the fee too.
  const withSurcharge = (label: string) => (surchargeLabel != null ? `${label}, ${surchargeLabel}` : label);

  // PAYMENT_CARD never takes the partner path: it always shows the bundled card glyph and the
  // "Pay with card" label, even if the native resource exposes a logo or background.
  if (item.type === PAYMENT_CARD_TYPE) {
    return (
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={withSurcharge(t('accessibility_payment_selection_pay_with_card'))}
        style={[styles.button, styles.cardButton]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Image source={creditCardIcon} style={styles.cardIcon} resizeMode="contain" />
        <Text style={styles.titleText}>{t('primer_card_form_title')}</Text>
        {surchargeLabel != null && <Text style={styles.surchargeDark}>{surchargeLabel}</Text>}
      </TouchableOpacity>
    );
  }

  // Drawn by the SDK, not from the backend's assets: "Pay with Klarna" on Klarna's black, the pink
  // badge in the word's place, so the language's own word order holds.
  if (item.type === KLARNA_TYPE) {
    const label = t('accessibility_payment_selection_pay_with_klarna');
    const { before, after } = splitKlarnaLabel(label);
    return (
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={withSurcharge(label)}
        style={[styles.button, styles.klarnaButton]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {before != null && <Text style={[styles.klarnaText, styles.klarnaTextBefore]}>{before}</Text>}
        <View style={styles.klarnaBadge}>
          <Image source={klarnaWordmark} style={styles.klarnaWordmark} />
        </View>
        {after != null && <Text style={[styles.klarnaText, styles.klarnaTextAfter]}>{after}</Text>}
        {surchargeLabel != null && <Text style={styles.surchargeLight}>{surchargeLabel}</Text>}
      </TouchableOpacity>
    );
  }

  // Partner button (PayPal, iDEAL…): the backend's logo on its background, no outline; the name
  // only when there is no logo. Without a backend background it takes the sheet's colour.
  const { backgroundColor, logo } = partnerAssets(item, scheme === 'dark');
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={withSurcharge(methodLabel)}
      style={[styles.button, { backgroundColor: backgroundColor ?? tokens.colors.backgroundPrimary }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {logo != null ? (
        <Image source={{ uri: logo }} style={styles.logo} resizeMode="contain" />
      ) : (
        <Text style={styles.titleText}>{item.name}</Text>
      )}
      {surchargeLabel != null && (
        <Text style={backgroundColor != null ? styles.surchargeLight : styles.surchargeDark}>{surchargeLabel}</Text>
      )}
    </TouchableOpacity>
  );
}

function createStyles(tokens: PrimerTokens) {
  const { colors, spacing, radii, sizes, widths, typography } = tokens;
  const titleLarge = {
    fontFamily: typography.titleLarge.fontFamily,
    fontSize: typography.titleLarge.fontSize,
    fontWeight: typography.titleLarge.fontWeight as TextStyle['fontWeight'],
    letterSpacing: typography.titleLarge.letterSpacing,
    lineHeight: typography.titleLarge.lineHeight,
  };

  /* eslint-disable react-native/no-unused-styles */
  return StyleSheet.create({
    // At least 44 high, growing with large text, as in both native SDKs.
    button: {
      alignItems: 'center',
      borderRadius: radii.medium,
      flexDirection: 'row',
      justifyContent: 'center',
      minHeight: BUTTON_HEIGHT,
      overflow: 'hidden',
      paddingHorizontal: spacing.small,
      paddingVertical: spacing.small,
      width: '100%',
    },
    cardButton: {
      backgroundColor: colors.backgroundOutlinedDefault,
      borderColor: colors.borderOutlinedDefault,
      borderWidth: widths.default,
    },
    cardIcon: {
      height: sizes.medium,
      marginRight: spacing.small,
      tintColor: colors.iconPrimary,
      width: sizes.medium,
    },
    klarnaBadge: {
      backgroundColor: KLARNA_PINK,
      borderRadius: radii.medium,
      padding: spacing.small,
    },
    klarnaButton: {
      backgroundColor: KLARNA_BLACK,
    },
    // Labels may shrink and wrap, so large text grows the row instead of being cut off at the sides.
    klarnaText: {
      ...titleLarge,
      color: KLARNA_ON_BLACK,
      flexShrink: 1,
    },
    klarnaTextAfter: {
      marginLeft: spacing.small,
    },
    klarnaTextBefore: {
      marginRight: spacing.small,
    },
    // The bundled wordmark is one colour, so it takes Klarna's black, as the iOS SDK tints it.
    klarnaWordmark: {
      tintColor: KLARNA_BLACK,
    },
    logo: {
      height: PARTNER_LOGO_HEIGHT,
      width: '100%',
    },
    nativeButton: {
      height: BUTTON_HEIGHT,
      width: '100%',
    },
    surchargeDark: {
      color: colors.textSecondary,
      fontFamily: typography.bodySmall.fontFamily,
      fontSize: typography.bodySmall.fontSize,
      fontWeight: typography.bodySmall.fontWeight as TextStyle['fontWeight'],
      marginLeft: spacing.small,
      position: 'absolute',
      right: spacing.small,
    },
    surchargeLight: {
      color: ON_BRAND_SURFACE_TEXT,
      fontFamily: typography.bodySmall.fontFamily,
      fontSize: typography.bodySmall.fontSize,
      fontWeight: typography.bodySmall.fontWeight as TextStyle['fontWeight'],
      opacity: 0.8,
      position: 'absolute',
      right: spacing.small,
    },
    titleText: {
      ...titleLarge,
      color: colors.textPrimary,
      flexShrink: 1,
      textAlign: 'center',
    },
  });
  /* eslint-enable react-native/no-unused-styles */
}
