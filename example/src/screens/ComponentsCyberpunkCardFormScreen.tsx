import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {
  PrimerCheckoutProvider,
  useCardForm,
  CardNumberInput,
  ExpiryDateInput,
  CVVInput,
  CardholderNameInput,
  PaymentMethodList,
  PaymentSummary,
} from '@primer-io/react-native';
import type { PaymentMethodItemType } from '@primer-io/react-native';
import {appPaymentParameters} from '../models/IClientSessionRequestBody';

function CyberpunkCardFormContent() {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodItemType | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scanlineAnim = useRef(new Animated.Value(0)).current;

  // Calculate total from line items
  const totalAmount = appPaymentParameters.clientSessionRequestBody.order?.lineItems?.reduce(
    (sum, item) => sum + item.amount * item.quantity,
    0
  ) || 0;
  const currencyCode = appPaymentParameters.clientSessionRequestBody.currencyCode || 'EUR';

  const cardForm = useCardForm({
    collectCardholderName: true,
    onValidationChange: (isValid) => {
      if (isValid) {
        // Trigger success animation
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      }
    },
  });

  // Continuous pulse animation for active elements
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.02,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Scanline animation
    Animated.loop(
      Animated.timing(scanlineAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  // Neon cyberpunk theme
  const neonTheme = {
    primaryColor: '#00FFFF', // Cyan neon
    errorColor: '#FF0080', // Magenta neon
    textColor: '#00FFFF',
    placeholderColor: 'rgba(0, 255, 255, 0.4)',
    backgroundColor: 'rgba(10, 10, 30, 0.9)',
    borderColor: '#00FFFF',
    borderWidth: 2,
    borderRadius: 4, // Sharp corners for cyberpunk aesthetic
    focusedBorderColor: '#FF00FF', // Magenta focus
    fontSize: 16,
    fieldHeight: 56,
  };

  const getNetworkNeonColor = () => {
    const network = cardForm.metadata?.cardNetwork?.toLowerCase();
    if (network?.includes('visa')) return '#00FFFF'; // Cyan
    if (network?.includes('mastercard')) return '#FF00FF'; // Magenta
    if (network?.includes('amex')) return '#00FF00'; // Green
    return '#FFFF00'; // Yellow
  };

  const scanlineTranslateY = scanlineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 400],
  });

  const handleSubmit = async () => {
    try {
      await cardForm.submit();
      Alert.alert('[ SUCCESS ]', 'Payment executed successfully!');
    } catch (error: any) {
      Alert.alert('[ ERROR ]', error.message || 'Failed to execute payment');
    }
  };

  const handlePaymentMethodPress = (method: PaymentMethodItemType) => {
    if (method.type === 'PAYMENT_CARD') {
      setSelectedPaymentMethod(method);
    } else {
      Alert.alert(
        '[ COMING SOON ]',
        `${method.name} payment method will be available in future updates.`,
        [{ text: '[ OK ]' }]
      );
    }
  };

  const handleBackToList = () => {
    setSelectedPaymentMethod(null);
  };

  // Cyberpunk theme for payment methods
  const cyberpunkTheme = {
    primaryColor: '#00FFFF',
    backgroundColor: 'rgba(10, 10, 30, 0.9)',
    textColor: '#00FFFF',
    borderColor: '#00FFFF',
    borderWidth: 2,
    borderRadius: 4,
    itemSpacing: 16,
    badgeBackgroundColor: '#FF00FF',
    badgeTextColor: '#000000',
  };

  return (
    <ScrollView style={styles.container}>
      {/* Background Grid */}
      <View style={styles.gridBackground}>
        {[...Array(20)].map((_, i) => (
          <View key={`h-${i}`} style={styles.gridLineH} />
        ))}
      </View>

      {/* Scanline Effect */}
      <Animated.View
        style={[
          styles.scanline,
          { transform: [{ translateY: scanlineTranslateY }] },
        ]}
      />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          <Text style={styles.headerBracket}>{'[ '}</Text>
          SECURE PAYMENT TERMINAL
          <Text style={styles.headerBracket}>{' ]'}</Text>
        </Text>
        <View style={styles.statusBar}>
          <View style={[styles.statusDot, { backgroundColor: '#00FF00' }]} />
          <Text style={styles.statusText}>SYSTEM ONLINE</Text>
        </View>
      </View>

      {/* Payment Summary with Cyberpunk Theme */}
      <View style={styles.summaryContainer}>
        <PaymentSummary
          amount={totalAmount}
          currencyCode={currencyCode}
          theme={{
            primaryColor: '#00FFFF',
            backgroundColor: 'rgba(10, 10, 30, 0.9)',
            textColor: '#00FFFF',
            secondaryTextColor: 'rgba(0, 255, 255, 0.7)',
            borderColor: '#00FFFF',
            borderWidth: 2,
            borderRadius: 4,
          }}
          style={styles.summary}
          label="[ TRANSACTION AMOUNT ]"
        />
      </View>

      {/* Conditional Rendering: Payment Method List or Card Form */}
      {!selectedPaymentMethod ? (
        <>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{'> SELECT_PAYMENT_METHOD'}</Text>
          </View>
          <PaymentMethodList
            onPaymentMethodPress={handlePaymentMethodPress}
            showCardFirst={true}
            showComingSoonBadge={true}
            theme={cyberpunkTheme}
            testID="payment-method-list"
          />
        </>
      ) : (
        <>
          {/* Back Button */}
          <TouchableOpacity
            onPress={handleBackToList}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonText}>
              {'<< RETURN_TO_PAYMENT_METHODS'}
            </Text>
          </TouchableOpacity>

      {/* Digital Card Display */}
      <Animated.View
        style={[
          styles.cardDisplay,
          { transform: [{ scale: pulseAnim }] },
        ]}
      >
        <LinearGradient
          colors={['rgba(10, 10, 30, 0.95)', 'rgba(20, 0, 40, 0.95)']}
          style={styles.cardInner}
        >
          {/* Corner Decorations */}
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />

          {/* Card Number with Neon Glow */}
          <View style={styles.cardNumberDisplay}>
            <Text style={[styles.terminalLabel, { color: getNetworkNeonColor() }]}>
              CARD_NUM:
            </Text>
            <Text style={[styles.terminalValue, { color: getNetworkNeonColor() }]}>
              {cardForm.cardNumber || '---- ---- ---- ----'}
            </Text>
          </View>

          {/* Data Grid */}
          <View style={styles.dataGrid}>
            <View style={styles.dataCell}>
              <Text style={styles.terminalLabel}>NAME:</Text>
              <Text style={styles.terminalValue}>
                {cardForm.cardholderName || 'UNKNOWN'}
              </Text>
            </View>
            <View style={styles.dataCell}>
              <Text style={styles.terminalLabel}>EXP:</Text>
              <Text style={styles.terminalValue}>
                {cardForm.expiryDate || '--/--'}
              </Text>
            </View>
            <View style={styles.dataCell}>
              <Text style={styles.terminalLabel}>CVV:</Text>
              <Text style={styles.terminalValue}>
                {cardForm.cvv ? '***' : '---'}
              </Text>
            </View>
          </View>

          {/* Network Badge */}
          {cardForm.metadata?.cardNetwork && (
            <View
              style={[
                styles.networkBadge,
                { borderColor: getNetworkNeonColor() },
              ]}
            >
              <Text style={[styles.networkText, { color: getNetworkNeonColor() }]}>
                [{cardForm.metadata.cardNetwork}]
              </Text>
            </View>
          )}
        </LinearGradient>
      </Animated.View>

      {/* Input Terminal */}
      <View style={styles.terminal}>
        <View style={styles.terminalHeader}>
          <Text style={styles.terminalTitle}>{'> INPUT_SEQUENCE'}</Text>
        </View>

        <View style={styles.inputGrid}>
          <CardNumberInput
            cardForm={cardForm}
            field="cardNumber"
            theme={neonTheme}
            label="[CARD_NUMBER]"
            style={styles.input}
            labelStyle={styles.neonLabel}
            errorStyle={styles.neonError}
          />

          <View style={styles.row}>
            <ExpiryDateInput
              cardForm={cardForm}
              field="expiryDate"
              theme={neonTheme}
              label="[EXPIRY]"
              style={styles.halfInput}
              labelStyle={styles.neonLabel}
              errorStyle={styles.neonError}
            />

            <CVVInput
              cardForm={cardForm}
              field="cvv"
              theme={neonTheme}
              label="[CVV]"
              style={styles.halfInput}
              labelStyle={styles.neonLabel}
              errorStyle={styles.neonError}
            />
          </View>

          <CardholderNameInput
            cardForm={cardForm}
            field="cardholderName"
            theme={neonTheme}
            label="[CARDHOLDER_NAME]"
            style={styles.input}
            labelStyle={styles.neonLabel}
            errorStyle={styles.neonError}
          />
        </View>
      </View>

      {/* Execute Button */}
      <TouchableOpacity
        onPress={handleSubmit}
        disabled={!cardForm.isValid || cardForm.isSubmitting}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={
            cardForm.isValid
              ? ['#00FFFF', '#FF00FF']
              : ['rgba(100, 100, 100, 0.5)', 'rgba(60, 60, 60, 0.5)']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.executeButton}
        >
          <View style={styles.executeButtonInner}>
            <Text style={styles.executeButtonText}>
              {cardForm.isSubmitting
                ? '[ PROCESSING... ]'
                : '[ EXECUTE PAYMENT ]'}
            </Text>
            {cardForm.isValid && !cardForm.isSubmitting && (
              <View style={styles.blinkingCursor}>
                <Text style={styles.cursorText}>_</Text>
              </View>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
        </>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {'>> '} ENCRYPTED CONNECTION • PCI-DSS LEVEL 1 {' <<'}
        </Text>
      </View>
    </ScrollView>
  );
}

/**
 * Main screen component with PrimerCheckoutProvider
 */
export default function ComponentsCyberpunkCardFormScreen(props: any) {
  const { clientToken } = props.route.params;

  return (
    <PrimerCheckoutProvider
      clientToken={clientToken}
      onCheckoutComplete={(data) => {
        console.log('Checkout complete:', data);
        Alert.alert('[ SYSTEM MESSAGE ]', `Payment ${data.payment?.id} executed successfully`, [
          {
            text: '[ OK ]',
            onPress: () => props.navigation.goBack(),
          },
        ]);
      }}
      onError={(error, checkoutData) => {
        console.error('Checkout error:', error);
        Alert.alert('[ ERROR ]', error.description || 'Payment execution failed');
      }}
    >
      <CyberpunkCardFormContent />
    </PrimerCheckoutProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A1E',
    padding: 20,
  },
  gridBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
  },
  gridLineH: {
    height: 1,
    backgroundColor: '#00FFFF',
    marginVertical: 20,
  },
  scanline: {
    position: 'absolute',
    width: '100%',
    height: 2,
    backgroundColor: '#00FFFF',
    opacity: 0.3,
    shadowColor: '#00FFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  header: {
    marginBottom: 24,
  },
  summaryContainer: {
    marginBottom: 24,
  },
  summary: {
    shadowColor: '#00FFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  sectionHeader: {
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    padding: 12,
    borderWidth: 2,
    borderColor: '#00FFFF',
    borderRadius: 4,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#00FFFF',
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace' }),
    fontWeight: '700',
  },
  backButton: {
    marginBottom: 20,
    padding: 12,
    borderWidth: 2,
    borderColor: '#FF00FF',
    borderRadius: 4,
    backgroundColor: 'rgba(255, 0, 255, 0.1)',
  },
  backButtonText: {
    fontSize: 14,
    color: '#FF00FF',
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace' }),
    fontWeight: '700',
    textAlign: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#00FFFF',
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace' }),
    textAlign: 'center',
    textShadowColor: '#00FFFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  headerBracket: {
    color: '#FF00FF',
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    shadowColor: '#00FF00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    color: '#00FF00',
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace' }),
  },
  cardDisplay: {
    marginBottom: 24,
  },
  cardInner: {
    borderWidth: 2,
    borderColor: '#00FFFF',
    borderRadius: 4,
    padding: 20,
    minHeight: 180,
    shadowColor: '#00FFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  corner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: '#FF00FF',
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  cardNumberDisplay: {
    marginBottom: 20,
  },
  terminalLabel: {
    fontSize: 10,
    color: '#00FFFF',
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace' }),
    marginBottom: 4,
    opacity: 0.7,
  },
  terminalValue: {
    fontSize: 18,
    color: '#00FFFF',
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace' }),
    fontWeight: '700',
    textShadowColor: '#00FFFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  dataGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  dataCell: {
    flex: 1,
  },
  networkBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    borderWidth: 2,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  networkText: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace' }),
  },
  terminal: {
    borderWidth: 2,
    borderColor: '#00FFFF',
    borderRadius: 4,
    marginBottom: 20,
    backgroundColor: 'rgba(10, 10, 30, 0.8)',
    shadowColor: '#00FFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  terminalHeader: {
    backgroundColor: 'rgba(0, 255, 255, 0.1)',
    padding: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#00FFFF',
  },
  terminalTitle: {
    fontSize: 14,
    color: '#00FFFF',
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace' }),
    fontWeight: '700',
  },
  inputGrid: {
    padding: 16,
  },
  input: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  halfInput: {
    flex: 1,
    marginRight: 12,
  },
  neonLabel: {
    textShadowColor: '#00FFFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  neonError: {
    textShadowColor: '#FF0080',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  executeButton: {
    height: 64,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#00FFFF',
    shadowColor: '#00FFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 10,
    marginBottom: 20,
  },
  executeButtonInner: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    margin: 2,
  },
  executeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace' }),
    letterSpacing: 2,
    textShadowColor: '#00FFFF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  blinkingCursor: {
    opacity: 1,
    marginLeft: 8,
  },
  cursorText: {
    fontSize: 20,
    color: '#00FFFF',
    fontWeight: '700',
  },
  footer: {
    marginTop: 20,
    marginBottom: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: '#00FFFF',
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace' }),
    opacity: 0.6,
  },
});
