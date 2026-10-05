import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  Keyboard,
  PanResponder,
  ScrollView,
  StyleSheet,
  Text,
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
  usePrimerCardNetwork,
  usePrimerCardNetworkSelection,
  usePrimerLocalization,
} from '@primer-io/react-native';
import type { PrimerSettings } from '@primer-io/react-native';

import { appPaymentParameters } from '../models/IClientSessionRequestBody';
import { getPaymentHandlingStringVal } from '../network/Environment';
import { customAppearanceMode } from './SettingsScreen';

// Showcase: a live card preview that fills itself in from the Primer card form
// state — number, name and expiry mirror onto the card face as you type, the
// detected network logo fades into the corner, and touching the CVV field flips
// the card over. Submission is a swipe gesture (slide-to-pay), not a button.
//
// Co-badge: PrimerCardNumberInput ships its own network selector (appears on
// co-badged BINs, e.g. 4035 5010 0000 0008). This screen's twist is the mirror:
// the card face reads usePrimerCardNetworkSelection and shows whichever network
// the shopper picks in that built-in selector, live.

const COLORS = {
  accent: '#8B5CF6',
  background: '#0F172A',
  cardBack: '#4C1D95',
  cardFront: '#6D28D9',
  successFace: '#15803D',
  surface: '#1E293B',
  textDim: '#94A3B8',
  textLight: '#F8FAFC',
  track: '#1E293B',
};

const NUMBER_TEMPLATE = '•••• •••• •••• ••••';
const THUMB_SIZE = 52;
const TRACK_PADDING = 4;

const settings: PrimerSettings = {
  paymentHandling: getPaymentHandlingStringVal(appPaymentParameters.paymentHandling),
  paymentMethodOptions: { iOS: { urlScheme: 'merchant://primer.io' } },
  uiOptions: { appearanceMode: customAppearanceMode },
  debugOptions: { is3DSSanityCheckEnabled: false },
  clientSessionCachingEnabled: true,
  apiVersion: '2.4',
};

// Violet focus accents on the Primer inputs to match the card.
const demoTheme = {
  light: {
    colors: {
      primary: COLORS.accent,
      borderFocused: COLORS.accent,
    },
  },
};

type CardPreviewRouteProp = RouteProp<{ CardPreview: { clientToken: string } }, 'CardPreview'>;

export function CardPreviewScreen({ navigation }: { navigation: { goBack: () => void } }) {
  const { clientToken } = useRoute<CardPreviewRouteProp>().params;

  return (
    <PrimerCheckoutProvider
      clientToken={clientToken}
      settings={settings}
      theme={demoTheme}
      onCheckoutComplete={(data) => console.log('Checkout complete:', data)}
      onError={(error) => Alert.alert('Checkout Error', error.errorId ?? 'Unknown error')}
    >
      <PrimerCardFormProvider>
        <CardPreviewFlow onDone={() => navigation.goBack()} />
      </PrimerCardFormProvider>
    </PrimerCheckoutProvider>
  );
}

function CardPreviewFlow({ onDone }: { onDone: () => void }) {
  const { isReady, activeMethod, setActiveMethod, paymentOutcome, retry, clearPaymentOutcome, clientSession } =
    usePrimerCheckout();
  const cardForm = usePrimerCardForm();
  const { iconSource } = usePrimerCardNetwork();
  const { displayedNetwork, isSelectorVisible, isDualBadge } = usePrimerCardNetworkSelection();
  const { formatCurrency } = usePrimerLocalization();

  const flipAnim = useRef(new Animated.Value(0)).current;
  // Mirrors the drop-in's processing pattern: on while a submit/retry is in
  // flight, off when the outcome lands (covers the post-tokenize window too).
  const [processing, setProcessing] = useState(false);
  const [succeeded, setSucceeded] = useState(false);

  const successFlip = useRef(new Animated.Value(0)).current;
  const chromeOut = useRef(new Animated.Value(0)).current;
  const cardGlide = useRef(new Animated.Value(0)).current;
  const checkPop = useRef(new Animated.Value(0)).current;
  const copyIn = useRef(new Animated.Value(0)).current;

  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  // Success choreography: form/slider melt away, the card glides to centre and
  // flips onto its receipt face, copy fades up, then the screen closes itself.
  useEffect(() => {
    if (paymentOutcome?.status !== 'success') return;
    setSucceeded(true);
    Keyboard.dismiss();
    Animated.parallel([
      Animated.timing(chromeOut, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.sequence([
        Animated.delay(100),
        Animated.spring(cardGlide, { toValue: 1, friction: 10, tension: 22, useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.delay(250),
        Animated.spring(successFlip, { toValue: 180, friction: 10, tension: 22, useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.delay(650),
        Animated.spring(checkPop, { toValue: 1, friction: 5, useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.delay(900),
        Animated.timing(copyIn, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]),
    ]).start();
    const timer = setTimeout(() => onDoneRef.current(), 4000);
    return () => clearTimeout(timer);
  }, [paymentOutcome, chromeOut, cardGlide, successFlip, checkPop, copyIn]);

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

  // Low tension + high friction = a slow, weighty flip.
  const flipTo = useCallback(
    (degrees: number) => {
      Animated.spring(flipAnim, { toValue: degrees, friction: 10, tension: 22, useNativeDriver: true }).start();
    },
    [flipAnim]
  );

  // Flip with typing, not just touch: editing CVV turns the card over (CVV lives
  // on the back), editing any front field turns it face-up again.
  const prevFieldsRef = useRef({ cvv: '', front: '' });
  useEffect(() => {
    const front = `${cardForm.cardNumber}|${cardForm.expiryDate}|${cardForm.cardholderName}`;
    const prev = prevFieldsRef.current;
    if (cardForm.cvv !== prev.cvv) {
      flipTo(180);
    } else if (front !== prev.front) {
      flipTo(0);
    }
    prevFieldsRef.current = { cvv: cardForm.cvv, front };
  }, [cardForm.cvv, cardForm.cardNumber, cardForm.expiryDate, cardForm.cardholderName, flipTo]);

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

  // Slight shrink at the flip's midpoint sells the 3D rotation.
  const flipScale = flipAnim.interpolate({ inputRange: [0, 90, 180], outputRange: [1, 0.92, 1] });
  const frontStyle = {
    transform: [
      { perspective: 1000 },
      { rotateY: flipAnim.interpolate({ inputRange: [0, 180], outputRange: ['0deg', '180deg'] }) },
      { scale: flipScale },
    ],
  };
  const backStyle = {
    transform: [
      { perspective: 1000 },
      { rotateY: flipAnim.interpolate({ inputRange: [0, 180], outputRange: ['180deg', '360deg'] }) },
      { scale: flipScale },
    ],
  };

  // Success flip: a second, outer flip layer whose reverse side is the receipt
  // face. Outer and inner rotations compose, so the card reads as one clean
  // flip regardless of which side it shows when the outcome lands.
  const glideStyle = {
    transform: [
      { translateY: cardGlide.interpolate({ inputRange: [0, 1], outputRange: [0, 80] }) },
      { scale: cardGlide.interpolate({ inputRange: [0, 1], outputRange: [1, 1.04] }) },
    ],
  };
  const outerScale = successFlip.interpolate({ inputRange: [0, 90, 180], outputRange: [1, 0.92, 1] });
  // Hard opacity switch at the flip's midpoint — sidesteps nested-backface
  // quirks that differ between iOS and Android.
  const outerFrontStyle = {
    opacity: successFlip.interpolate({ inputRange: [0, 89, 90, 180], outputRange: [1, 1, 0, 0] }),
    transform: [
      { perspective: 1000 },
      { rotateY: successFlip.interpolate({ inputRange: [0, 180], outputRange: ['0deg', '180deg'] }) },
      { scale: outerScale },
    ],
  };
  const outerBackStyle = {
    opacity: successFlip.interpolate({ inputRange: [0, 89, 90, 180], outputRange: [0, 0, 1, 1] }),
    transform: [
      { perspective: 1000 },
      { rotateY: successFlip.interpolate({ inputRange: [0, 180], outputRange: ['180deg', '360deg'] }) },
      { scale: outerScale },
    ],
  };
  const chromeStyle = {
    opacity: chromeOut.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
    transform: [{ translateY: chromeOut.interpolate({ inputRange: [0, 1], outputRange: [0, 18] }) }],
  };

  const shownNumber =
    cardForm.cardNumber.length >= NUMBER_TEMPLATE.length
      ? cardForm.cardNumber
      : cardForm.cardNumber + NUMBER_TEMPLATE.slice(cardForm.cardNumber.length);
  const shownName = (cardForm.cardholderName || 'YOUR NAME').toUpperCase();
  const shownExpiry = cardForm.expiryDate || 'MM/YY';
  const shownCvv = cardForm.cvv || '•••';

  const totalLabel =
    clientSession?.totalAmount != null && clientSession.currencyCode
      ? formatCurrency(clientSession.totalAmount, clientSession.currencyCode)
      : '—';

  const last4 = cardForm.cardNumber.replace(/\D/g, '').slice(-4);
  // Same conditional as the card front's top row: co-badged shows the picked
  // network's name, otherwise the detected network's logo.
  const networkNode =
    isSelectorVisible || isDualBadge ? (
      <Text style={styles.successNetworkText}>{displayedNetwork?.displayName.toUpperCase() ?? 'CARD'}</Text>
    ) : iconSource != null ? (
      <Image source={iconSource} style={styles.successNetworkLogo} resizeMode="contain" />
    ) : null;

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Live card preview */}
        <Animated.View style={[styles.cardStage, glideStyle]}>
          <Animated.View style={[styles.outerFace, outerFrontStyle]}>
            <Animated.View style={[styles.cardFace, styles.cardFront, frontStyle]}>
              <View style={styles.cardTopRow}>
                <Text style={styles.cardBrand}>PRIMER BANK</Text>
                {isSelectorVisible || isDualBadge ? (
                  // Co-badged: show the displayed network's name — follows the pick.
                  <View style={styles.cardNetworkBadge}>
                    <Text style={styles.cardNetworkBadgeText}>
                      {displayedNetwork?.displayName.toUpperCase() ?? 'CARD'}
                    </Text>
                  </View>
                ) : (
                  iconSource != null && (
                    <Image source={iconSource} style={styles.networkLogo} resizeMode="contain" />
                  )
                )}
              </View>
              <View style={styles.chip} />
              <Text style={styles.cardNumber}>{shownNumber}</Text>
              <View style={styles.cardBottomRow}>
                <View>
                  <Text style={styles.cardFieldLabel}>CARDHOLDER</Text>
                  <Text style={styles.cardFieldValue}>{shownName}</Text>
                </View>
                <View>
                  <Text style={styles.cardFieldLabel}>VALID THRU</Text>
                  <Text style={styles.cardFieldValue}>{shownExpiry}</Text>
                </View>
              </View>
            </Animated.View>

            <Animated.View style={[styles.cardFace, styles.cardBack, backStyle]}>
              <View style={styles.magstripe} />
              <View style={styles.signatureRow}>
                <View style={styles.signatureStrip}>
                  <Text style={styles.signatureScribble}>~~~~~~~~~~</Text>
                </View>
                <View style={styles.cvvBox}>
                  <Text style={styles.cvvText}>{shownCvv}</Text>
                </View>
              </View>
              <Text style={styles.cardBackHint}>CVV</Text>
            </Animated.View>
          </Animated.View>
          <Animated.View style={[styles.outerFace, styles.successFace, outerBackStyle]}>
            <SuccessFace amountLabel={totalLabel} networkNode={networkNode} last4={last4} checkPop={checkPop} />
          </Animated.View>
          {succeeded && (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.successCopy,
                {
                  opacity: copyIn,
                  transform: [{ translateY: copyIn.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
                },
              ]}
            >
              <Text style={styles.successTitle}>Payment successful</Text>
              <Text style={styles.successSubtitle}>Closing automatically…</Text>
            </Animated.View>
          )}
        </Animated.View>

        {/* Inputs — touching CVV flips the card, anything else flips it back */}
        <Animated.View style={[styles.form, chromeStyle]} pointerEvents={succeeded ? 'none' : 'auto'}>
          {!isReady || activeMethod == null ? (
            <ActivityIndicator color={COLORS.accent} style={styles.spinner} />
          ) : (
            <>
              <View onTouchStart={() => flipTo(0)}>
                <PrimerCardNumberInput />
              </View>
              <View style={styles.fieldRow}>
                <View style={styles.flexField} onTouchStart={() => flipTo(0)}>
                  <PrimerExpiryDateInput />
                </View>
                <View style={styles.flexField} onTouchStart={() => flipTo(180)}>
                  <PrimerCVVInput />
                </View>
              </View>
              <View onTouchStart={() => flipTo(0)}>
                <PrimerCardholderNameInput />
              </View>
            </>
          )}
        </Animated.View>

      </ScrollView>

      <Animated.View
        style={[styles.footer, chromeStyle]}
        pointerEvents={succeeded ? 'none' : 'auto'}
        onTouchStart={() => flipTo(0)}
      >
        <SlideToPay
          label={`Slide to pay ${totalLabel}`}
          enabled={cardForm.isValid && !showProcessing}
          submitting={showProcessing}
          outcomePending={paymentOutcome != null}
          onTrigger={() => {
            setProcessing(true);
            void cardForm.submit();
          }}
        />
      </Animated.View>
    </View>
  );
}

function SlideToPay({
  label,
  enabled,
  submitting,
  outcomePending,
  onTrigger,
}: {
  label: string;
  enabled: boolean;
  submitting: boolean;
  outcomePending: boolean;
  onTrigger: () => void;
}) {
  const dragX = useRef(new Animated.Value(0)).current;
  const [trackWidth, setTrackWidth] = useState(0);

  const maxRef = useRef(0);
  maxRef.current = Math.max(0, trackWidth - THUMB_SIZE - TRACK_PADDING * 2);
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;
  const onTriggerRef = useRef(onTrigger);
  onTriggerRef.current = onTrigger;

  // Snap the thumb home whenever a submit cycle ends without leaving the screen.
  useEffect(() => {
    if (!submitting && !outcomePending) {
      Animated.spring(dragX, { toValue: 0, useNativeDriver: true }).start();
    }
  }, [submitting, outcomePending, dragX]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => enabledRef.current,
      onMoveShouldSetPanResponder: () => enabledRef.current,
      onPanResponderMove: (_event, gesture) => {
        dragX.setValue(Math.min(Math.max(gesture.dx, 0), maxRef.current));
      },
      onPanResponderRelease: (_event, gesture) => {
        if (maxRef.current > 0 && gesture.dx >= maxRef.current * 0.85) {
          Animated.timing(dragX, { toValue: maxRef.current, duration: 120, useNativeDriver: true }).start(
            () => onTriggerRef.current()
          );
        } else {
          Animated.spring(dragX, { toValue: 0, useNativeDriver: true }).start();
        }
      },
      onPanResponderTerminate: () => {
        Animated.spring(dragX, { toValue: 0, useNativeDriver: true }).start();
      },
    })
  ).current;

  return (
    <View
      style={[styles.track, !enabled && !submitting && styles.trackDisabled]}
      onLayout={(event) => setTrackWidth(event.nativeEvent.layout.width)}
    >
      <Text style={styles.trackLabel}>{submitting ? 'Processing…' : label}</Text>
      <Animated.View
        style={[styles.thumb, { transform: [{ translateX: dragX }] }]}
        {...panResponder.panHandlers}
      >
        {submitting ? (
          <ActivityIndicator color={COLORS.background} />
        ) : (
          <Text style={styles.thumbArrow}>→</Text>
        )}
      </Animated.View>
    </View>
  );
}

function SuccessFace({
  amountLabel,
  networkNode,
  last4,
  checkPop,
}: {
  amountLabel: string;
  networkNode: React.ReactNode;
  last4: string;
  checkPop: Animated.Value;
}) {
  return (
    <>
      <Animated.View style={[styles.successCheckCircle, { transform: [{ scale: checkPop }] }]}>
        <Text style={styles.successCheckGlyph}>✓</Text>
      </Animated.View>
      <Text style={styles.successPaid}>Paid {amountLabel}</Text>
      <View style={styles.successNetworkRow}>
        {networkNode}
        <Text style={styles.successLast4}>•••• {last4}</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  cardBack: {
    backgroundColor: COLORS.cardBack,
    justifyContent: 'flex-start',
    paddingTop: 24,
  },
  cardBackHint: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
    marginTop: 8,
    textAlign: 'right',
  },
  cardBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardBrand: {
    color: COLORS.textLight,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 2,
  },
  cardFace: {
    backfaceVisibility: 'hidden',
    borderRadius: 18,
    bottom: 0,
    justifyContent: 'space-between',
    left: 0,
    padding: 20,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  cardFieldLabel: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 9,
    letterSpacing: 1,
  },
  cardFieldValue: {
    color: COLORS.textLight,
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
  cardFront: {
    backgroundColor: COLORS.cardFront,
  },
  cardNetworkBadge: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  cardNetworkBadgeText: {
    color: COLORS.textLight,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  cardNumber: {
    color: COLORS.textLight,
    fontSize: 21,
    fontVariant: ['tabular-nums'],
    fontWeight: '600',
    letterSpacing: 2,
  },
  cardStage: {
    aspectRatio: 1.586,
    marginBottom: 24,
    width: '100%',
  },
  cardTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    // Fixed height (= network logo height) so the network appearing doesn't
    // reflow the card face.
    height: 28,
    justifyContent: 'space-between',
  },
  chip: {
    backgroundColor: '#FACC15',
    borderRadius: 6,
    height: 28,
    opacity: 0.9,
    width: 38,
  },
  cvvBox: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 4,
    paddingVertical: 6,
    width: 58,
  },
  cvvText: {
    color: '#111',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
  },
  fieldRow: {
    flexDirection: 'row',
    gap: 12,
  },
  flexField: {
    flex: 1,
  },
  footer: {
    backgroundColor: COLORS.background,
    borderTopColor: COLORS.surface,
    borderTopWidth: 1,
    padding: 16,
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 16,
    gap: 12,
    padding: 16,
  },
  magstripe: {
    backgroundColor: '#111',
    height: 40,
    marginHorizontal: -20,
  },
  networkLogo: {
    height: 28,
    width: 44,
  },
  outerFace: {
    backfaceVisibility: 'hidden',
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
  },
  root: {
    backgroundColor: COLORS.background,
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 32,
  },
  signatureRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  signatureScribble: {
    color: '#9ca3af',
    fontSize: 14,
  },
  signatureStrip: {
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  spinner: {
    padding: 16,
  },
  successCheckCircle: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  successCheckGlyph: {
    color: COLORS.successFace,
    fontSize: 26,
    fontWeight: '800',
  },
  successCopy: {
    alignItems: 'center',
    left: 0,
    marginTop: 20,
    position: 'absolute',
    right: 0,
    top: '100%',
  },
  successFace: {
    alignItems: 'center',
    backgroundColor: COLORS.successFace,
    borderRadius: 18,
    gap: 8,
    justifyContent: 'center',
  },
  successLast4: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 2,
  },
  successNetworkLogo: {
    height: 20,
    width: 32,
  },
  successNetworkRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  successNetworkText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  successPaid: {
    color: COLORS.textLight,
    fontSize: 20,
    fontWeight: '800',
  },
  successSubtitle: {
    color: COLORS.textDim,
    fontSize: 13,
    marginTop: 4,
  },
  successTitle: {
    color: COLORS.textLight,
    fontSize: 17,
    fontWeight: '700',
  },
  thumb: {
    alignItems: 'center',
    backgroundColor: COLORS.accent,
    borderRadius: THUMB_SIZE / 2,
    height: THUMB_SIZE,
    justifyContent: 'center',
    left: TRACK_PADDING,
    position: 'absolute',
    top: TRACK_PADDING,
    width: THUMB_SIZE,
  },
  thumbArrow: {
    color: COLORS.textLight,
    fontSize: 22,
    fontWeight: '700',
  },
  track: {
    backgroundColor: COLORS.track,
    borderRadius: (THUMB_SIZE + TRACK_PADDING * 2) / 2,
    height: THUMB_SIZE + TRACK_PADDING * 2,
    justifyContent: 'center',
  },
  trackDisabled: {
    opacity: 0.45,
  },
  trackLabel: {
    color: COLORS.textDim,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
});
