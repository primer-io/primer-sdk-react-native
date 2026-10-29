import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Easing,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';

// [PRIMER] What we use from the SDK
import {
  PrimerCardForm,
  PrimerCardFormProvider,
  PrimerCheckoutProvider,
  PrimerCheckoutSheet,
  usePrimerCardForm,
  usePrimerCheckout,
  usePrimerPaymentMethod,
  usePrimerPaymentMethods,
  usePrimerVaultManager,
} from '@primer-io/react-native';
import type {
  PaymentMethodItem,
  PrimerError,
  PrimerThemeOverride,
  UsePrimerVaultManagerReturn,
  VaultedPaymentMethodItem,
} from '@primer-io/react-native';

import { buildCheckoutComponentsSettings } from './checkoutComponentsSettings';

// Showcase: a betting app's deposit screen rebuilt on Checkout Components.
// The merchant owns the amount entry, the method rows and the terms gate; the SDK
// supplies the method list, the saved cards and the card form; the sheet is ours.
// Selecting "Debit Card" here goes straight to the form — no second method picker.

const COLORS = {
  purple: '#7B4BFF',
  purpleDim: '#C9B4FF',
  page: '#F2F2F2',
  surface: '#FAFAFA',
  white: '#FFFFFF',
  border: '#E4E4E7',
  textPrimary: '#1A1033',
  textSecondary: '#6B6880',
  textDisabled: '#A1A1AA',
  green: '#22C55E',
  danger: '#E5484D',
  disabledFill: '#E9E9EE',
};

// [PRIMER] One theme object skins every Primer component — one block per mode
const MERCHANT_THEME: PrimerThemeOverride = {
  light: {
    colors: {
      primary: COLORS.purple,
      borderFocused: COLORS.purple,
      background: COLORS.white,
      surface: COLORS.white,
      border: COLORS.border,
      textPrimary: COLORS.textPrimary,
      textSecondary: COLORS.textSecondary,
    },
    radii: { small: 10, medium: 12, large: 16 },
  },
};

const MIN_DEPOSIT = 5;
const QUICK_AMOUNTS = [10, 25, 50, 100, 200];
const SHEET_IN_MS = 260;
const SHEET_OUT_MS = 200;
const BANNER_MS = 4000;

// What this merchant puts on the deposit screen, in order. Whatever else the
// client session returns goes behind "More ways to pay".
const PRIMARY_METHOD_TYPES = ['APPLE_PAY', 'GOOGLE_PAY', 'PAYMENT_CARD', 'PAYPAL'];

const METHOD_LABELS: Record<string, string> = {
  APPLE_PAY: 'Apple Pay',
  GOOGLE_PAY: 'Google Pay',
  PAYMENT_CARD: 'Debit Card',
};

type SheetStep = 'conditions' | 'card';
type Selection = { kind: 'vault'; id: string } | { kind: 'method'; type: string } | null;

type MerchantExample1RouteProp = RouteProp<{ MerchantExample1: { clientToken: string } }, 'MerchantExample1'>;

export function MerchantExample1Screen() {
  const { clientToken } = useRoute<MerchantExample1RouteProp>().params;

  return (
    // [PRIMER] Wraps the flow. Every hook below reads from it.
    <PrimerCheckoutProvider
      clientToken={clientToken}
      // [PRIMER] Setup failures only arrive here — they never reach paymentOutcome
      onError={(error) => Alert.alert('Checkout error', error.description ?? error.errorId)}
      settings={buildCheckoutComponentsSettings()}
      theme={MERCHANT_THEME}
    >
      <DepositFlow />
    </PrimerCheckoutProvider>
  );
}

function DepositFlow() {
  const [checkoutSheetVisible, setCheckoutSheetVisible] = useState(false);

  return (
    <>
      {/* [PRIMER] Owns the card field state, so values survive the sheet closing */}
      <PrimerCardFormProvider>
        <DepositFunds onUsePrebuiltSheet={() => setCheckoutSheetVisible(true)} />
      </PrimerCardFormProvider>

      {/* [PRIMER] The prebuilt checkout sheet. Kept outside PrimerCardFormProvider —
          it mounts its own, and two of them would split the card state. */}
      <PrimerCheckoutSheet
        visible={checkoutSheetVisible}
        onRequestDismiss={() => setCheckoutSheetVisible(false)}
        onDismiss={() => setCheckoutSheetVisible(false)}
      />
    </>
  );
}

function DepositFunds({ onUsePrebuiltSheet }: { onUsePrebuiltSheet: () => void }) {
  // [PRIMER] Every method's outcome lands here. `error` is setup failure instead.
  const { paymentOutcome, error, clearPaymentOutcome } = usePrimerCheckout();
  // [PRIMER] The session's methods, already filtered to what this device can present
  const { paymentMethods, isLoading } = usePrimerPaymentMethods();
  // [PRIMER] Saved cards
  const vault = usePrimerVaultManager();
  const cardForm = usePrimerCardForm();

  const [amount, setAmount] = useState('10.00');
  const [selection, setSelection] = useState<Selection>(null);
  const [showExtras, setShowExtras] = useState(false);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [sheetStep, setSheetStep] = useState<SheetStep>('conditions');
  const [acknowledged, setAcknowledged] = useState(false);
  const [depositing, setDepositing] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  // Set while our own sheet slides away, so the prebuilt one opens as it unmounts.
  const openPrebuiltSheetRef = useRef(false);
  // Which path is in flight, so an error can be attributed to it.
  const attemptRef = useRef<'card' | 'vault' | 'native' | null>(null);
  const [cardNeedsRetry, setCardNeedsRetry] = useState(false);

  useEffect(() => {
    if (paymentOutcome == null) return;
    setDepositing(false);
    // Only a failed card attempt needs retry(); anything else must submit fresh.
    setCardNeedsRetry(paymentOutcome.status === 'error' && attemptRef.current === 'card');
    if (paymentOutcome.status !== 'error') cardForm.reset();
  }, [paymentOutcome, cardForm]);

  useEffect(() => {
    setBannerDismissed(false);
    if (paymentOutcome == null) return;
    const timer = setTimeout(() => setBannerDismissed(true), BANNER_MS);
    return () => clearTimeout(timer);
  }, [paymentOutcome]);

  const failure = paymentOutcome?.status === 'error' ? paymentOutcome.error : null;
  // A dismissed Apple Pay sheet comes back as an error; it is not a failed deposit.
  const cancelled = failure?.errorId === 'payment-cancelled';
  const showBanner = failure != null && !cancelled && !bannerDismissed;
  const showSuccess = paymentOutcome?.status === 'success' && !bannerDismissed;
  // Self-healing: a submit that never dispatched cannot hold the overlay up.
  const showDepositing = (depositing || cardForm.isSubmitting) && paymentOutcome == null;

  const selectedType = selection?.kind === 'method' ? selection.type : null;
  // [PRIMER] One hook for any payment method
  const method = usePrimerPaymentMethod(selectedType ?? 'PAYMENT_CARD');

  const primaryMethods = PRIMARY_METHOD_TYPES.map((type) =>
    paymentMethods.find((item) => item.type === type),
  ).filter((item): item is PaymentMethodItem => item != null);
  const extraMethods = paymentMethods.filter((item) => !PRIMARY_METHOD_TYPES.includes(item.type));
  const visibleMethods = showExtras ? [...primaryMethods, ...extraMethods] : primaryMethods;

  const depositAmount = Number.parseFloat(amount) || 0;
  const canDeposit = depositAmount >= MIN_DEPOSIT && selection != null;

  const openConditions = () => {
    openPrebuiltSheetRef.current = false;
    setAcknowledged(false);
    setSheetStep('conditions');
    setSheetVisible(true);
  };

  const handleCardPay = () => {
    attemptRef.current = 'card';
    clearPaymentOutcome();
    setSheetVisible(false);
    setDepositing(true);
  };

  const handleAgree = () => {
    if (selectedType === 'PAYMENT_CARD') {
      // [PRIMER] Arms the card form
      if (method.kind === 'card') method.start();
      setSheetStep('card');
      return;
    }

    if (selection?.kind === 'vault') {
      attemptRef.current = 'vault';
      setSheetVisible(false);
      clearPaymentOutcome();
      setDepositing(true);
      // [PRIMER] Pay with a saved card
      vault.payById(selection.id).catch(() => setDepositing(false));
      return;
    }
    if (method.kind === 'nativeUi') {
      // [PRIMER] Availability is per-device, and start() throws without it
      if (!method.isAvailable) {
        setSheetVisible(false);
        Alert.alert('Unavailable', 'That payment method is not available on this device.');
        return;
      }
      attemptRef.current = 'native';
      setSheetVisible(false);
      clearPaymentOutcome();
      setDepositing(true);
      // [PRIMER] Starts the method's own native flow — Apple Pay, PayPal, a redirect
      method.start().catch((startError: PrimerError) => {
        setDepositing(false);
        Alert.alert('Could not start payment', startError.description ?? startError.errorId);
      });
      return;
    }

    // [PRIMER] Hand the rest to the prebuilt sheet
    openPrebuiltSheetRef.current = true;
    setSheetVisible(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {showBanner && <OutcomeBanner tone="failure" title="Your deposit failed" body={failure?.description ?? 'Please contact customer service for support'} />}
      {showSuccess && <OutcomeBanner tone="success" title="Deposit complete" body={`${amount} added to your balance`} />}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <View style={styles.balanceBlock}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balanceValue}>£0.00</Text>
        </View>

        <Text style={styles.sectionLabel}>Amount</Text>
        <View style={styles.card}>
          <View style={styles.amountRow}>
            <Pressable
              style={styles.stepper}
              accessibilityRole="button"
              accessibilityLabel="Decrease amount"
              onPress={() => setAmount(Math.max(0, depositAmount - 5).toFixed(2))}
            >
              <Text style={styles.stepperGlyph}>–</Text>
            </Pressable>
            <View style={styles.amountInputWrap}>
              <Text style={styles.currency}>£</Text>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                accessibilityLabel="Deposit amount"
                selectTextOnFocus
              />
            </View>
            <Pressable
              style={styles.stepper}
              accessibilityRole="button"
              accessibilityLabel="Increase amount"
              onPress={() => setAmount((depositAmount + 5).toFixed(2))}
            >
              <Text style={styles.stepperGlyph}>+</Text>
            </Pressable>
          </View>
          <Text style={styles.minimum}>Minimum Deposit is £{MIN_DEPOSIT.toFixed(2)}</Text>
          <Text style={styles.link}>Set Deposit Limit</Text>

          <View style={styles.chipRow}>
            {QUICK_AMOUNTS.map((value) => {
              const active = value.toFixed(2) === depositAmount.toFixed(2);
              return (
                <Pressable
                  key={value}
                  style={[styles.chip, active && styles.chipActive]}
                  accessibilityRole="button"
                  onPress={() => setAmount(value.toFixed(2))}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>£{value}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Saved cards. To drop them: this block, SavedMethodRows, and the
            vault branch in handleAgree. */}
        {vault.vaultedMethods.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>Saved cards</Text>
            <SavedMethodRows vault={vault} selection={selection} onSelect={setSelection} />
          </>
        )}

        <Text style={styles.sectionLabel}>Select Method</Text>

        {error != null ? (
          // Setup failed, so isLoading never clears — say so instead of spinning forever.
          <Text style={styles.loadError}>{error.description ?? 'Could not load payment methods.'}</Text>
        ) : isLoading || vault.isLoading ? (
          <ActivityIndicator color={COLORS.purple} style={styles.spinner} />
        ) : (
          <>
            {visibleMethods.map((item) => (
              <MethodRow
                key={item.type}
                label={METHOD_LABELS[item.type] ?? item.name}
                logo={neutralLogo(item)}
                selected={selectedType === item.type}
                onPress={() => setSelection({ kind: 'method', type: item.type })}
              />
            ))}

            {extraMethods.length > 0 && !showExtras && (
              <Pressable
                style={styles.moreRow}
                accessibilityRole="button"
                onPress={() => setShowExtras(true)}
              >
                <Text style={styles.moreText}>More ways to pay</Text>
              </Pressable>
            )}
          </>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Cta label="Deposit" enabled={canDeposit} onPress={openConditions} />
      </View>

      <BottomSheet
        visible={sheetVisible}
        step={sheetStep}
        onClose={() => setSheetVisible(false)}
        onClosed={() => {
          if (!openPrebuiltSheetRef.current) return;
          openPrebuiltSheetRef.current = false;
          onUsePrebuiltSheet();
        }}
      >
        {(step) =>
          step === 'conditions' ? (
            <ConditionsContent
              acknowledged={acknowledged}
              onToggle={() => setAcknowledged((value) => !value)}
              onClose={() => setSheetVisible(false)}
              onAgree={handleAgree}
            />
          ) : (
            <CardContent
              amountLabel={`£${depositAmount.toFixed(2)}`}
              needsRetry={cardNeedsRetry}
              onPay={handleCardPay}
              onClose={() => setSheetVisible(false)}
            />
          )
        }
      </BottomSheet>

      {showDepositing && <DepositingOverlay />}
    </KeyboardAvoidingView>
  );
}

function Cta({
  label,
  enabled,
  onPress,
}: {
  label: string;
  enabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.cta,
        !enabled && styles.ctaDisabled,
        enabled && pressed && styles.ctaPressed,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled: !enabled }}
      disabled={!enabled}
      onPress={onPress}
    >
      <Text style={[styles.ctaText, !enabled && styles.ctaTextDisabled]}>{label}</Text>
    </Pressable>
  );
}

function DepositingOverlay() {
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 900,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [spin]);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={styles.depositingRoot} accessibilityRole="progressbar">
      <View style={styles.depositingCard}>
        <View style={styles.spinnerWrap}>
          <Animated.View style={[styles.spinnerArc, { transform: [{ rotate }] }]} />
          <Text style={styles.spinnerMark}>👌</Text>
        </View>
        <Text style={styles.depositingText}>Please Wait. Depositing…</Text>
      </View>
    </View>
  );
}

function SavedMethodRows({
  vault,
  selection,
  onSelect,
}: {
  vault: UsePrimerVaultManagerReturn;
  selection: Selection;
  onSelect: (selection: Selection) => void;
}) {
  const [showAll, setShowAll] = useState(false);
  const selectedId = selection?.kind === 'vault' ? selection.id : null;
  // This screen never calls selectVaultedMethodId, so activeMethod stays the SDK's
  // first saved method.
  const collapsedTo = vault.activeMethod;
  const rows = showAll || collapsedTo == null ? vault.vaultedMethods : [collapsedTo];
  const hidden = vault.vaultedMethods.length - rows.length;

  return (
    <>
      {rows.map((saved) => (
        <MethodRow
          key={saved.id}
          label={describeSavedMethod(saved)}
          logo={saved.iconUri}
          selected={selectedId === saved.id}
          onPress={() => onSelect({ kind: 'vault', id: saved.id })}
        />
      ))}
      {hidden > 0 && (
        <Pressable
          style={styles.moreRow}
          accessibilityRole="button"
          onPress={() => setShowAll(true)}
        >
          <Text style={styles.moreText}>Show all {vault.vaultedMethods.length} saved cards</Text>
        </Pressable>
      )}
    </>
  );
}

function describeSavedMethod(saved: VaultedPaymentMethodItem): string {
  if (saved.kind === 'card') {
    return `${saved.brandName ?? 'Card'} ••${saved.last4 ?? ''}`;
  }
  if (saved.kind === 'bank') {
    return `${saved.bankName ?? 'Bank account'} ••${saved.accountLast4 ?? ''}`;
  }
  return saved.displayName ?? 'Saved method';
}

// [PRIMER] Pick a logo that reads on a white row
function neutralLogo(item: PaymentMethodItem): string | undefined {
  const resource = item.resource;
  if (resource != null && resource.nativeViewName == null) {
    return resource.paymentMethodLogo.light ?? resource.paymentMethodLogo.dark ?? item.logo;
  }
  return item.logo;
}

function MethodRow({
  label,
  logo,
  selected,
  onPress,
}: {
  label: string;
  logo?: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={styles.methodRow}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={label}
      onPress={onPress}
    >
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected && <Text style={styles.radioCheck}>✓</Text>}
      </View>
      {logo != null ? (
        <Image source={{ uri: logo }} style={styles.methodLogo} resizeMode="contain" />
      ) : (
        <View style={styles.methodLogo} />
      )}
      <Text style={styles.methodLabel}>{label}</Text>
    </Pressable>
  );
}

const slideIn = (progress: Animated.Value) =>
  Animated.timing(progress, {
    toValue: 1,
    duration: SHEET_IN_MS,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: true,
  });

const slideOut = (progress: Animated.Value) =>
  Animated.timing(progress, {
    toValue: 0,
    duration: SHEET_OUT_MS,
    easing: Easing.in(Easing.cubic),
    useNativeDriver: true,
  });

// Advancing a step slides the current sheet out and the next one in, the way the
// a merchant's own app does. The Modal itself stays mounted across the swap — iOS will
// not present a new one while another is still dismissing.
function BottomSheet({
  visible,
  step,
  onClose,
  onClosed,
  children,
}: {
  visible: boolean;
  step: SheetStep;
  onClose: () => void;
  /** Fires when the exit animation finishes, batched with the Modal unmount. */
  onClosed?: () => void;
  children: (step: SheetStep) => React.ReactNode;
}) {
  const [mounted, setMounted] = useState(visible);
  const [renderedStep, setRenderedStep] = useState(step);
  const [sheetHeight, setSheetHeight] = useState(0);
  const progress = useRef(new Animated.Value(0)).current;
  // Latest values for the open effect, which must not re-run on a step change.
  const stepRef = useRef(step);
  const renderedStepRef = useRef(step);
  const onClosedRef = useRef(onClosed);
  stepRef.current = step;
  onClosedRef.current = onClosed;

  useEffect(() => {
    if (visible) {
      // Opening adopts the incoming step outright. Animating it as a transition
      // would slide up, straight back down, and up again.
      renderedStepRef.current = stepRef.current;
      setRenderedStep(stepRef.current);
      setMounted(true);
      slideIn(progress).start();
      return;
    }
    slideOut(progress).start(({ finished }) => {
      if (!finished) return;
      setMounted(false);
      onClosedRef.current?.();
    });
  }, [visible, progress]);

  useEffect(() => {
    if (!visible || step === renderedStepRef.current) return;
    slideOut(progress).start(({ finished }) => {
      if (!finished) return;
      renderedStepRef.current = step;
      setRenderedStep(step);
      slideIn(progress).start();
    });
  }, [step, renderedStep, visible, progress]);

  const translateY = useMemo(
    () =>
      progress.interpolate({
        inputRange: [0, 1],
        // Before the first measurement, start fully off-screen rather than at a
        // guess that could be shorter than the sheet.
        outputRange: [sheetHeight || Dimensions.get('window').height, 0],
      }),
    [progress, sheetHeight]
  );

  if (!mounted) return null;

  return (
    <Modal visible transparent animationType="none" statusBarTranslucent onRequestClose={onClose}>
      <View style={styles.sheetRoot}>
        <Animated.View style={[styles.backdrop, { opacity: progress }]}>
          <Pressable
            style={styles.backdropFill}
            accessibilityRole="button"
            accessibilityLabel="Dismiss"
            onPress={onClose}
          />
        </Animated.View>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <Animated.View
            style={[styles.sheet, { transform: [{ translateY }] }]}
            onLayout={(event) => setSheetHeight(event.nativeEvent.layout.height)}
          >
            {children(renderedStep)}
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

function SheetHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <View style={styles.sheetHeader}>
      <Text style={styles.sheetTitle}>{title}</Text>
      <Pressable onPress={onClose} hitSlop={12} accessibilityRole="button" accessibilityLabel="Close">
        <Text style={styles.sheetClose}>✕</Text>
      </Pressable>
    </View>
  );
}

function ConditionsContent({
  acknowledged,
  onToggle,
  onClose,
  onAgree,
}: {
  acknowledged: boolean;
  onToggle: () => void;
  onClose: () => void;
  onAgree: () => void;
}) {
  return (
    <>
      <SheetHeader title="Deposit Conditions" onClose={onClose} />

      <View style={styles.conditionsBody}>
        <Text style={styles.conditionsText}>
          Your deposited funds are held in a separate bank account that is segregated from our daily
          operational funds. This account maintains sufficient funds to cover customer balances and
          outstanding bets in the event of insolvency.
        </Text>
        <Pressable
          style={styles.ackRow}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: acknowledged }}
          onPress={onToggle}
        >
          <View style={[styles.radio, acknowledged && styles.radioSelected]}>
            {acknowledged && <Text style={styles.radioCheck}>✓</Text>}
          </View>
          <Text style={styles.ackText}>
            Yes, I acknowledge the above information and agree to the terms &amp; conditions
          </Text>
        </Pressable>
      </View>

      <Cta label="Agree & Continue" enabled={acknowledged} onPress={onAgree} />
    </>
  );
}

function CardContent({
  amountLabel,
  needsRetry,
  onPay,
  onClose,
}: {
  amountLabel: string;
  needsRetry: boolean;
  onPay: () => void;
  onClose: () => void;
}) {
  // [PRIMER] Card form state: validity and submit
  const cardForm = usePrimerCardForm();
  const { retry } = usePrimerCheckout();

  const canPay = cardForm.isValid && !cardForm.isSubmitting;

  // Both the button and the keyboard's return key come through here, so neither can
  // start a payment without closing the sheet and showing the overlay.
  const pay = () => {
    if (!canPay) return;
    onPay();
    // [PRIMER] Re-attempting a failed card needs retry(), not submit() — it rebuilds
    // the native manager, which submit() would reuse in a state that emits no outcome.
    const attempt = needsRetry ? retry() : cardForm.submit();
    attempt.catch((payError: PrimerError) =>
      Alert.alert('Could not take payment', payError.description ?? payError.errorId),
    );
  };

  return (
    <>
      <SheetHeader title="Card details" onClose={onClose} />

      {/* [PRIMER] Every card field in one component */}
      <PrimerCardForm autoFocus style={styles.cardForm} onSubmit={pay} />

      <Cta label={`Pay ${amountLabel}`} enabled={canPay} onPress={pay} />
    </>
  );
}

function OutcomeBanner({
  tone,
  title,
  body,
}: {
  tone: 'success' | 'failure';
  title: string;
  body: string;
}) {
  return (
    <View style={[styles.banner, tone === 'success' && styles.bannerSuccess]}>
      <Text style={styles.bannerTitle}>{title}</Text>
      <Text style={styles.bannerBody}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: COLORS.page, flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 24 },

  balanceBlock: { alignItems: 'center', backgroundColor: COLORS.surface, paddingVertical: 20 },
  balanceLabel: { color: COLORS.textPrimary, fontSize: 16 },
  balanceValue: { color: COLORS.textPrimary, fontSize: 34, fontWeight: '700' },

  sectionLabel: {
    color: COLORS.textSecondary,
    fontSize: 15,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },

  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    marginHorizontal: 20,
    paddingVertical: 18,
  },
  amountRow: { alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  stepper: {
    alignItems: 'center',
    backgroundColor: COLORS.page,
    borderRadius: 8,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  stepperGlyph: { color: COLORS.textPrimary, fontSize: 20, fontWeight: '600' },
  amountInputWrap: { alignItems: 'center', flexDirection: 'row', paddingHorizontal: 16 },
  currency: { color: COLORS.textPrimary, fontSize: 26, fontWeight: '700' },
  amountInput: {
    color: COLORS.textPrimary,
    fontSize: 30,
    fontWeight: '700',
    minWidth: 120,
    paddingLeft: 6,
    textAlign: 'center',
  },
  minimum: { color: COLORS.textSecondary, fontSize: 14, paddingTop: 6, textAlign: 'center' },
  link: { color: COLORS.purple, fontSize: 15, fontWeight: '600', paddingTop: 8, textAlign: 'center' },

  chipRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 14, paddingTop: 16 },
  chip: {
    alignItems: 'center',
    borderColor: COLORS.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    marginHorizontal: 3,
    paddingVertical: 10,
  },
  chipActive: { backgroundColor: COLORS.page, borderColor: COLORS.page },
  chipText: { color: COLORS.textPrimary, fontSize: 15 },
  chipTextActive: { color: COLORS.textDisabled },

  spinner: { paddingVertical: 24 },
  loadError: { color: COLORS.danger, fontSize: 15, paddingHorizontal: 20, paddingVertical: 12 },

  methodRow: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    flexDirection: 'row',
    marginBottom: 10,
    marginHorizontal: 20,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  radio: {
    alignItems: 'center',
    borderColor: COLORS.border,
    borderRadius: 12,
    borderWidth: 1.5,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  radioSelected: { backgroundColor: COLORS.green, borderColor: COLORS.green },
  radioCheck: { color: COLORS.white, fontSize: 13, fontWeight: '700' },
  methodLogo: { height: 24, marginLeft: 14, width: 40 },
  methodLabel: { color: COLORS.textPrimary, fontSize: 17, fontWeight: '600', marginLeft: 12 },

  moreRow: { paddingHorizontal: 20, paddingVertical: 6 },
  moreText: { color: COLORS.purple, fontSize: 15, fontWeight: '600' },

  footer: { backgroundColor: COLORS.page, paddingBottom: 28, paddingHorizontal: 20, paddingTop: 8 },
  cta: {
    alignItems: 'center',
    backgroundColor: COLORS.purple,
    borderRadius: 10,
    justifyContent: 'center',
    paddingVertical: 16,
  },
  ctaPressed: { backgroundColor: COLORS.purpleDim },
  ctaDisabled: { backgroundColor: COLORS.disabledFill },
  ctaText: { color: COLORS.white, fontSize: 17, fontWeight: '600' },
  ctaTextDisabled: { color: COLORS.textDisabled },

  sheetRoot: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  backdropFill: { flex: 1 },
  sheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 32,
    paddingHorizontal: 20,
    paddingTop: 18,
  },
  sheetHeader: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  sheetTitle: { color: COLORS.textPrimary, fontSize: 18, fontWeight: '700' },
  sheetClose: { color: COLORS.textPrimary, fontSize: 20 },

  cardForm: { marginBottom: 10, marginTop: 20 },
  conditionsBody: { backgroundColor: COLORS.white, borderRadius: 12, marginVertical: 16, padding: 16 },
  conditionsText: { color: COLORS.textSecondary, fontSize: 15, lineHeight: 21 },
  ackRow: { alignItems: 'flex-start', flexDirection: 'row', paddingTop: 16 },
  ackText: { color: COLORS.textPrimary, flex: 1, fontSize: 15, fontWeight: '600', paddingLeft: 12 },

  depositingRoot: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
  },
  depositingCard: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingHorizontal: 40,
    paddingVertical: 30,
  },
  spinnerWrap: { alignItems: 'center', height: 56, justifyContent: 'center', width: 56 },
  spinnerArc: {
    borderColor: 'transparent',
    borderRadius: 28,
    borderTopColor: COLORS.purple,
    borderWidth: 3,
    height: 56,
    position: 'absolute',
    width: 56,
  },
  spinnerMark: { fontSize: 26 },
  depositingText: { color: COLORS.textPrimary, fontSize: 16, fontWeight: '600', paddingTop: 18 },
  banner: { backgroundColor: COLORS.danger, paddingHorizontal: 20, paddingVertical: 14 },
  bannerSuccess: { backgroundColor: COLORS.green },
  bannerTitle: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
  bannerBody: { color: COLORS.white, fontSize: 14, paddingTop: 2 },
});
