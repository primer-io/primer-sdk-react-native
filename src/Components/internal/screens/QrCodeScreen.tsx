import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';

import { usePrimerCheckout } from '../../hooks/usePrimerCheckout';
import { useCheckoutFlow } from '../checkout-flow/CheckoutFlowContext';
import { usePrimerLocalization } from '../localization';
import { NavigationHeader } from '../navigation/NavigationHeader';
import { usePrimerTheme } from '../theme';
import { useBottomSafeArea } from './useBottomSafeArea';
import { useStatusScreenHeight } from './useStatusScreenHeight';

import type { TextStyle } from 'react-native';
import type { PrimerTokens } from '../theme';

const QR_SIZE = 240;
// header + title + QR image + status line + surrounding padding
const CONTENT_HEIGHT = 220 + QR_SIZE;

/**
 * Renders the QR a `NATIVE_UI` QR method (PromptPay) delivers via `onCheckoutAdditionalInfo`. The
 * shopper scans it; the native SDK polls to completion and the outcome arrives through the shared
 * `paymentOutcome` plumbing, which navigates away. No payment-method type needed — the screen reads
 * the QR straight from the shared context.
 */
export function QrCodeScreen() {
  const tokens = usePrimerTheme();
  const styles = useMemo(() => createStyles(tokens), [tokens]);
  const { t } = usePrimerLocalization();
  const { onCancel } = useCheckoutFlow();
  const { qrCode, isQrPending } = usePrimerCheckout();

  const rawBottomInset = useBottomSafeArea();
  const bottomInset = Math.max(rawBottomInset, tokens.spacing.large);
  useStatusScreenHeight(CONTENT_HEIGHT + bottomInset);

  const imageUri =
    qrCode?.base64 != null ? `data:image/png;base64,${qrCode.base64}` : qrCode?.url != null ? qrCode.url : null;

  const [imageFailed, setImageFailed] = useState(false);
  // Reset on a new QR so a retry renders the image instead of staying on the error state.
  useEffect(() => setImageFailed(false), [imageUri]);

  return (
    <View style={[styles.root, { paddingBottom: bottomInset }]}>
      <NavigationHeader
        title={t('primer_checkout_title')}
        rightAction={{ label: t('primer_common_button_cancel'), onPress: onCancel }}
      />
      <View style={styles.content}>
        <Text style={styles.title}>{t('primer_checkout_qr_title')}</Text>
        {imageFailed ? (
          <View style={styles.qr}>
            <Text style={styles.status}>{t('primer_checkout_qr_error')}</Text>
          </View>
        ) : imageUri != null ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.qr}
            resizeMode="contain"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <View style={styles.qr}>
            <ActivityIndicator color={tokens.colors.textPrimary} />
          </View>
        )}
        {imageFailed ? null : (
          <Text style={styles.status}>
            {isQrPending ? t('primer_checkout_qr_waiting') : t('primer_checkout_qr_instruction')}
          </Text>
        )}
      </View>
    </View>
  );
}

function createStyles(tokens: PrimerTokens) {
  const { colors, spacing, typography } = tokens;

  /* eslint-disable react-native/no-unused-styles */
  return StyleSheet.create({
    content: {
      alignItems: 'center',
      gap: spacing.large,
      paddingHorizontal: spacing.large,
      paddingTop: spacing.xxlarge,
    },
    qr: {
      alignItems: 'center',
      height: QR_SIZE,
      justifyContent: 'center',
      width: QR_SIZE,
    },
    root: {
      flex: 1,
      paddingTop: spacing.large,
    },
    status: {
      color: colors.textSecondary,
      fontFamily: typography.bodyMedium.fontFamily,
      fontSize: typography.bodyMedium.fontSize,
      lineHeight: typography.bodyMedium.lineHeight,
      textAlign: 'center',
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
