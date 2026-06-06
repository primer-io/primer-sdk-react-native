import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type { KeyboardTypeOptions } from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';

import {
  PrimerCheckoutProvider,
  PrimerCardFormProvider,
  usePrimerCheckout,
  usePrimerCardForm,
  usePrimerCardNetwork,
  usePrimerCardNetworkSelection,
  usePrimerLocalization,
} from '@primer-io/react-native';
import type { PrimerSettings } from '@primer-io/react-native';

import { appPaymentParameters } from '../models/IClientSessionRequestBody';
import { getPaymentHandlingStringVal } from '../network/Environment';
import { customAppearanceMode } from './SettingsScreen';

// Showcase: pure Tier 4. Not a single Primer component renders on this screen —
// every input, button, and status view is the merchant's own. The SDK provides
// only hooks: usePrimerCardForm (values, auto-formatting updaters, network-aware
// maxLength & CVV label, per-field errors, submit), usePrimerCardNetwork, and
// usePrimerCardNetworkSelection — with bring-your-own inputs there's no built-in
// network selector, so even the co-badge picker is merchant-rendered here
// (try the CB/Visa test PAN 4035 5010 0000 0008).
//
// This is the SAQ-D-iest tier: raw card values live in merchant JS state.

const COLORS = {
  accent: '#FF2E88',
  background: '#FFE65C',
  black: '#111111',
  card: '#FFFFFF',
  error: '#DC2626',
  placeholder: '#9C9C8A',
  success: '#16A34A',
};

const settings: PrimerSettings = {
  paymentHandling: getPaymentHandlingStringVal(appPaymentParameters.paymentHandling),
  paymentMethodOptions: { iOS: { urlScheme: 'merchant://primer.io' } },
  uiOptions: { appearanceMode: customAppearanceMode },
  debugOptions: { is3DSSanityCheckEnabled: false },
  clientSessionCachingEnabled: true,
  apiVersion: '2.4',
};

type HooksOnlyRouteProp = RouteProp<{ HooksOnly: { clientToken: string } }, 'HooksOnly'>;

export function HooksOnlyScreen({ navigation }: { navigation: { goBack: () => void } }) {
  const { clientToken } = useRoute<HooksOnlyRouteProp>().params;

  return (
    <PrimerCheckoutProvider
      clientToken={clientToken}
      settings={settings}
      onCheckoutComplete={(data) => console.log('Checkout complete:', data)}
      onError={(error) => Alert.alert('Checkout Error', error.errorId ?? 'Unknown error')}
    >
      <PrimerCardFormProvider>
        <HooksOnlyFlow onDone={() => navigation.goBack()} />
      </PrimerCardFormProvider>
    </PrimerCheckoutProvider>
  );
}

function HooksOnlyFlow({ onDone }: { onDone: () => void }) {
  const { isReady, activeMethod, setActiveMethod, paymentOutcome, retry, clearPaymentOutcome, clientSession } =
    usePrimerCheckout();
  const cardForm = usePrimerCardForm();
  const { network } = usePrimerCardNetwork();
  const { availableNetworks, displayedIdentifier, isSelectorVisible, isDualBadge, selectNetwork } =
    usePrimerCardNetworkSelection();
  const { formatCurrency } = usePrimerLocalization();

  // Mirrors the drop-in's processing pattern: on while a submit/retry is in
  // flight, off when the outcome lands (covers the post-tokenize window too).
  const [processing, setProcessing] = useState(false);

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

  const totalLabel =
    clientSession?.totalAmount != null && clientSession.currencyCode
      ? formatCurrency(clientSession.totalAmount, clientSession.currencyCode)
      : '—';

  // Merchant-built success view — no PrimerSuccessScreen here.
  if (paymentOutcome?.status === 'success') {
    return (
      <View style={styles.outcomeRoot}>
        <BrutalBlock>
          <Text style={[styles.outcomeMark, { color: COLORS.success }]}>✓</Text>
          <Text style={styles.outcomeTitle}>PAID</Text>
          <Text style={styles.outcomeSub}>{totalLabel} · payment complete</Text>
          <BrutalButton label="DONE" onPress={onDone} />
        </BrutalBlock>
      </View>
    );
  }

  // Merchant-built error view — no PrimerErrorScreen here.
  if (paymentOutcome?.status === 'error') {
    return (
      <View style={styles.outcomeRoot}>
        <BrutalBlock>
          <Text style={[styles.outcomeMark, { color: COLORS.error }]}>✗</Text>
          <Text style={styles.outcomeTitle}>DECLINED</Text>
          <Text style={styles.outcomeSub}>{paymentOutcome.error.description}</Text>
          <BrutalButton
            label="TRY AGAIN"
            onPress={() => {
              setProcessing(true);
              void retry();
            }}
          />
          <TouchableOpacity onPress={() => clearPaymentOutcome()}>
            <Text style={styles.outcomeLink}>EDIT CARD DETAILS</Text>
          </TouchableOpacity>
        </BrutalBlock>
      </View>
    );
  }

  const showProcessing = (processing || cardForm.isSubmitting) && paymentOutcome == null;

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>PAY WITH CARD</Text>
        <Text style={styles.subheading}>
          Zero Primer components on this screen — plain TextInputs wired to usePrimerCardForm.
        </Text>

        {!isReady || activeMethod == null ? (
          <ActivityIndicator color={COLORS.black} size="large" style={styles.spinner} />
        ) : (
          <>
            <View style={styles.labelRow}>
              <Text style={styles.fieldLabel}>CARD NUMBER</Text>
              <View style={styles.networkChip}>
                <Text style={styles.networkChipText}>{network ?? 'CARD'}</Text>
              </View>
            </View>
            <BrutalField
              error={cardForm.errors.cardNumber}
              onFocusField={() => cardForm.markFieldFocused('cardNumber')}
              onBlurField={() => cardForm.markFieldBlurred('cardNumber')}
              value={cardForm.cardNumber}
              onChangeText={cardForm.updateCardNumber}
              placeholder="4242 4242 4242 4242"
              keyboardType="number-pad"
              maxLength={cardForm.cardNumberMaxLength}
            />

            {/* Custom co-badge picker — merchant-rendered, no built-in selector to clash with */}
            {isSelectorVisible && (
              <View style={styles.networkPickerBlock}>
                <Text style={styles.fieldLabel}>PAY WITH</Text>
                <View style={styles.networkPickerRow}>
                  {availableNetworks.map((option) => {
                    const active = option.identifier === displayedIdentifier;
                    return (
                      <TouchableOpacity
                        key={option.identifier}
                        style={[styles.networkOption, active && styles.networkOptionActive]}
                        onPress={() => {
                          selectNetwork(option.identifier).catch((err) =>
                            console.warn('[HooksOnly] network select failed', err)
                          );
                        }}
                      >
                        <Text style={[styles.networkOptionText, active && styles.networkOptionTextActive]}>
                          {option.displayName.toUpperCase()}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}
            {isDualBadge && (
              <Text style={styles.dualBadgeNote}>
                {availableNetworks.map((option) => option.displayName.toUpperCase()).join(' · ')} — ROUTED BY
                ISSUER
              </Text>
            )}

            <View style={styles.fieldRow}>
              <View style={styles.flexField}>
                <Text style={styles.fieldLabel}>EXPIRY</Text>
                <BrutalField
                  error={cardForm.errors.expiryDate}
                  onFocusField={() => cardForm.markFieldFocused('expiryDate')}
                  onBlurField={() => cardForm.markFieldBlurred('expiryDate')}
                  value={cardForm.expiryDate}
                  onChangeText={cardForm.updateExpiryDate}
                  placeholder="MM/YY"
                  keyboardType="number-pad"
                  maxLength={5}
                />
              </View>
              <View style={styles.flexField}>
                {/* Network-aware label: CVV / CVC / CID comes from the hook */}
                <Text style={styles.fieldLabel}>{cardForm.descriptor.cvvLabel.toUpperCase()}</Text>
                <BrutalField
                  error={cardForm.errors.cvv}
                  onFocusField={() => cardForm.markFieldFocused('cvv')}
                  onBlurField={() => cardForm.markFieldBlurred('cvv')}
                  value={cardForm.cvv}
                  onChangeText={cardForm.updateCVV}
                  placeholder="123"
                  keyboardType="number-pad"
                  maxLength={4}
                  secureTextEntry
                />
              </View>
            </View>

            {cardForm.isCardholderNameVisible && (
              <>
                <Text style={styles.fieldLabel}>NAME ON CARD</Text>
                <BrutalField
                  error={cardForm.errors.cardholderName}
                  onFocusField={() => cardForm.markFieldFocused('cardholderName')}
                  onBlurField={() => cardForm.markFieldBlurred('cardholderName')}
                  value={cardForm.cardholderName}
                  onChangeText={cardForm.updateCardholderName}
                  placeholder="JOHN SMITH"
                  autoCapitalize="characters"
                />
              </>
            )}

            <BrutalButton
              label={`PAY ${totalLabel}`}
              disabled={!cardForm.isValid || showProcessing}
              onPress={() => {
                setProcessing(true);
                void cardForm.submit();
              }}
            />

            <Text style={styles.footnote}>
              FORMATTING · VALIDATION · NETWORK DETECTION · CO-BADGE — ALL FROM THE HOOKS
              {'\n'}CO-BADGE TEST PAN: 4035 5010 0000 0008
            </Text>
          </>
        )}
      </ScrollView>

      {/* Merchant-built processing overlay */}
      {showProcessing && (
        <View style={styles.processingOverlay}>
          <View style={styles.processingCard}>
            <ActivityIndicator color={COLORS.black} size="large" />
            <Text style={styles.processingText}>PROCESSING…</Text>
          </View>
        </View>
      )}
    </View>
  );
}

function BrutalField({
  error,
  onFocusField,
  onBlurField,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  maxLength,
  secureTextEntry,
  autoCapitalize,
}: {
  error?: string;
  onFocusField: () => void;
  onBlurField: () => void;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  keyboardType?: KeyboardTypeOptions;
  maxLength?: number;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.fieldBlock}>
      <TextInput
        style={[styles.input, focused && styles.inputFocused, error != null && styles.inputError]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.placeholder}
        keyboardType={keyboardType}
        maxLength={maxLength}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize ?? 'none'}
        autoCorrect={false}
        onFocus={() => {
          setFocused(true);
          onFocusField();
        }}
        onBlur={() => {
          setFocused(false);
          onBlurField();
        }}
      />
      {error != null && <Text style={styles.errorText}>{error.toUpperCase()}</Text>}
    </View>
  );
}

function BrutalButton({
  label,
  disabled,
  onPress,
}: {
  label: string;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <View style={styles.shadowWrap}>
      <View style={styles.shadowBlock} />
      <TouchableOpacity
        style={[styles.payButton, disabled === true && styles.payButtonDisabled]}
        disabled={disabled}
        onPress={onPress}
      >
        <Text style={styles.payText}>{label}</Text>
      </TouchableOpacity>
    </View>
  );
}

function BrutalBlock({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.shadowWrap}>
      <View style={styles.shadowBlock} />
      <View style={styles.outcomeCard}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  dualBadgeNote: {
    color: COLORS.black,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 14,
    opacity: 0.6,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: 4,
  },
  fieldBlock: {
    marginBottom: 14,
  },
  fieldLabel: {
    color: COLORS.black,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 6,
  },
  fieldRow: {
    flexDirection: 'row',
    gap: 14,
  },
  flexField: {
    flex: 1,
  },
  footnote: {
    color: COLORS.black,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 20,
    opacity: 0.55,
    textAlign: 'center',
  },
  heading: {
    color: COLORS.black,
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  input: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.black,
    borderRadius: 0,
    borderWidth: 3,
    color: COLORS.black,
    fontSize: 16,
    fontWeight: '700',
    padding: 14,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  inputFocused: {
    borderColor: COLORS.accent,
  },
  labelRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  networkChip: {
    backgroundColor: COLORS.black,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  networkOption: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.black,
    borderWidth: 3,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  networkOptionActive: {
    backgroundColor: COLORS.black,
  },
  networkOptionText: {
    color: COLORS.black,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
  },
  networkOptionTextActive: {
    color: COLORS.background,
  },
  networkPickerBlock: {
    marginBottom: 14,
  },
  networkPickerRow: {
    flexDirection: 'row',
    gap: 10,
  },
  networkChipText: {
    color: COLORS.background,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  outcomeCard: {
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderColor: COLORS.black,
    borderWidth: 3,
    gap: 10,
    padding: 28,
  },
  outcomeLink: {
    color: COLORS.black,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
    marginTop: 8,
    textDecorationLine: 'underline',
  },
  outcomeMark: {
    fontSize: 56,
    fontWeight: '900',
  },
  outcomeRoot: {
    backgroundColor: COLORS.background,
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  outcomeSub: {
    color: COLORS.black,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  outcomeTitle: {
    color: COLORS.black,
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 2,
  },
  payButton: {
    alignItems: 'center',
    backgroundColor: COLORS.black,
    borderColor: COLORS.black,
    borderWidth: 3,
    padding: 16,
  },
  payButtonDisabled: {
    opacity: 0.4,
  },
  payText: {
    color: COLORS.card,
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  processingCard: {
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderColor: COLORS.black,
    borderWidth: 3,
    gap: 14,
    paddingHorizontal: 40,
    paddingVertical: 30,
  },
  processingOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(17,17,17,0.45)',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  processingText: {
    color: COLORS.black,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 2,
  },
  root: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  shadowBlock: {
    backgroundColor: COLORS.black,
    bottom: -5,
    left: 5,
    position: 'absolute',
    right: -5,
    top: 5,
  },
  shadowWrap: {
    marginTop: 10,
  },
  spinner: {
    marginTop: 40,
  },
  subheading: {
    color: COLORS.black,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 24,
    marginTop: 6,
    opacity: 0.7,
  },
});
