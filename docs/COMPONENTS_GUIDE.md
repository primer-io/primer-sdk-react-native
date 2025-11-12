# Components API Guide

The Primer React Native SDK provides a complete set of React components for building custom payment forms. These components offer a React-idiomatic way to integrate card payments with full control over styling and layout.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Pre-built CardForm Component](#pre-built-cardform-component)
3. [Individual Input Components](#individual-input-components)
4. [Hooks](#hooks)
5. [Theming](#theming)
6. [Examples](#examples)

---

## Getting Started

### Installation

The Components API is included in the main SDK package:

```bash
npm install @primer-io/react-native
# or
yarn add @primer-io/react-native
```

### Setup

Wrap your app with `PrimerCheckoutProvider` and configure your client session:

```tsx
import { PrimerCheckoutProvider } from '@primer-io/react-native';

function App() {
  return (
    <PrimerCheckoutProvider
      clientToken="YOUR_CLIENT_TOKEN"
      onCheckoutComplete={(data) => {
        console.log('Payment successful:', data);
      }}
      onCheckoutFail={(error) => {
        console.error('Payment failed:', error);
      }}
    >
      <YourCheckoutScreen />
    </PrimerCheckoutProvider>
  );
}
```

---

## Pre-built CardForm Component

The `CardForm` component provides a complete, pre-styled card payment form with minimal configuration.

### Basic Usage

```tsx
import { CardForm } from '@primer-io/react-native';

function CheckoutScreen() {
  return (
    <CardForm
      onValidationChange={(isValid) => {
        console.log('Form is valid:', isValid);
      }}
    />
  );
}
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onValidationChange` | `(isValid: boolean) => void` | - | Called when validation state changes |
| `onStateChange` | `(state: CardFormState) => void` | - | Called when any form data changes |
| `onValidationError` | `(errors: PrimerError[]) => void` | - | Called when validation errors occur |
| `theme` | `CardFormTheme` | See [Theming](#theming) | Theme configuration |
| `style` | `StyleProp<ViewStyle>` | - | Container style |
| `showCardholderName` | `boolean` | `false` | Show cardholder name field |
| `showSubmitButton` | `boolean` | `true` | Show submit button |
| `submitButtonText` | `string` | `"Pay"` | Submit button text |
| `onSubmit` | `() => void` | - | Custom submit handler |

### Advanced Usage

```tsx
import { CardForm } from '@primer-io/react-native';

function CheckoutScreen() {
  const [isValid, setIsValid] = useState(false);

  return (
    <CardForm
      showCardholderName
      showSubmitButton={false} // Hide built-in button
      onValidationChange={setIsValid}
      onStateChange={(state) => {
        console.log('Card network:', state.metadata?.cardNetwork);
        console.log('Errors:', state.errors);
      }}
      theme={{
        primaryColor: '#0066FF',
        borderRadius: 12,
        fieldHeight: 52,
      }}
    />

    {/* Custom submit button */}
    <TouchableOpacity
      disabled={!isValid}
      onPress={() => {/* your logic */}}
    >
      <Text>Pay Now</Text>
    </TouchableOpacity>
  );
}
```

---

## Individual Input Components

For maximum flexibility, use individual input components to build custom layouts.

### useCardForm Hook

The `useCardForm` hook manages form state, validation, and submission:

```tsx
import { useCardForm } from '@primer-io/react-native';

const cardForm = useCardForm({
  collectCardholderName: true,
  onValidationChange: (isValid, errors) => {
    console.log('Valid:', isValid);
  },
});
```

**Hook Return Values:**

| Property | Type | Description |
|----------|------|-------------|
| `cardNumber` | `string` | Current card number value (formatted with spaces) |
| `expiryDate` | `string` | Current expiry date (MM/YY format) |
| `cvv` | `string` | Current CVV value |
| `cardholderName` | `string` | Current cardholder name |
| `isValid` | `boolean` | Whether the form is valid |
| `errors` | `CardFormErrors` | Validation errors by field |
| `metadata` | `CardMetadata \| null` | Card metadata (network, etc.) |
| `requiredFields` | `PrimerInputElementType[]` | Required fields from SDK |
| `isSubmitting` | `boolean` | Whether form is submitting |
| `updateCardNumber` | `(value: string) => void` | Update card number |
| `updateExpiryDate` | `(value: string) => void` | Update expiry date |
| `updateCVV` | `(value: string) => void` | Update CVV |
| `updateCardholderName` | `(value: string) => void` | Update cardholder name |
| `markFieldTouched` | `(field) => void` | Mark field as touched |
| `submit` | `() => Promise<void>` | Submit the form |
| `reset` | `() => void` | Reset form to initial state |

### CardNumberInput

Card number input with automatic network detection and icon display.

#### Connected Mode (Recommended)

The simplest and most idiomatic way to use the component:

```tsx
import { CardNumberInput, useCardForm } from '@primer-io/react-native';

function CustomForm() {
  const cardForm = useCardForm();

  return (
    <CardNumberInput
      cardForm={cardForm}
      field="cardNumber"
      theme={{
        primaryColor: '#0066FF',
        errorColor: '#FF3B30',
        borderRadius: 8,
      }}
    />
  );
}
```

**Connected Mode Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `cardForm` | `UseCardFormReturn` | Yes | The cardForm object from useCardForm |
| `field` | `'cardNumber'` | Yes | Field identifier |
| `theme` | `InputTheme` | No | Theme configuration |
| `style` | `StyleProp<ViewStyle>` | No | Container style |
| `placeholder` | `string` | No | Placeholder text (default: "1234 5678 9012 3456") |
| `label` | `string` | No | Label text (default: "Card Number") |
| `showLabel` | `boolean` | No | Show label (default: true) |
| `showCardNetworkIcon` | `boolean` | No | Show network icon (default: true) |
| `labelStyle` | `StyleProp<TextStyle>` | No | Label style |
| `inputStyle` | `StyleProp<TextStyle>` | No | Input style |
| `errorStyle` | `StyleProp<TextStyle>` | No | Error text style |
| `testID` | `string` | No | Test ID |

**Key Benefits:**
- Automatically wires up value, onChange, onBlur, error, focus state
- No manual event handler boilerplate
- Type-safe field binding
- Focus state managed internally

#### Manual Mode (Legacy)

For advanced use cases where you need full control:

```tsx
<CardNumberInput
  value={cardForm.cardNumber}
  onChangeText={cardForm.updateCardNumber}
  onBlur={() => cardForm.markFieldTouched('cardNumber')}
  error={cardForm.errors.cardNumber}
  cardNetwork={cardForm.metadata?.cardNetwork}
  theme={{ primaryColor: '#0066FF' }}
/>
```

**Manual Mode Props:**

All props from Connected Mode, plus:

| Prop | Type | Description |
|------|------|-------------|
| `value` | `string` | Current value |
| `onChangeText` | `(value: string) => void` | Change handler |
| `onBlur` | `() => void` | Blur handler |
| `onFocus` | `() => void` | Focus handler |
| `error` | `string` | Error message to display |
| `cardNetwork` | `string` | Detected card network (e.g., "VISA") |
| `isFocused` | `boolean` | Focused state |

### ExpiryDateInput

Expiry date input with automatic MM/YY formatting.

#### Connected Mode (Recommended)

```tsx
import { ExpiryDateInput, useCardForm } from '@primer-io/react-native';

function CustomForm() {
  const cardForm = useCardForm();

  return (
    <ExpiryDateInput
      cardForm={cardForm}
      field="expiryDate"
      theme={{ primaryColor: '#0066FF' }}
    />
  );
}
```

**Props:** Same as `CardNumberInput` Connected Mode, but:
- `field` must be `'expiryDate'`
- No `showCardNetworkIcon` prop
- Default placeholder: `"MM/YY"`
- Default label: `"Expiry Date"`

### CVVInput

CVV input with secure text entry.

#### Connected Mode (Recommended)

```tsx
import { CVVInput, useCardForm } from '@primer-io/react-native';

function CustomForm() {
  const cardForm = useCardForm();

  return (
    <CVVInput
      cardForm={cardForm}
      field="cvv"
      theme={{ primaryColor: '#0066FF' }}
    />
  );
}
```

**Props:** Same as `CardNumberInput` Connected Mode, but:
- `field` must be `'cvv'`
- No `showCardNetworkIcon` prop
- Default placeholder: `"123"`
- Default label: `"CVV"`
- Automatically uses `secureTextEntry`

### CardholderNameInput

Cardholder name input with proper capitalization.

#### Connected Mode (Recommended)

```tsx
import { CardholderNameInput, useCardForm } from '@primer-io/react-native';

function CustomForm() {
  const cardForm = useCardForm({ collectCardholderName: true });

  return (
    <CardholderNameInput
      cardForm={cardForm}
      field="cardholderName"
      theme={{ primaryColor: '#0066FF' }}
    />
  );
}
```

**Props:** Same as `CardNumberInput` Connected Mode, but:
- `field` must be `'cardholderName'`
- No `showCardNetworkIcon` prop
- Default placeholder: `"John Doe"`
- Default label: `"Cardholder Name"`
- Automatically uses `autoCapitalize="words"`

---

## Theming

All components support comprehensive theming through the `theme` prop.

### Theme Interface

```typescript
interface InputTheme {
  // Colors
  primaryColor?: string;        // Focus states (default: '#0066FF')
  errorColor?: string;           // Error states (default: '#FF3B30')
  textColor?: string;            // Input text (default: '#000000')
  placeholderColor?: string;     // Placeholder text (default: '#999999')
  backgroundColor?: string;      // Input background (default: '#FFFFFF')

  // Border
  borderColor?: string;          // Default border (default: '#E0E0E0')
  borderWidth?: number;          // Border thickness (default: 1)
  borderRadius?: number;         // Corner radius (default: 8)
  focusedBorderColor?: string;   // Focused border (default: primaryColor)

  // Typography
  fontSize?: number;             // Font size (default: 16)
  fontFamily?: string;           // Font family

  // Layout
  fieldHeight?: number;          // Field height (default: 48)
  fieldSpacing?: number;         // Spacing between fields (default: 16)
}
```

### Creating a Custom Theme

```tsx
const customTheme: InputTheme = {
  // Brand colors
  primaryColor: '#6366F1',
  errorColor: '#EF4444',

  // Dark theme
  textColor: '#FFFFFF',
  backgroundColor: '#1F2937',
  borderColor: '#374151',
  placeholderColor: '#9CA3AF',

  // Typography
  fontSize: 18,
  fontFamily: 'Inter-Regular',

  // Layout
  fieldHeight: 56,
  fieldSpacing: 20,
  borderRadius: 12,
  borderWidth: 2,
};
```

### Applying Theme

**To CardForm:**

```tsx
<CardForm theme={customTheme} />
```

**To Individual Components:**

```tsx
<CardNumberInput theme={customTheme} />
<ExpiryDateInput theme={customTheme} />
<CVVInput theme={customTheme} />
<CardholderNameInput theme={customTheme} />
```

---

## Examples

### Example 1: Premium Glass Card Design

A modern, visually striking card form with glassmorphism effects, animated borders, and a card preview.

```tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient'; // or expo-linear-gradient
import {
  useCardForm,
  CardNumberInput,
  ExpiryDateInput,
  CVVInput,
  CardholderNameInput,
} from '@primer-io/react-native';

function PremiumCardCheckout() {
  const [showCardBack, setShowCardBack] = useState(false);

  const cardForm = useCardForm({
    collectCardholderName: true,
    onValidationChange: (isValid) => {
      console.log('Form valid:', isValid);
    },
  });

  // Premium glassmorphic theme
  const glassTheme = {
    primaryColor: '#8B5CF6',
    errorColor: '#F87171',
    textColor: '#1F2937',
    placeholderColor: '#9CA3AF',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderColor: 'rgba(139, 92, 246, 0.2)',
    borderWidth: 1.5,
    borderRadius: 16,
    focusedBorderColor: '#8B5CF6',
    fontSize: 16,
    fieldHeight: 56,
  };

  const getCardNetworkColor = () => {
    const network = cardForm.metadata?.cardNetwork?.toLowerCase();
    if (network?.includes('visa')) return ['#1A1F71', '#4A5FD9'];
    if (network?.includes('mastercard')) return ['#EB001B', '#F79E1B'];
    if (network?.includes('amex')) return ['#006FCF', '#00A1E0'];
    return ['#6366F1', '#8B5CF6'];
  };

  return (
    <View style={styles.container}>
      {/* Animated Card Preview */}
      <View style={styles.cardPreviewContainer}>
        <LinearGradient
          colors={getCardNetworkColor()}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardPreview}
        >
          {/* Card Chip */}
          <View style={styles.cardChip} />

          {/* Card Number Display */}
          <Text style={styles.cardPreviewNumber}>
            {cardForm.cardNumber || '•••• •••• •••• ••••'}
          </Text>

          {/* Cardholder and Expiry Row */}
          <View style={styles.cardPreviewFooter}>
            <View style={styles.cardPreviewSection}>
              <Text style={styles.cardPreviewLabel}>CARDHOLDER</Text>
              <Text style={styles.cardPreviewText}>
                {cardForm.cardholderName || 'YOUR NAME'}
              </Text>
            </View>
            <View style={styles.cardPreviewSection}>
              <Text style={styles.cardPreviewLabel}>EXPIRES</Text>
              <Text style={styles.cardPreviewText}>
                {cardForm.expiryDate || 'MM/YY'}
              </Text>
            </View>
          </View>

          {/* Network Logo Area */}
          <View style={styles.cardNetworkBadge}>
            <Text style={styles.cardNetworkText}>
              {cardForm.metadata?.cardNetwork || 'CARD'}
            </Text>
          </View>
        </LinearGradient>
      </View>

      {/* Form Inputs with Glass Effect */}
      <View style={styles.formContainer}>
        <View style={styles.glassPanel}>
          {/* Card Number - Full Width */}
          <CardNumberInput
            cardForm={cardForm}
            field="cardNumber"
            theme={glassTheme}
            label="Card Number"
            style={styles.input}
          />

          {/* Expiry and CVV Row */}
          <View style={styles.row}>
            <ExpiryDateInput
              cardForm={cardForm}
              field="expiryDate"
              theme={glassTheme}
              label="Expiry Date"
              style={styles.halfInput}
            />

            <CVVInput
              cardForm={cardForm}
              field="cvv"
              onFocus={() => setShowCardBack(true)}
              onBlur={() => setShowCardBack(false)}
              theme={glassTheme}
              label="CVV"
              style={styles.halfInput}
            />
          </View>

          {/* Cardholder Name */}
          <CardholderNameInput
            cardForm={cardForm}
            field="cardholderName"
            theme={glassTheme}
            label="Cardholder Name"
            style={styles.input}
          />
        </View>

        {/* Premium Submit Button */}
        <TouchableOpacity
          onPress={cardForm.submit}
          disabled={!cardForm.isValid || cardForm.isSubmitting}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={
              cardForm.isValid
                ? ['#8B5CF6', '#6366F1']
                : ['#E5E7EB', '#D1D5DB']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.submitButton}
          >
            <Text style={styles.submitButtonText}>
              {cardForm.isSubmitting ? 'Processing...' : 'Pay Now'}
            </Text>
            {cardForm.isValid && (
              <View style={styles.lockIcon}>
                <Text style={styles.lockIconText}>🔒</Text>
              </View>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Security Badge */}
        <View style={styles.securityBadge}>
          <Text style={styles.securityText}>
            🛡️ Secured by Primer • PCI DSS Compliant
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 20,
  },
  cardPreviewContainer: {
    marginBottom: 32,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  cardPreview: {
    height: 200,
    borderRadius: 20,
    padding: 24,
    justifyContent: 'space-between',
  },
  cardChip: {
    width: 50,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  cardPreviewNumber: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 2,
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace' }),
  },
  cardPreviewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardPreviewSection: {
    gap: 4,
  },
  cardPreviewLabel: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: 1,
    fontWeight: '600',
  },
  cardPreviewText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  cardNetworkBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  cardNetworkText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  formContainer: {
    gap: 20,
  },
  glassPanel: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 24,
    padding: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  input: {
    // Additional styling if needed
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  submitButton: {
    height: 64,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  lockIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockIconText: {
    fontSize: 16,
  },
  securityBadge: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  securityText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
});
```

**Features Demonstrated:**

- **Live Card Preview**: Displays entered card details in a realistic card design
- **Gradient Backgrounds**: Dynamic card colors based on detected network
- **Glassmorphism**: Semi-transparent panels with backdrop blur effects
- **Animated Focus States**: Visual feedback when fields are focused
- **Card Flip Hint**: Visual cue when CVV is focused
- **Custom Styling**: Shows extensive customization of the input components
- **Premium Submit Button**: Gradient button with lock icon
- **Security Badge**: Builds trust with compliance messaging

### Example 2: Single-Line Card Input

```tsx
import { View, StyleSheet } from 'react-native';
import {
  useCardForm,
  CardNumberInput,
  ExpiryDateInput,
  CVVInput,
} from '@primer-io/react-native';

function CompactCardForm() {
  const cardForm = useCardForm();

  const compactTheme = {
    primaryColor: '#0066FF',
    borderRadius: 8,
    fieldHeight: 44,
    fontSize: 14,
  };

  return (
    <View style={styles.row}>
      <CardNumberInput
        cardForm={cardForm}
        field="cardNumber"
        showLabel={false}
        theme={compactTheme}
        style={styles.cardNumber}
      />

      <ExpiryDateInput
        cardForm={cardForm}
        field="expiryDate"
        showLabel={false}
        theme={compactTheme}
        style={styles.expiry}
      />

      <CVVInput
        cardForm={cardForm}
        field="cvv"
        showLabel={false}
        theme={compactTheme}
        style={styles.cvv}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  cardNumber: {
    flex: 2,
  },
  expiry: {
    flex: 1,
  },
  cvv: {
    flex: 1,
  },
});
```

### Example 3: Neon Cyberpunk Theme

A bold, futuristic design with neon accents, animated glows, and a cyberpunk aesthetic.

```tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import {
  useCardForm,
  CardNumberInput,
  ExpiryDateInput,
  CVVInput,
  CardholderNameInput,
} from '@primer-io/react-native';

function CyberpunkCardCheckout() {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scanlineAnim = useRef(new Animated.Value(0)).current;

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

  return (
    <View style={styles.container}>
      {/* Background Grid */}
      <View style={styles.gridBackground}>
        {[...Array(20)].map((_, i) => (
          <View key={`h-${i}`} style={styles.gridLineH} />
        ))}
        {[...Array(10)].map((_, i) => (
          <View key={`v-${i}`} style={styles.gridLineV} />
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
        onPress={cardForm.submit}
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

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {'>> '} ENCRYPTED CONNECTION • PCI-DSS LEVEL 1 {' <<'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A1E',
    padding: 20,
  },
  gridBackground: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.1,
  },
  gridLineH: {
    height: 1,
    backgroundColor: '#00FFFF',
    marginVertical: 20,
  },
  gridLineV: {
    position: 'absolute',
    width: 1,
    height: '100%',
    backgroundColor: '#00FFFF',
    left: 0,
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
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    shadowColor: '#00FF00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
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
    gap: 16,
  },
  input: {},
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfInput: {
    flex: 1,
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
  },
  executeButtonInner: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
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
  },
  cursorText: {
    fontSize: 20,
    color: '#00FFFF',
    fontWeight: '700',
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: '#00FFFF',
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace' }),
    opacity: 0.6,
  },
});
```

**Features Demonstrated:**

- **Cyberpunk Aesthetic**: Neon cyan/magenta color scheme with sharp edges
- **Animated Background**: Grid pattern and moving scanline effect for terminal feel
- **Digital Card Display**: Futuristic card preview with corner brackets and neon glows
- **Terminal-Style UI**: Monospace fonts, bracket labels, and command-line inspired design
- **Neon Glow Effects**: Text shadows and border glows throughout
- **Dynamic Network Colors**: Different neon colors for each card network
- **Pulse Animations**: Subtle breathing effect on valid forms
- **Status Indicators**: Online status dot and system messages
- **Sci-Fi Typography**: All-caps labels with brackets and arrows
- **Blinking Cursor**: Classic terminal cursor on submit button when ready

### Example 4: Monitoring Card Network

```tsx
import { CardNumberInput, useCardForm } from '@primer-io/react-native';
import { Text } from 'react-native';

function NetworkDetectionExample() {
  const cardForm = useCardForm({
    onMetadataChange: (metadata) => {
      console.log('Card network detected:', metadata.cardNetwork);
      console.log('Is supported:', metadata.isNetworkSupported);
    },
  });

  return (
    <>
      <CardNumberInput
        cardForm={cardForm}
        field="cardNumber"
      />

      {cardForm.metadata?.cardNetwork && (
        <Text>
          Detected: {cardForm.metadata.cardNetwork}
        </Text>
      )}
    </>
  );
}
```

### Example 5: Auto-Advance Between Fields

For advanced features like auto-advancing to the next field, you can use connected mode with custom `onChangeText`:

```tsx
import { useRef } from 'react';
import { TextInput } from 'react-native';
import {
  useCardForm,
  CardNumberInput,
  ExpiryDateInput,
  CVVInput,
} from '@primer-io/react-native';

function AutoAdvanceForm() {
  const cardForm = useCardForm();
  const expiryRef = useRef<TextInput>(null);
  const cvvRef = useRef<TextInput>(null);

  return (
    <>
      <CardNumberInput
        cardForm={cardForm}
        field="cardNumber"
        onChangeText={(value) => {
          cardForm.updateCardNumber(value);
          // Auto-advance when card number is complete (16 digits)
          if (value.replace(/\s/g, '').length === 16) {
            expiryRef.current?.focus();
          }
        }}
      />

      <ExpiryDateInput
        cardForm={cardForm}
        field="expiryDate"
        onChangeText={(value) => {
          cardForm.updateExpiryDate(value);
          // Auto-advance when expiry is complete (MM/YY = 5 chars)
          if (value.length === 5) {
            cvvRef.current?.focus();
          }
        }}
      />

      <CVVInput
        cardForm={cardForm}
        field="cvv"
      />
    </>
  );
}
```

**Note:** Connected mode handles all the wiring, but you can still override individual handlers like `onChangeText`, `onFocus`, or `onBlur` when you need custom behavior.

---

## Best Practices

### 1. Always Use PrimerCheckoutProvider

All components must be wrapped in `PrimerCheckoutProvider`:

```tsx
<PrimerCheckoutProvider clientToken={token}>
  <CardForm />
</PrimerCheckoutProvider>
```

### 2. Mark Fields as Touched

Only show validation errors after user interaction:

```tsx
<CardNumberInput
  onBlur={() => cardForm.markFieldTouched('cardNumber')}
  error={cardForm.errors.cardNumber} // Only shows after touched
/>
```

### 3. Handle Loading States

Show loading indicators during submission:

```tsx
<Button
  title={cardForm.isSubmitting ? 'Processing...' : 'Pay'}
  onPress={cardForm.submit}
  disabled={!cardForm.isValid || cardForm.isSubmitting}
/>
```

### 4. Use Consistent Theming

Define your theme once and reuse it:

```tsx
const theme = {
  primaryColor: '#0066FF',
  borderRadius: 12,
  fieldHeight: 52,
};

// Apply to all components
<CardNumberInput theme={theme} />
<ExpiryDateInput theme={theme} />
<CVVInput theme={theme} />
```

### 5. Respect Required Fields

The SDK determines which fields are required based on your configuration:

```tsx
const { requiredFields } = useCardForm();

// Only render required fields
{requiredFields.includes(PrimerInputElementType.CARDHOLDER_NAME) && (
  <CardholderNameInput {...props} />
)}
```

---

## Troubleshooting

### Card Network Icon Not Showing

The card network icon appears when:
1. A card number is entered
2. The network is detected (metadata.cardNetwork is set)
3. `showCardNetworkIcon` is not set to `false`

If the icon doesn't appear, check that the native SDK assets are available.

### Validation Not Working

Ensure you're:
1. Using components within `PrimerCheckoutProvider`
2. Passing the update handlers from `useCardForm`
3. Marking fields as touched to display errors

### TypeScript Errors

If you see TypeScript errors after updating:
1. Rebuild the library: `yarn build`
2. Restart your TypeScript server
3. Clear your editor's cache

---

## API Reference

For complete type definitions, see:
- `src/models/components/CardFormTypes.ts` - CardForm types
- `src/models/components/InputTheme.ts` - Theme types
- `src/Components/inputs/` - Individual component types
