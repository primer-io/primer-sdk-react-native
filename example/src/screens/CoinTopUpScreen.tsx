import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
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
  usePrimerCheckout,
  usePrimerCardForm,
  usePrimerLocalization,
} from '@primer-io/react-native';
import type { PrimerSettings } from '@primer-io/react-native';

import { appPaymentParameters } from '../models/IClientSessionRequestBody';
import { getPaymentHandlingStringVal } from '../network/Environment';
import { customAppearanceMode } from './SettingsScreen';

// Showcase: payment inside a popup dialog. An arcade-style coin store — tapping
// a pack springs up a compact dialog holding the Primer card form, and the
// success / error outcome renders inside the same popup (no full-screen status).

const COLORS = {
  accent: '#22D3EE',
  background: '#0B1020',
  dialog: '#151B2E',
  magenta: '#E879F9',
  surface: '#1A2138',
  textDim: '#8B93B0',
  textLight: '#F1F5F9',
  yellow: '#FACC15',
};

interface CoinPack {
  id: string;
  coins: number;
  icon: string;
  tag?: string;
}

const PACKS: CoinPack[] = [
  { id: 'starter', coins: 500, icon: '🪙', tag: 'Starter' },
  { id: 'popular', coins: 1200, icon: '💰', tag: 'Popular' },
  { id: 'gems', coins: 3000, icon: '💎', tag: 'Best value' },
  { id: 'whale', coins: 8000, icon: '👑' },
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

type CoinTopUpRouteProp = RouteProp<{ CoinTopUp: { clientToken: string } }, 'CoinTopUp'>;

export function CoinTopUpScreen({ navigation }: { navigation: { goBack: () => void } }) {
  const { clientToken } = useRoute<CoinTopUpRouteProp>().params;

  return (
    <PrimerCheckoutProvider
      clientToken={clientToken}
      settings={settings}
      theme={demoTheme}
      onCheckoutComplete={(data) => console.log('Checkout complete:', data)}
      onError={(error) => Alert.alert('Checkout Error', error.errorId ?? 'Unknown error')}
    >
      <PrimerCardFormProvider>
        <CoinStore onClose={() => navigation.goBack()} />
      </PrimerCardFormProvider>
    </PrimerCheckoutProvider>
  );
}

function CoinStore({ onClose }: { onClose: () => void }) {
  const { isReady, activeMethod, setActiveMethod, paymentOutcome, retry, clearPaymentOutcome, clientSession } =
    usePrimerCheckout();
  const cardForm = usePrimerCardForm();
  const { formatCurrency } = usePrimerLocalization();

  const [balance, setBalance] = useState(2450);
  const [activePack, setActivePack] = useState<CoinPack | null>(null);
  // Mirrors the drop-in's processing pattern: on while a submit/retry is in
  // flight, off when the outcome lands (covers the post-tokenize window too).
  const [processing, setProcessing] = useState(false);
  const popAnim = useRef(new Animated.Value(0)).current;

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

  // Spring the dialog in whenever it opens.
  useEffect(() => {
    if (activePack != null) {
      popAnim.setValue(0);
      Animated.spring(popAnim, { toValue: 1, friction: 7, tension: 80, useNativeDriver: true }).start();
    }
  }, [activePack, popAnim]);

  // Success: celebrate inside the popup, bump the balance, then close.
  useEffect(() => {
    if (paymentOutcome?.status === 'success' && activePack != null) {
      const pack = activePack;
      const timer = setTimeout(() => {
        setBalance((current) => current + pack.coins);
        setActivePack(null);
        clearPaymentOutcome();
        cardForm.reset();
      }, 2200);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [paymentOutcome, activePack, clearPaymentOutcome, cardForm]);

  const totalLabel =
    clientSession?.totalAmount != null && clientSession.currencyCode
      ? formatCurrency(clientSession.totalAmount, clientSession.currencyCode)
      : '—';

  const showProcessing = (processing || cardForm.isSubmitting) && paymentOutcome == null;

  const dismissDialog = () => {
    if (showProcessing) return;
    if (paymentOutcome?.status === 'error') {
      clearPaymentOutcome();
    }
    setActivePack(null);
  };

  const dialogStyle = {
    opacity: popAnim,
    transform: [{ scale: popAnim.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) }],
  };

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.balanceRow}>
          <Text style={styles.balanceLabel}>Your balance</Text>
          <Text style={styles.balanceValue}>🪙 {balance.toLocaleString()}</Text>
        </View>

        <Text style={styles.heading}>Top up coins</Text>
        <View style={styles.grid}>
          {PACKS.map((pack) => (
            <TouchableOpacity key={pack.id} style={styles.pack} onPress={() => setActivePack(pack)}>
              {pack.tag != null && (
                <View style={styles.packTag}>
                  <Text style={styles.packTagText}>{pack.tag}</Text>
                </View>
              )}
              <Text style={styles.packIcon}>{pack.icon}</Text>
              <Text style={styles.packCoins}>{pack.coins.toLocaleString()}</Text>
              <Text style={styles.packUnit}>coins</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.demoNote}>Demo session covers one purchase — reopen to buy again.</Text>
      </ScrollView>

      <TouchableOpacity style={styles.exitLink} onPress={onClose}>
        <Text style={styles.exitLinkText}>Back to examples</Text>
      </TouchableOpacity>

      {/* Payment popup */}
      <Modal visible={activePack != null} transparent animationType="fade" onRequestClose={dismissDialog}>
        <KeyboardAvoidingView
          style={styles.backdrop}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Animated.View style={[styles.dialog, dialogStyle]}>
            {paymentOutcome?.status === 'success' && activePack != null ? (
              <View style={styles.outcomeBox}>
                <Text style={styles.outcomeEmoji}>✨</Text>
                <Text style={styles.outcomeTitle}>+{activePack.coins.toLocaleString()} coins!</Text>
                <Text style={styles.outcomeSubtitle}>Added to your balance</Text>
              </View>
            ) : paymentOutcome?.status === 'error' ? (
              <View style={styles.outcomeBox}>
                <Text style={styles.outcomeEmoji}>⚠️</Text>
                <Text style={styles.outcomeTitle}>Payment failed</Text>
                <Text style={styles.outcomeSubtitle}>{paymentOutcome.error.description}</Text>
                <TouchableOpacity
                  style={styles.payButton}
                  onPress={() => {
                    setProcessing(true);
                    void retry();
                  }}
                >
                  <Text style={styles.payButtonText}>Try again</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelButton} onPress={dismissDialog}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            ) : showProcessing ? (
              <View style={styles.outcomeBox}>
                <ActivityIndicator color={COLORS.accent} size="large" />
                <Text style={styles.outcomeTitle}>Processing payment…</Text>
                <Text style={styles.outcomeSubtitle}>Hold tight</Text>
              </View>
            ) : (
              <>
                <Text style={styles.dialogTitle}>
                  {activePack?.icon} {activePack?.coins.toLocaleString()} coins
                </Text>
                <Text style={styles.dialogPrice}>{totalLabel}</Text>

                {/* Compact form: labels off, placeholders on. */}
                {!isReady || activeMethod == null ? (
                  <ActivityIndicator color={COLORS.accent} style={styles.dialogSpinner} />
                ) : (
                  <View style={styles.dialogForm}>
                    <PrimerCardNumberInput showLabel={false} placeholder="Card number" />
                    <View style={styles.fieldRow}>
                      <View style={styles.flexField}>
                        <PrimerExpiryDateInput showLabel={false} placeholder="MM/YY" />
                      </View>
                      <View style={styles.flexField}>
                        <PrimerCVVInput showLabel={false} placeholder="CVV" />
                      </View>
                    </View>
                    <PrimerCardholderNameInput showLabel={false} placeholder="Name on card" />
                  </View>
                )}

                <TouchableOpacity
                  style={[styles.payButton, !cardForm.isValid && styles.payButtonDisabled]}
                  disabled={!cardForm.isValid}
                  onPress={() => {
                    setProcessing(true);
                    void cardForm.submit();
                  }}
                >
                  <Text style={styles.payButtonText}>Pay {totalLabel}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelButton} onPress={dismissDialog}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
              </>
            )}
          </Animated.View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.65)',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  balanceLabel: {
    color: COLORS.textDim,
    fontSize: 14,
  },
  balanceRow: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  balanceValue: {
    color: COLORS.yellow,
    fontSize: 18,
    fontWeight: '700',
  },
  cancelButton: {
    alignItems: 'center',
    padding: 10,
  },
  cancelText: {
    color: COLORS.textDim,
    fontSize: 14,
  },
  demoNote: {
    color: COLORS.textDim,
    fontSize: 12,
    marginTop: 16,
    textAlign: 'center',
  },
  dialog: {
    alignSelf: 'stretch',
    backgroundColor: COLORS.dialog,
    borderColor: COLORS.surface,
    borderRadius: 20,
    borderWidth: 1,
    gap: 12,
    padding: 20,
  },
  dialogForm: {
    backgroundColor: '#fff',
    borderRadius: 12,
    gap: 10,
    padding: 12,
  },
  dialogPrice: {
    color: COLORS.accent,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
  },
  dialogSpinner: {
    padding: 20,
  },
  dialogTitle: {
    color: COLORS.textLight,
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
  exitLink: {
    alignItems: 'center',
    padding: 16,
  },
  exitLinkText: {
    color: COLORS.textDim,
    fontSize: 14,
  },
  fieldRow: {
    flexDirection: 'row',
    gap: 10,
  },
  flexField: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  heading: {
    color: COLORS.textLight,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 16,
    marginTop: 24,
  },
  outcomeBox: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  outcomeEmoji: {
    fontSize: 44,
  },
  outcomeSubtitle: {
    color: COLORS.textDim,
    fontSize: 14,
    textAlign: 'center',
  },
  outcomeTitle: {
    color: COLORS.textLight,
    fontSize: 20,
    fontWeight: '800',
  },
  pack: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderColor: 'rgba(34,211,238,0.25)',
    borderRadius: 16,
    borderWidth: 1,
    flexBasis: '47%',
    flexGrow: 1,
    padding: 20,
  },
  packCoins: {
    color: COLORS.textLight,
    fontSize: 22,
    fontWeight: '800',
  },
  packIcon: {
    fontSize: 34,
    marginBottom: 8,
  },
  packTag: {
    backgroundColor: COLORS.magenta,
    borderRadius: 8,
    marginBottom: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  packTagText: {
    color: COLORS.background,
    fontSize: 11,
    fontWeight: '700',
  },
  packUnit: {
    color: COLORS.textDim,
    fontSize: 12,
  },
  payButton: {
    alignItems: 'center',
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    marginTop: 4,
    padding: 14,
  },
  payButtonDisabled: {
    opacity: 0.35,
  },
  payButtonText: {
    color: COLORS.background,
    fontSize: 15,
    fontWeight: '800',
  },
  root: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
});
