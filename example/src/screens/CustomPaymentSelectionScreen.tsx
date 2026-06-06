import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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
  PrimerSuccessScreen,
  PrimerErrorScreen,
  usePrimerCheckout,
  usePrimerCardForm,
  usePrimerPaymentMethods,
  usePrimerLocalization,
} from '@primer-io/react-native';
import type { PaymentMethodItem } from '@primer-io/react-native';

import { buildCheckoutComponentsSettings } from './checkoutComponentsSettings';

// RN port of the iOS Debug App's "Custom Payment Selection" demo: the merchant
// owns the whole screen (product info, rewards, billing, promo code, totals)
// and composes Primer pieces into it — the dynamic payment method list, the
// inline card form, and the submit/outcome flow. No PrimerCheckoutSheet.
//
// APM rows are display + selection only for now: RN Checkout Components can't
// launch non-card flows yet, so paying with an APM shows an explanatory alert.

const COLORS = {
  background: '#FEF5EC',
  border: '#E5E7EB',
  card: '#FFFFFF',
  primary: '#F97316',
  primaryBackground: '#FFF7ED',
  primaryLight: '#FDBA74',
  success: '#22C55E',
  textPrimary: '#1F2937',
  textSecondary: '#6B7280',
};

const COUNTRIES = [
  { code: 'RS', name: 'Serbia', flag: '🇷🇸' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
];

type SelectedOption = { kind: 'apm'; method: PaymentMethodItem } | { kind: 'card' } | null;

const settings = buildCheckoutComponentsSettings();

// Orange accents for the SDK-rendered card fields, matching the iOS demo theme.
const demoTheme = {
  light: {
    colors: {
      primary: COLORS.primary,
      borderFocused: COLORS.primary,
    },
  },
};

type CustomPaymentSelectionRouteProp = RouteProp<
  { CustomPaymentSelection: { clientToken: string } },
  'CustomPaymentSelection'
>;

export function CustomPaymentSelectionScreen({
  navigation,
}: {
  navigation: { goBack: () => void };
}) {
  const { clientToken } = useRoute<CustomPaymentSelectionRouteProp>().params;

  return (
    <PrimerCheckoutProvider
      clientToken={clientToken}
      settings={settings}
      theme={demoTheme}
      onCheckoutComplete={(data) => console.log('Checkout complete:', data)}
      onError={(error) => Alert.alert('Checkout Error', error.errorId ?? 'Unknown error')}
    >
      <PrimerCardFormProvider>
        <CustomPaymentSelectionContent onDone={() => navigation.goBack()} />
      </PrimerCardFormProvider>
    </PrimerCheckoutProvider>
  );
}

function CustomPaymentSelectionContent({ onDone }: { onDone: () => void }) {
  const { isReady, activeMethod, setActiveMethod, paymentOutcome, retry, clearPaymentOutcome, clientSession } =
    usePrimerCheckout();
  const cardForm = usePrimerCardForm();
  const { paymentMethods, isLoading: methodsLoading } = usePrimerPaymentMethods({ exclude: ['PAYMENT_CARD'] });
  const { formatCurrency } = usePrimerLocalization();

  const [selected, setSelected] = useState<SelectedOption>(null);
  const [billingCountry, setBillingCountry] = useState('RS');
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  // Mirrors the drop-in's processing pattern: flag flips on when a submit/retry is
  // initiated and off when the outcome lands. `isSubmitting` alone misses the
  // post-tokenize window and provider-level retries.
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (paymentOutcome != null) {
      setProcessing(false);
    }
  }, [paymentOutcome]);

  // The card form is always visible, so the card method must be active for typing
  // to reach the native RawDataManager (same as the Tier-3 demo).
  useEffect(() => {
    if (isReady && activeMethod == null) {
      setActiveMethod('PAYMENT_CARD');
    }
  }, [isReady, activeMethod, setActiveMethod]);

  // Auto-select card once the user starts typing in the form (mirrors iOS).
  const hasCardInput =
    cardForm.cardNumber.length > 0 ||
    cardForm.expiryDate.length > 0 ||
    cardForm.cvv.length > 0 ||
    cardForm.cardholderName.length > 0;
  useEffect(() => {
    if (hasCardInput) {
      setSelected((prev) => (prev == null ? { kind: 'card' } : prev));
    }
  }, [hasCardInput]);

  if (paymentOutcome?.status === 'success') {
    return <PrimerSuccessScreen onDismiss={onDone} autoDismissMs={3000} />;
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
  const country = COUNTRIES.find((c) => c.code === billingCountry);
  const totalLabel =
    clientSession?.totalAmount != null && clientSession.currencyCode
      ? formatCurrency(clientSession.totalAmount, clientSession.currencyCode)
      : '—';

  const cardSelected = selected?.kind === 'card';
  const payEnabled = selected != null && (selected.kind === 'apm' || cardForm.isValid);
  const payTitle =
    selected == null
      ? 'Select payment method'
      : selected.kind === 'apm'
        ? `Pay with ${selected.method.name}`
        : `Pay ${totalLabel}`;

  const handlePay = () => {
    if (selected == null) return;
    if (selected.kind === 'apm') {
      Alert.alert(
        selected.method.name,
        'APM flows are not wired in RN Checkout Components yet — this demo lists them, but only card payments are live.'
      );
      return;
    }
    setProcessing(true);
    void cardForm.submit();
  };

  const selectCard = () => setSelected((prev) => (prev?.kind === 'card' ? prev : { kind: 'card' }));

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Product info */}
        <View style={styles.cardBox}>
          <Text style={styles.countryHeader}>
            {country ? `${country.flag} ${country.name}` : 'Select a country'}
          </Text>
          <View style={styles.divider} />
          <View style={styles.productRow}>
            <View style={styles.productIcon}>
              <Text style={styles.productIconGlyph}>📡</Text>
            </View>
            <Text style={styles.productTitle}>Mobile Data Package</Text>
          </View>
          <DetailRow icon="🌍" label="Coverage" value={country?.name ?? 'Not selected'} />
          <DetailRow icon="↕️" label="Data" value="1 GB" />
          <DetailRow icon="📅" label="Validity" value="3 Days" />
        </View>

        {/* Rewards banner */}
        <View style={styles.rewardsBanner}>
          <Text style={styles.rewardsIcon}>🎁</Text>
          <View>
            <Text style={styles.rewardsText}>You'll earn rewards from this purchase:</Text>
            <Text style={styles.rewardsAmount}>$0.28 USD</Text>
          </View>
        </View>

        {/* Billing info */}
        <Text style={styles.sectionLabel}>Billing info</Text>
        <TouchableOpacity style={styles.optionRow} onPress={() => setShowCountryPicker(true)}>
          <Text style={styles.optionTitle}>
            {country ? `${country.flag} ${country.name}` : 'Select billing country'}
          </Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        {/* Payment methods */}
        <Text style={styles.sectionLabel}>Pay with</Text>
        {methodsLoading ? (
          <ActivityIndicator color={COLORS.primary} style={styles.methodsSpinner} />
        ) : paymentMethods.length === 0 ? (
          <Text style={styles.emptyMethods}>No alternative payment methods available</Text>
        ) : (
          paymentMethods.map((method) => {
            const isSelected = selected?.kind === 'apm' && selected.method.type === method.type;
            return (
              <TouchableOpacity
                key={method.type}
                style={[styles.optionRow, isSelected && styles.optionRowSelected]}
                onPress={() => setSelected({ kind: 'apm', method })}
              >
                {method.logo ? (
                  <Image source={{ uri: method.logo }} style={styles.methodLogo} resizeMode="contain" />
                ) : (
                  <Text style={styles.methodLogoFallback}>💳</Text>
                )}
                <Text style={styles.optionTitle}>{method.name}</Text>
                {isSelected && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
            );
          })
        )}

        {/* Card */}
        <Text style={styles.sectionLabel}>Pay with card</Text>
        <TouchableOpacity
          style={[styles.optionRow, cardSelected && styles.optionRowSelected]}
          onPress={selectCard}
        >
          <Text style={styles.methodLogoFallback}>💳</Text>
          <Text style={styles.optionTitle}>Credit or Debit Card</Text>
          {cardSelected && <Text style={styles.checkmark}>✓</Text>}
        </TouchableOpacity>

        {/* Always-visible inline card form */}
        <View style={styles.cardFormBox} onTouchStart={selectCard}>
          {!isReady || activeMethod == null ? (
            <ActivityIndicator color={COLORS.primary} style={styles.methodsSpinner} />
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

        {/* Promo code */}
        <Text style={styles.sectionLabel}>Promo code</Text>
        {appliedPromo ? (
          <View style={styles.optionRow}>
            <Text style={styles.promoApplied}>✓</Text>
            <Text style={styles.optionTitle}>{appliedPromo}</Text>
            <TouchableOpacity onPress={() => setAppliedPromo(null)}>
              <Text style={styles.promoClear}>✕</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.optionRow} onPress={() => setShowPromoModal(true)}>
            <Text style={styles.optionTitle}>Use promo code</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalLabel}>{totalLabel}</Text>
        </View>
        <TouchableOpacity
          style={[styles.payButton, !payEnabled && styles.payButtonDisabled]}
          onPress={handlePay}
          disabled={!payEnabled}
        >
          {selected?.kind === 'apm' && selected.method.logo != null && (
            <Image source={{ uri: selected.method.logo }} style={styles.payButtonLogo} resizeMode="contain" />
          )}
          <Text style={styles.payButtonText}>{payTitle}</Text>
        </TouchableOpacity>
      </View>

      {/* Processing overlay */}
      {showProcessing && (
        <View style={styles.processingOverlay}>
          <View style={styles.processingCard}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.processingText}>Processing payment...</Text>
          </View>
        </View>
      )}

      <CountryPickerModal
        visible={showCountryPicker}
        onSelect={(code) => {
          setBillingCountry(code);
          setShowCountryPicker(false);
        }}
        onClose={() => setShowCountryPicker(false)}
      />
      <PromoCodeModal
        visible={showPromoModal}
        onApply={(code) => {
          setAppliedPromo(code);
          setShowPromoModal(false);
        }}
        onClose={() => setShowPromoModal(false)}
      />
    </View>
  );
}

function DetailRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailIcon}>{icon}</Text>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function CountryPickerModal({
  visible,
  onSelect,
  onClose,
}: {
  visible: boolean;
  onSelect: (code: string) => void;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Billing country</Text>
          {COUNTRIES.map((c) => (
            <TouchableOpacity key={c.code} style={styles.modalRow} onPress={() => onSelect(c.code)}>
              <Text style={styles.optionTitle}>
                {c.flag} {c.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

function PromoCodeModal({
  visible,
  onApply,
  onClose,
}: {
  visible: boolean;
  onApply: (code: string) => void;
  onClose: () => void;
}) {
  const [code, setCode] = useState('');

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Promo Code</Text>
          <Text style={styles.modalSubtitle}>
            Enter your promo code below to apply a discount to your order.
          </Text>
          <TextInput
            style={styles.promoInput}
            value={code}
            onChangeText={setCode}
            placeholder="Enter promo code"
            placeholderTextColor={COLORS.textSecondary}
            autoCapitalize="characters"
            autoCorrect={false}
            autoFocus
          />
          <TouchableOpacity
            style={[styles.payButton, code.length === 0 && styles.payButtonDisabled]}
            disabled={code.length === 0}
            onPress={() => {
              onApply(code);
              setCode('');
            }}
          >
            <Text style={styles.payButtonText}>Apply Code</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalCancel} onPress={onClose}>
            <Text style={styles.modalCancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  cardBox: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
  },
  cardFormBox: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    gap: 12,
    padding: 16,
  },
  checkmark: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: '700',
  },
  chevron: {
    color: COLORS.textSecondary,
    fontSize: 20,
  },
  countryHeader: {
    color: COLORS.textSecondary,
    fontSize: 14,
    paddingVertical: 8,
  },
  detailIcon: {
    fontSize: 14,
    width: 24,
  },
  detailLabel: {
    color: COLORS.textSecondary,
    flex: 1,
    fontSize: 14,
  },
  detailRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 8,
  },
  detailValue: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '500',
  },
  divider: {
    backgroundColor: COLORS.border,
    height: 1,
    marginBottom: 12,
  },
  emptyMethods: {
    color: COLORS.textSecondary,
    fontSize: 12,
    padding: 12,
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
    gap: 12,
    padding: 16,
  },
  methodLogo: {
    height: 32,
    width: 32,
  },
  methodLogoFallback: {
    fontSize: 20,
    width: 32,
  },
  methodsSpinner: {
    padding: 16,
  },
  modalBackdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  modalCancel: {
    alignItems: 'center',
    padding: 8,
  },
  modalCancelText: {
    color: COLORS.textSecondary,
    fontSize: 15,
  },
  modalCard: {
    alignSelf: 'stretch',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    gap: 12,
    padding: 20,
  },
  modalRow: {
    borderBottomColor: COLORS.border,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 12,
  },
  modalSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  modalTitle: {
    color: COLORS.textPrimary,
    fontSize: 17,
    fontWeight: '600',
  },
  optionRow: {
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
    padding: 16,
  },
  optionRowSelected: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  optionTitle: {
    color: COLORS.textPrimary,
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  payButton: {
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    padding: 16,
  },
  payButtonDisabled: {
    backgroundColor: COLORS.primaryLight,
  },
  payButtonLogo: {
    height: 24,
    width: 24,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  processingCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(31,41,55,0.9)',
    borderRadius: 16,
    gap: 16,
    padding: 32,
  },
  processingOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  processingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  productIcon: {
    alignItems: 'center',
    backgroundColor: COLORS.primaryBackground,
    borderRadius: 8,
    height: 50,
    justifyContent: 'center',
    width: 50,
  },
  productIconGlyph: {
    fontSize: 22,
  },
  productRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  productTitle: {
    color: COLORS.textPrimary,
    fontSize: 17,
    fontWeight: '600',
  },
  promoApplied: {
    color: COLORS.success,
    fontSize: 16,
    fontWeight: '700',
  },
  promoClear: {
    color: COLORS.textSecondary,
    fontSize: 16,
    padding: 4,
  },
  promoInput: {
    borderColor: COLORS.border,
    borderRadius: 12,
    borderWidth: 1,
    color: COLORS.textPrimary,
    fontSize: 15,
    padding: 12,
  },
  rewardsAmount: {
    color: COLORS.textPrimary,
    fontSize: 14,
    fontWeight: '600',
  },
  rewardsBanner: {
    alignItems: 'center',
    backgroundColor: COLORS.primaryBackground,
    borderRadius: 16,
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    padding: 16,
  },
  rewardsIcon: {
    fontSize: 24,
  },
  rewardsText: {
    color: COLORS.textPrimary,
    fontSize: 14,
  },
  root: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  sectionLabel: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginBottom: 8,
    marginTop: 16,
  },
  totalLabel: {
    color: COLORS.textPrimary,
    fontSize: 17,
    fontWeight: '700',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
