import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';

import {
  PrimerCheckoutProvider,
  PrimerCardFormProvider,
  PrimerCardNumberInput,
  PrimerExpiryDateInput,
  PrimerCVVInput,
  PrimerCardholderNameInput,
  PrimerErrorScreen,
  usePrimerCheckout,
  usePrimerCardForm,
  usePrimerVaultManager,
  usePrimerLocalization,
} from '@primer-io/react-native';
import type { PrimerSettings } from '@primer-io/react-native';

import { appPaymentParameters } from '../models/IClientSessionRequestBody';
import { getPaymentHandlingStringVal } from '../network/Environment';
import { customAppearanceMode } from './SettingsScreen';

// Showcase: one-tap repurchase on the vault. Saved cards come from
// usePrimerVaultManager — selection, the preselected default, and pay() all
// belong to the hook; the merchant renders coffee. A "use another card" row
// expands the Primer card form as the fallback (and is the default view when
// the customer has nothing vaulted yet).

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const animate = () => LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

const COLORS = {
  accent: '#6F4E37',
  accentDark: '#54392B',
  accentLight: '#B79B86',
  background: '#F5EFE6',
  border: '#E5DCCF',
  card: '#FFFFFF',
  gold: '#F5C36B',
  goldBg: '#FBF3E4',
  goldDark: '#B07D2B',
  textPrimary: '#3A2E25',
  textSecondary: '#8A7B6D',
};

// Mock loyalty program — pure demo dressing, all local state. Stars accrue at
// +2★ per £1 on payment success; the QR is a hardcoded pattern that looks the
// part but doesn't scan.
const LOYALTY_STARTING_STARS = 118;
const REWARD_TARGET_STARS = 150;
const STARS_PER_MAJOR_UNIT = 2;

const QR_MATRIX = [
  '111111101011001111111',
  '100000100100101000001',
  '101110101101001011101',
  '101110100011101011101',
  '101110101010101011101',
  '100000100111001000001',
  '111111101010101111111',
  '000000001101000000000',
  '001001101100101011010',
  '010001010110010010110',
  '001101101001101100101',
  '010010010100110011010',
  '001101001011001010011',
  '000000011001010000000',
  '111111100110101001011',
  '100000101011010110010',
  '101110100101101001101',
  '101110101010010110100',
  '101110100110101001011',
  '100000101001010110110',
  '111111100101101001010',
];

const settings: PrimerSettings = {
  paymentHandling: getPaymentHandlingStringVal(appPaymentParameters.paymentHandling),
  paymentMethodOptions: { iOS: { urlScheme: 'merchant://primer.io' } },
  uiOptions: { appearanceMode: customAppearanceMode },
  debugOptions: { is3DSSanityCheckEnabled: false },
  clientSessionCachingEnabled: true,
  apiVersion: '2.4',
};

const demoTheme = {
  light: {
    colors: {
      primary: COLORS.accent,
      borderFocused: COLORS.accent,
    },
  },
};

type CoffeeReorderRouteProp = RouteProp<{ CoffeeReorder: { clientToken: string } }, 'CoffeeReorder'>;

export function CoffeeReorderScreen({ navigation }: { navigation: { goBack: () => void } }) {
  const { clientToken } = useRoute<CoffeeReorderRouteProp>().params;

  return (
    <PrimerCheckoutProvider
      clientToken={clientToken}
      settings={settings}
      theme={demoTheme}
      onCheckoutComplete={(data) => console.log('Checkout complete:', data)}
      onError={(error) => Alert.alert('Checkout Error', error.errorId ?? 'Unknown error')}
    >
      <PrimerCardFormProvider>
        <CoffeeReorderFlow onDone={() => navigation.goBack()} />
      </PrimerCardFormProvider>
    </PrimerCheckoutProvider>
  );
}

function FakeQRCode() {
  return (
    <View>
      {QR_MATRIX.map((row, y) => (
        <View key={y} style={styles.qrRow}>
          {row.split('').map((cell, x) => (
            <View key={x} style={[styles.qrCell, cell === '1' && styles.qrCellDark]} />
          ))}
        </View>
      ))}
    </View>
  );
}

function LoyaltyCard({ stars }: { stars: number }) {
  const remaining = Math.max(0, REWARD_TARGET_STARS - stars);
  const progress = Math.min(1, stars / REWARD_TARGET_STARS);

  return (
    <View style={styles.loyaltyCard}>
      <View style={styles.loyaltyHeaderRow}>
        <Text style={styles.loyaltyTitle}>☕ Primer Coffee Club</Text>
        <View style={styles.loyaltyChip}>
          <Text style={styles.loyaltyChipText}>GOLD</Text>
        </View>
      </View>
      <View style={styles.loyaltyStarsRow}>
        <Text style={styles.loyaltyStars}>{stars} ★</Text>
        <Text style={styles.loyaltyNext}>
          {remaining === 0 ? 'Free drink unlocked 🎉' : `${remaining}★ to a free drink`}
        </Text>
      </View>
      <View style={styles.loyaltyTrack}>
        <View style={[styles.loyaltyFill, { width: `${progress * 100}%` }]} />
      </View>
      <View style={styles.qrPanel}>
        <FakeQRCode />
        <Text style={styles.qrCaption}>Scan at the till to earn stars</Text>
      </View>
    </View>
  );
}

function CoffeeReorderFlow({ onDone }: { onDone: () => void }) {
  const { isReady, activeMethod, setActiveMethod, paymentOutcome, retry, clearPaymentOutcome, clientSession } =
    usePrimerCheckout();
  const cardForm = usePrimerCardForm();
  const vault = usePrimerVaultManager();
  const { formatCurrency } = usePrimerLocalization();

  // When true, the shopper pays with the expanded card form instead of a saved card.
  const [usingNewCard, setUsingNewCard] = useState(false);
  // Mirrors the drop-in's processing pattern: on while a submit/retry is in
  // flight, off when the outcome lands (covers the post-tokenize window too).
  const [processing, setProcessing] = useState(false);
  // Mock loyalty balance — local demo state only.
  const [stars, setStars] = useState(LOYALTY_STARTING_STARS);
  const [earnedStars, setEarnedStars] = useState(0);
  const earnedRef = useRef(false);

  const hasSavedCards = vault.vaultedMethods.length > 0;
  const showNewCardForm = usingNewCard || (!vault.isLoading && !hasSavedCards);
  const totalLabel =
    clientSession?.totalAmount != null && clientSession.currencyCode
      ? formatCurrency(clientSession.totalAmount, clientSession.currencyCode)
      : '—';

  useEffect(() => {
    if (isReady && activeMethod == null) {
      setActiveMethod('PAYMENT_CARD');
    }
  }, [isReady, activeMethod, setActiveMethod]);

  useEffect(() => {
    if (paymentOutcome != null) {
      setProcessing(false);
    }
  }, [paymentOutcome]);

  // Earn stars once per successful payment; re-arm if the outcome is cleared
  // (error → choose another method → pay again).
  useEffect(() => {
    if (paymentOutcome?.status === 'success' && !earnedRef.current) {
      earnedRef.current = true;
      const amount = clientSession?.totalAmount ?? 0;
      const earned = Math.max(1, Math.round((amount / 100) * STARS_PER_MAJOR_UNIT));
      setEarnedStars(earned);
      setStars((current) => current + earned);
    }
    if (paymentOutcome == null) {
      earnedRef.current = false;
    }
  }, [paymentOutcome, clientSession]);

  if (paymentOutcome?.status === 'success') {
    const payment = paymentOutcome.data.payment;
    const orderRef = payment?.orderId ?? payment?.id;
    const paidWith = showNewCardForm
      ? 'New card'
      : vault.activeMethod != null
        ? `${vault.activeMethod.brandName ?? 'Card'} ••${vault.activeMethod.last4 ?? ''}`
        : null;

    return (
      <View style={styles.successRoot}>
        <View style={styles.successIconRing}>
          <View style={styles.successIconCircle}>
            <Text style={styles.successIconCheck}>✓</Text>
          </View>
        </View>
        <Text style={styles.successTitle}>Order placed!</Text>
        <Text style={styles.successSubtitle}>Your usual is on its way ☕</Text>

        <View style={styles.successCard}>
          <Text style={styles.orderTitle}>Your usual</Text>
          <Text style={styles.orderItems}>2× Flat White · 1× Almond Croissant</Text>
          <View style={styles.successDivider} />
          <View style={styles.successRow}>
            <Text style={styles.successRowLabel}>Total paid</Text>
            <Text style={styles.successRowValue}>{totalLabel}</Text>
          </View>
          {paidWith != null && (
            <View style={styles.successRow}>
              <Text style={styles.successRowLabel}>Paid with</Text>
              <Text style={styles.successRowValue}>{paidWith}</Text>
            </View>
          )}
          {orderRef != null && (
            <View style={styles.successRow}>
              <Text style={styles.successRowLabel}>Order ref</Text>
              <Text style={styles.successRowValue} numberOfLines={1}>
                {orderRef}
              </Text>
            </View>
          )}
          {earnedStars > 0 && (
            <View style={[styles.successRow, styles.receiptStarsRow]}>
              <Text style={styles.successRowLabel}>Stars earned</Text>
              <Text style={[styles.successRowValue, styles.receiptStarsValue]}>
                +{earnedStars} ★ → {stars} ★
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity style={[styles.payButton, styles.successButton]} onPress={onDone}>
          <Text style={styles.payButtonText}>Done</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (paymentOutcome?.status === 'error') {
    return (
      <PrimerErrorScreen
        subtitle={paymentOutcome.error.description}
        onRetry={() => {
          setProcessing(true);
          void retry();
        }}
        onChooseOtherMethod={() => {
          clearPaymentOutcome();
        }}
      />
    );
  }

  const showProcessing = (processing || cardForm.isSubmitting) && paymentOutcome == null;
  const payEnabled = showNewCardForm ? cardForm.isValid : vault.activeMethod != null;
  const payTitle = showNewCardForm
    ? `Pay ${totalLabel}`
    : vault.activeMethod != null
      ? `Pay with ${vault.activeMethod.brandName ?? 'saved card'} ••${vault.activeMethod.last4 ?? ''}`
      : 'Select a card';

  const handlePay = () => {
    setProcessing(true);
    if (showNewCardForm) {
      void cardForm.submit();
      return;
    }
    vault.pay().catch((err) => {
      console.warn('[CoffeeReorder] vault payment failed to start', err);
      setProcessing(false);
    });
  };

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Mock loyalty card — stars + scan-to-earn QR */}
        <LoyaltyCard stars={stars} />

        {/* The usual order */}
        <View style={styles.orderCard}>
          <Text style={styles.orderEmoji}>☕</Text>
          <View style={styles.orderInfo}>
            <Text style={styles.orderTitle}>Your usual</Text>
            <Text style={styles.orderItems}>2× Flat White · 1× Almond Croissant</Text>
          </View>
          <Text style={styles.orderPrice}>{totalLabel}</Text>
        </View>

        {/* Saved cards — selection state lives in the vault hook itself */}
        {vault.isLoading ? (
          <ActivityIndicator color={COLORS.accent} style={styles.spinner} />
        ) : hasSavedCards ? (
          <>
            <Text style={styles.sectionLabel}>Pay with a saved card</Text>
            {vault.vaultedMethods.map((method) => {
              const isSelected = !usingNewCard && vault.activeMethod?.id === method.id;
              return (
                <Pressable
                  key={method.id}
                  style={[styles.cardRow, isSelected && styles.cardRowSelected]}
                  onPress={() => {
                    animate();
                    setUsingNewCard(false);
                    vault.selectVaultedMethodId(method.id);
                  }}
                >
                  {method.brandIconUri != null ? (
                    <Image source={{ uri: method.brandIconUri }} style={styles.brandIcon} resizeMode="contain" />
                  ) : (
                    <Text style={styles.brandIconFallback}>💳</Text>
                  )}
                  <View style={styles.cardRowInfo}>
                    <Text style={styles.cardRowTitle}>
                      {method.brandName ?? 'Card'} •••• {method.last4 ?? ''}
                    </Text>
                    {method.expiryMonth != null && method.expiryYear != null && (
                      <Text style={styles.cardRowMeta}>
                        Expires {method.expiryMonth}/{method.expiryYear}
                      </Text>
                    )}
                  </View>
                  {isSelected && <Text style={styles.checkmark}>✓</Text>}
                </Pressable>
              );
            })}
          </>
        ) : (
          <Text style={styles.emptyVaultNote}>
            No saved cards yet — pay once below and your card can be vaulted for one-tap reorders.
          </Text>
        )}

        {/* New-card fallback — expands the Primer form */}
        {hasSavedCards && (
          <Pressable
            style={[styles.cardRow, usingNewCard && styles.cardRowSelected]}
            onPress={() => {
              animate();
              setUsingNewCard((current) => !current);
            }}
          >
            <Text style={styles.brandIconFallback}>＋</Text>
            <Text style={styles.cardRowTitle}>Use another card</Text>
            {usingNewCard && <Text style={styles.checkmark}>✓</Text>}
          </Pressable>
        )}

        {showNewCardForm && (
          <View style={styles.formBox}>
            {!isReady || activeMethod == null ? (
              <ActivityIndicator color={COLORS.accent} style={styles.spinner} />
            ) : (
              <>
                <PrimerCardNumberInput />
                <View style={styles.fieldRow}>
                  <View style={styles.flexField}>
                    <PrimerExpiryDateInput />
                  </View>
                  <View style={styles.flexField}>
                    <PrimerCVVInput />
                  </View>
                </View>
                <PrimerCardholderNameInput />
              </>
            )}
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.payButton, !payEnabled && styles.payButtonDisabled]}
          onPress={handlePay}
          disabled={!payEnabled || showProcessing}
        >
          <Text style={styles.payButtonText}>{payTitle}</Text>
        </TouchableOpacity>
      </View>

      {/* Processing overlay */}
      {showProcessing && (
        <View style={styles.processingOverlay}>
          <View style={styles.processingCard}>
            <ActivityIndicator size="large" color={COLORS.accent} />
            <Text style={styles.processingText}>Brewing your payment…</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  brandIcon: {
    height: 30,
    width: 30,
  },
  brandIconFallback: {
    color: COLORS.accent,
    fontSize: 20,
    textAlign: 'center',
    width: 30,
  },
  cardRow: {
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderRadius: 14,
    borderWidth: 2,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
    padding: 14,
  },
  cardRowInfo: {
    flex: 1,
  },
  cardRowMeta: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  cardRowSelected: {
    borderColor: COLORS.accent,
  },
  cardRowTitle: {
    color: COLORS.textPrimary,
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  checkmark: {
    color: COLORS.accent,
    fontSize: 17,
    fontWeight: '700',
  },
  emptyVaultNote: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginBottom: 12,
  },
  fieldRow: {
    flexDirection: 'row',
    gap: 12,
  },
  flexField: {
    flex: 1,
  },
  footer: {
    backgroundColor: COLORS.card,
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    padding: 16,
  },
  formBox: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 12,
    marginTop: 4,
    padding: 16,
  },
  loyaltyCard: {
    backgroundColor: COLORS.accentDark,
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
  },
  loyaltyChip: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  loyaltyChipText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  loyaltyFill: {
    backgroundColor: COLORS.gold,
    borderRadius: 4,
    height: 6,
  },
  loyaltyHeaderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  loyaltyNext: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
  },
  loyaltyStars: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '800',
  },
  loyaltyStarsRow: {
    alignItems: 'baseline',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  loyaltyTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  loyaltyTrack: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 4,
    height: 6,
    marginTop: 8,
    overflow: 'hidden',
  },
  orderCard: {
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
    padding: 16,
  },
  orderEmoji: {
    fontSize: 34,
  },
  orderInfo: {
    flex: 1,
  },
  orderItems: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 2,
  },
  orderPrice: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontWeight: '700',
  },
  orderTitle: {
    color: COLORS.textPrimary,
    fontSize: 17,
    fontWeight: '700',
  },
  payButton: {
    alignItems: 'center',
    backgroundColor: COLORS.accent,
    borderRadius: 14,
    padding: 16,
  },
  payButtonDisabled: {
    backgroundColor: COLORS.accentLight,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  processingCard: {
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    gap: 14,
    paddingHorizontal: 36,
    paddingVertical: 28,
  },
  processingOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(58,46,37,0.4)',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  processingText: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  qrCaption: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 8,
  },
  qrCell: {
    height: 4,
    width: 4,
  },
  qrCellDark: {
    backgroundColor: COLORS.textPrimary,
  },
  qrPanel: {
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    marginTop: 14,
    padding: 12,
  },
  qrRow: {
    flexDirection: 'row',
  },
  receiptStarsRow: {
    backgroundColor: COLORS.goldBg,
    borderRadius: 8,
    padding: 8,
  },
  receiptStarsValue: {
    color: COLORS.goldDark,
  },
  root: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 32,
  },
  sectionLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  spinner: {
    padding: 14,
  },
  successButton: {
    alignSelf: 'stretch',
    marginTop: 24,
  },
  successCard: {
    alignSelf: 'stretch',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    gap: 8,
    marginTop: 24,
    padding: 16,
  },
  successDivider: {
    backgroundColor: COLORS.border,
    height: 1,
  },
  successIconCheck: {
    color: '#fff',
    fontSize: 34,
    fontWeight: '700',
  },
  successIconCircle: {
    alignItems: 'center',
    backgroundColor: COLORS.accent,
    borderRadius: 32,
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  successIconRing: {
    alignItems: 'center',
    backgroundColor: 'rgba(111,78,55,0.12)',
    borderRadius: 44,
    height: 88,
    justifyContent: 'center',
    width: 88,
  },
  successRoot: {
    alignItems: 'center',
    backgroundColor: COLORS.background,
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  successRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  successRowLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  successRowValue: {
    color: COLORS.textPrimary,
    flexShrink: 1,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
  },
  successSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: 4,
  },
  successTitle: {
    color: COLORS.textPrimary,
    fontSize: 22,
    fontWeight: '700',
    marginTop: 12,
  },
});
