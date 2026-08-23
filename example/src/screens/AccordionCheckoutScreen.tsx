import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  Image,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type { LayoutChangeEvent } from 'react-native';
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
  usePrimerPaymentMethods,
  usePrimerLocalization,
} from '@primer-io/react-native';
import type { PaymentMethodItem, PrimerSettings } from '@primer-io/react-native';

import { appPaymentParameters } from '../models/IClientSessionRequestBody';
import { getPaymentHandlingStringVal } from '../network/Environment';
import { customAppearanceMode } from './SettingsScreen';

// Showcase: accordion checkout. Contact → Shipping → Payment as expandable
// sections — completing one collapses it to a summary line and opens the next.
// Inside Payment, methods are radio-accordion rows: selecting "Card" expands
// the Primer card form inline; selecting an APM folds it shut.
// Sections and the card form stay mounted and animate via measured-height
// Animated transitions — LayoutAnimation's unmount path is unreliable on the
// New Architecture, and keeping the card form mounted preserves its focus and
// keyboard across method switches.

const settings: PrimerSettings = {
  paymentHandling: getPaymentHandlingStringVal(appPaymentParameters.paymentHandling),
  paymentMethodOptions: { iOS: { urlScheme: 'merchant://primer.io' } },
  uiOptions: { appearanceMode: customAppearanceMode },
  debugOptions: { is3DSSanityCheckEnabled: false },
  clientSessionCachingEnabled: true,
  apiVersion: '2.4',
};

// Order-preview product shot (Unsplash, free license). Sized for the 88×112pt
// tile at 3x; the request itself needs network, which checkout already does.
const dressImageUri = 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=264&h=336&fit=crop&q=80';

type SectionId = 'contact' | 'shipping' | 'payment';
type SelectedOption = { kind: 'apm'; method: PaymentMethodItem } | { kind: 'card' } | null;

type AccordionRouteProp = RouteProp<{ AccordionCheckout: { clientToken: string } }, 'AccordionCheckout'>;

export function AccordionCheckoutScreen({ navigation }: { navigation: { goBack: () => void } }) {
  const { clientToken } = useRoute<AccordionRouteProp>().params;

  return (
    <PrimerCheckoutProvider
      clientToken={clientToken}
      settings={settings}
      onCheckoutComplete={(data) => console.log('Checkout complete:', data)}
      onError={(error) => Alert.alert('Checkout Error', error.errorId ?? 'Unknown error')}
    >
      <PrimerCardFormProvider>
        <AccordionFlow onDone={() => navigation.goBack()} />
      </PrimerCardFormProvider>
    </PrimerCheckoutProvider>
  );
}

function AccordionFlow({ onDone }: { onDone: () => void }) {
  const { isReady, activeMethod, setActiveMethod, paymentOutcome, retry, clearPaymentOutcome, clientSession } =
    usePrimerCheckout();
  const cardForm = usePrimerCardForm();
  const { paymentMethods, isLoading: methodsLoading } = usePrimerPaymentMethods({ exclude: ['PAYMENT_CARD'] });
  const { formatCurrency } = usePrimerLocalization();

  const [openSection, setOpenSection] = useState<SectionId>('contact');
  const [email, setEmail] = useState('john@example.com');
  const [contactDone, setContactDone] = useState(false);
  const [fullName, setFullName] = useState('John Smith');
  const [address, setAddress] = useState('10 Downing Street');
  const [city, setCity] = useState('London, SW1A 2AA');
  const [shippingDone, setShippingDone] = useState(false);
  const [selected, setSelected] = useState<SelectedOption>(null);
  // Mirrors the drop-in's processing pattern: on while a submit/retry is in
  // flight, off when the outcome lands (covers the post-tokenize window too).
  const [processing, setProcessing] = useState(false);

  const scrollRef = useRef<ScrollView>(null);
  // Section y-offsets in scroll-content coordinates, kept fresh by onLayout.
  const sectionOffsets = useRef<Record<SectionId, number>>({ contact: 0, shipping: 0, payment: 0 });

  // Card form may expand at any moment — keep the card manager active.
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

  if (paymentOutcome?.status === 'success') {
    return (
      <SuccessState
        orderRef={paymentOutcome.data.payment?.orderId ?? paymentOutcome.data.payment?.id}
        email={email}
        fullName={fullName}
        addressLine={`${address}, ${city}`}
        totalLabel={totalLabel}
        onDone={onDone}
      />
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

  const scrollToSection = (id: SectionId) => {
    scrollRef.current?.scrollTo({ y: Math.max(sectionOffsets.current[id] - 12, 0), animated: true });
  };

  const trackSectionOffset = (id: SectionId) => (e: LayoutChangeEvent) => {
    sectionOffsets.current[id] = e.nativeEvent.layout.y;
  };

  const completeContact = () => {
    Keyboard.dismiss();
    setContactDone(true);
    setOpenSection('shipping');
  };

  const completeShipping = () => {
    Keyboard.dismiss();
    setShippingDone(true);
    setOpenSection('payment');
  };

  const editSection = (section: SectionId) => {
    Keyboard.dismiss();
    setOpenSection(section);
  };

  const cardSelected = selected?.kind === 'card';
  const payEnabled =
    contactDone && shippingDone && selected != null && (selected.kind === 'apm' || cardForm.isValid);

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

  return (
    <View style={styles.root}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
      >
        {/* Order preview — the item being purchased, pinned above the steps. */}
        <View style={styles.previewCard}>
          <Image source={{ uri: dressImageUri }} style={styles.previewImage} resizeMode="cover" />
          <View style={styles.previewInfo}>
            <View style={styles.previewTitleGroup}>
              <Text style={styles.previewName}>Floral Belted Midi Dress</Text>
              <Text style={styles.previewMeta}>Scarlet · Size M · Qty 1</Text>
            </View>
            <Text style={styles.previewPrice}>{totalLabel}</Text>
          </View>
        </View>

        <Section
          step="1"
          title="Contact"
          done={contactDone}
          open={openSection === 'contact'}
          summary={email}
          onEdit={() => editSection('contact')}
          onLayout={trackSectionOffset('contact')}
          onOpened={() => scrollToSection('contact')}
        >
          <Text style={styles.fieldLabel}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity
            style={[styles.continueButton, !email.includes('@') && styles.buttonDisabled]}
            disabled={!email.includes('@')}
            onPress={completeContact}
          >
            <Text style={styles.continueText}>Continue</Text>
          </TouchableOpacity>
        </Section>

        <Section
          step="2"
          title="Shipping"
          done={shippingDone}
          open={openSection === 'shipping'}
          summary={`${fullName} · ${address}, ${city}`}
          onEdit={() => editSection('shipping')}
          onLayout={trackSectionOffset('shipping')}
          onOpened={() => scrollToSection('shipping')}
        >
          <Text style={styles.fieldLabel}>Full name</Text>
          <TextInput style={styles.input} value={fullName} onChangeText={setFullName} />
          <Text style={styles.fieldLabel}>Address</Text>
          <TextInput style={styles.input} value={address} onChangeText={setAddress} />
          <Text style={styles.fieldLabel}>City & postcode</Text>
          <TextInput style={styles.input} value={city} onChangeText={setCity} />
          <TouchableOpacity
            style={[
              styles.continueButton,
              (!fullName || !address || !city) && styles.buttonDisabled,
            ]}
            disabled={!fullName || !address || !city}
            onPress={completeShipping}
          >
            <Text style={styles.continueText}>Continue</Text>
          </TouchableOpacity>
        </Section>

        <Section
          step="3"
          title="Payment"
          done={false}
          open={openSection === 'payment'}
          onLayout={trackSectionOffset('payment')}
          onOpened={() => scrollToSection('payment')}
        >
          {methodsLoading ? (
            <ActivityIndicator style={styles.methodsSpinner} />
          ) : (
            <>
              {paymentMethods.slice(0, 3).map((method) => {
                const isSelected = selected?.kind === 'apm' && selected.method.type === method.type;
                return (
                  <TouchableOpacity
                    key={method.type}
                    style={[styles.methodRow, isSelected && styles.methodRowSelected]}
                    onPress={() => setSelected({ kind: 'apm', method })}
                  >
                    <View style={[styles.radioOuter, isSelected && styles.radioOuterActive]}>
                      {isSelected && <View style={styles.radioInner} />}
                    </View>
                    {method.logo != null && (
                      <Image source={{ uri: method.logo }} style={styles.methodLogo} resizeMode="contain" />
                    )}
                    <Text style={styles.methodName}>{method.name}</Text>
                  </TouchableOpacity>
                );
              })}

              <TouchableOpacity
                style={[styles.methodRow, cardSelected && styles.methodRowSelected]}
                onPress={() => setSelected({ kind: 'card' })}
              >
                <View style={[styles.radioOuter, cardSelected && styles.radioOuterActive]}>
                  {cardSelected && <View style={styles.radioInner} />}
                </View>
                <Text style={styles.methodEmoji}>💳</Text>
                <Text style={styles.methodName}>Credit or Debit Card</Text>
              </TouchableOpacity>

              {/* The card form expands inline inside the selected method row.
                  It stays mounted while collapsed so switching to an APM and
                  back keeps the typed card state and avoids a native remount. */}
              <Collapsible
                open={cardSelected}
                onOpened={() => scrollRef.current?.scrollToEnd({ animated: true })}
              >
                <View style={styles.cardFormWell}>
                  {!isReady || activeMethod == null ? (
                    <ActivityIndicator style={styles.methodsSpinner} />
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
              </Collapsible>
            </>
          )}
        </Section>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalLabel}>{totalLabel}</Text>
        </View>
        <TouchableOpacity
          style={[styles.payButton, !payEnabled && styles.buttonDisabled]}
          disabled={!payEnabled || showProcessing}
          onPress={handlePay}
        >
          <Text style={styles.payText}>{`Pay ${totalLabel}`}</Text>
        </TouchableOpacity>
      </View>

      {/* Processing overlay */}
      {showProcessing && (
        <View style={styles.processingOverlay}>
          <View style={styles.processingCard}>
            <ActivityIndicator color="#111" size="large" />
            <Text style={styles.processingText}>Processing payment…</Text>
          </View>
        </View>
      )}
    </View>
  );
}

// Custom success state in the merchant's own visual language — an order
// confirmation with the product as receipt — instead of PrimerSuccessScreen.
function SuccessState({
  orderRef,
  email,
  fullName,
  addressLine,
  totalLabel,
  onDone,
}: {
  orderRef?: string;
  email: string;
  fullName: string;
  addressLine: string;
  totalLabel: string;
  onDone: () => void;
}) {
  const intro = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(intro, { toValue: 1, friction: 7, tension: 60, useNativeDriver: true }).start();
  }, [intro]);

  return (
    <View style={styles.successRoot}>
      <Animated.View style={{ opacity: intro }}>
        <View style={styles.successHero}>
          <Animated.View style={[styles.successBadge, { transform: [{ scale: intro }] }]}>
            <Text style={styles.successCheck}>✓</Text>
          </Animated.View>
          <Text style={styles.successTitle}>Order confirmed</Text>
          <Text style={styles.successSubtitle}>A receipt is on its way to {email}</Text>
        </View>

        <View style={styles.previewCard}>
          <Image source={{ uri: dressImageUri }} style={styles.previewImage} resizeMode="cover" />
          <View style={styles.previewInfo}>
            <View style={styles.previewTitleGroup}>
              <Text style={styles.previewName}>Floral Belted Midi Dress</Text>
              <Text style={styles.previewMeta}>Scarlet · Size M · Qty 1</Text>
            </View>
            <Text style={styles.previewPrice}>{totalLabel}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.successDetailLabel}>Delivering to</Text>
          <Text style={styles.successDetailText}>{fullName}</Text>
          <Text style={styles.successDetailText}>{addressLine}</Text>
        </View>

        {orderRef != null && <Text style={styles.successRef}>Order ref: {orderRef}</Text>}
      </Animated.View>

      <TouchableOpacity style={styles.payButton} onPress={onDone}>
        <Text style={styles.payText}>Done</Text>
      </TouchableOpacity>
    </View>
  );
}

// Animated 0→1 progress that follows `open`. Drives layout height, so it
// cannot use the native driver.
function useOpenProgress(open: boolean, onOpened?: () => void) {
  const progress = useRef(new Animated.Value(open ? 1 : 0)).current;
  const onOpenedRef = useRef(onOpened);
  onOpenedRef.current = onOpened;

  useEffect(() => {
    const animation = Animated.timing(progress, {
      toValue: open ? 1 : 0,
      duration: 240,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
      useNativeDriver: false,
    });
    animation.start(({ finished }) => {
      if (finished && open) {
        onOpenedRef.current?.();
      }
    });
    return () => animation.stop();
  }, [open, progress]);

  return progress;
}

// Measured-height collapse: children stay mounted, the wrapper animates
// between 0 and the content's measured height.
function Collapsible({
  open,
  onOpened,
  children,
}: {
  open: boolean;
  onOpened?: () => void;
  children: React.ReactNode;
}) {
  const progress = useOpenProgress(open, onOpened);
  const [contentHeight, setContentHeight] = useState(0);

  const height = progress.interpolate({ inputRange: [0, 1], outputRange: [0, contentHeight] });

  return (
    <Animated.View
      style={[styles.collapsible, { height, opacity: progress }]}
      pointerEvents={open ? 'auto' : 'none'}
      accessibilityElementsHidden={!open}
      importantForAccessibility={open ? 'auto' : 'no-hide-descendants'}
    >
      {/* Absolutely positioned so the measured height never depends on the
          wrapper's animated height — an in-flow child gets re-laid-out as the
          wrapper collapses, which corrupts the stored content height. */}
      <View
        style={styles.collapsibleContent}
        onLayout={(e) => setContentHeight(Math.round(e.nativeEvent.layout.height))}
      >
        {children}
      </View>
    </Animated.View>
  );
}

function Section({
  step,
  title,
  done,
  open,
  summary,
  onEdit,
  onLayout,
  onOpened,
  children,
}: {
  step: string;
  title: string;
  done: boolean;
  open: boolean;
  summary?: string;
  onEdit?: () => void;
  onLayout?: (e: LayoutChangeEvent) => void;
  onOpened?: () => void;
  children: React.ReactNode;
}) {
  const chevronProgress = useOpenProgress(open);
  const tappable = done && !open && onEdit != null;
  const chevronRotate = chevronProgress.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });

  return (
    <View style={styles.section} onLayout={onLayout}>
      <TouchableOpacity
        style={styles.sectionHeader}
        onPress={onEdit}
        disabled={!tappable}
        activeOpacity={0.6}
      >
        <View style={[styles.stepBadge, done && styles.stepBadgeDone]}>
          <Text style={[styles.stepBadgeText, done && styles.stepBadgeTextDone]}>
            {done ? '✓' : step}
          </Text>
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
        {tappable && <Text style={styles.editLink}>Edit</Text>}
        {(done || open) && <Animated.View style={[styles.chevron, { transform: [{ rotate: chevronRotate }] }]} />}
      </TouchableOpacity>
      {summary != null && (
        <Collapsible open={done && !open}>
          <Text style={styles.summaryText}>{summary}</Text>
        </Collapsible>
      )}
      <Collapsible open={open} onOpened={onOpened}>
        <View style={styles.sectionBody}>{children}</View>
      </Collapsible>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonDisabled: {
    opacity: 0.35,
  },
  cardFormWell: {
    backgroundColor: '#fafafa',
    borderColor: '#e8e8e8',
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
    marginTop: 4,
    padding: 12,
  },
  chevron: {
    borderLeftColor: 'transparent',
    borderLeftWidth: 5,
    borderRightColor: 'transparent',
    borderRightWidth: 5,
    borderTopColor: '#9ca3af',
    borderTopWidth: 6,
    height: 0,
    width: 0,
  },
  collapsible: {
    overflow: 'hidden',
  },
  collapsibleContent: {
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  continueButton: {
    alignItems: 'center',
    backgroundColor: '#111111',
    borderRadius: 10,
    marginTop: 12,
    padding: 14,
  },
  continueText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  editLink: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '500',
  },
  fieldLabel: {
    color: '#6b7280',
    fontSize: 13,
    marginBottom: 4,
    marginTop: 10,
  },
  fieldRow: {
    flexDirection: 'row',
    gap: 12,
  },
  flexField: {
    flex: 1,
  },
  footer: {
    backgroundColor: '#fff',
    borderTopColor: '#e8e8e8',
    borderTopWidth: 1,
    gap: 12,
    padding: 16,
  },
  input: {
    borderColor: '#d1d5db',
    borderRadius: 10,
    borderWidth: 1,
    color: '#111',
    fontSize: 15,
    padding: 12,
  },
  methodEmoji: {
    fontSize: 18,
    width: 28,
  },
  methodLogo: {
    height: 28,
    width: 28,
  },
  methodName: {
    color: '#111',
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  methodRow: {
    alignItems: 'center',
    borderColor: '#e2e2e2',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
    padding: 14,
  },
  methodRowSelected: {
    borderColor: '#111',
    borderWidth: 2,
    // Compensate the thicker border so the row's outer size stays fixed and
    // selection doesn't shift surrounding views.
    padding: 13,
  },
  methodsSpinner: {
    padding: 16,
  },
  payButton: {
    alignItems: 'center',
    backgroundColor: '#111111',
    borderRadius: 12,
    padding: 16,
  },
  payText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  previewCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    flexDirection: 'row',
    gap: 14,
    marginBottom: 12,
    padding: 12,
  },
  previewImage: {
    backgroundColor: '#f6ebe7',
    borderRadius: 10,
    height: 112,
    width: 88,
  },
  previewInfo: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  previewMeta: {
    color: '#6b7280',
    fontSize: 13,
  },
  previewName: {
    color: '#111',
    fontSize: 16,
    fontWeight: '600',
  },
  previewPrice: {
    color: '#111',
    fontSize: 17,
    fontWeight: '700',
  },
  previewTitleGroup: {
    gap: 3,
  },
  processingCard: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    gap: 14,
    paddingHorizontal: 36,
    paddingVertical: 28,
  },
  processingOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(17,17,17,0.35)',
    bottom: 0,
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  processingText: {
    color: '#111',
    fontSize: 15,
    fontWeight: '600',
  },
  radioInner: {
    backgroundColor: '#111',
    borderRadius: 5,
    height: 10,
    width: 10,
  },
  radioOuter: {
    alignItems: 'center',
    borderColor: '#c7c7c7',
    borderRadius: 10,
    borderWidth: 2,
    height: 20,
    justifyContent: 'center',
    width: 20,
  },
  radioOuterActive: {
    borderColor: '#111',
  },
  root: {
    backgroundColor: '#f6f6f4',
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 14,
    marginBottom: 12,
    padding: 16,
  },
  sectionBody: {
    marginTop: 8,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  sectionTitle: {
    color: '#111',
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  stepBadge: {
    alignItems: 'center',
    backgroundColor: '#eceae6',
    borderRadius: 13,
    height: 26,
    justifyContent: 'center',
    width: 26,
  },
  stepBadgeDone: {
    backgroundColor: '#16a34a',
  },
  stepBadgeText: {
    color: '#111',
    fontSize: 13,
    fontWeight: '700',
  },
  stepBadgeTextDone: {
    color: '#fff',
  },
  successBadge: {
    alignItems: 'center',
    backgroundColor: '#16a34a',
    borderRadius: 32,
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  successCheck: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '700',
  },
  successDetailLabel: {
    color: '#6b7280',
    fontSize: 13,
    marginBottom: 6,
  },
  successDetailText: {
    color: '#111',
    fontSize: 15,
    lineHeight: 22,
  },
  successHero: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
    marginTop: 24,
  },
  successRef: {
    color: '#9ca3af',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
  successRoot: {
    backgroundColor: '#f6f6f4',
    flex: 1,
    justifyContent: 'space-between',
    padding: 16,
  },
  successSubtitle: {
    color: '#6b7280',
    fontSize: 14,
    textAlign: 'center',
  },
  successTitle: {
    color: '#111',
    fontSize: 22,
    fontWeight: '700',
  },
  summaryText: {
    color: '#6b7280',
    fontSize: 13,
    marginLeft: 38,
    marginTop: 4,
  },
  totalLabel: {
    color: '#111',
    fontSize: 17,
    fontWeight: '700',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
