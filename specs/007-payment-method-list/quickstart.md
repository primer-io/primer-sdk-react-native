# Quickstart: PrimerPaymentMethodList Component

## Basic Usage

```tsx
import { PrimerPaymentMethodList } from '@anthropic/primer-sdk-react-native';

function MethodSelectionScreen() {
  const navigation = useNavigation();

  return (
    <PrimerPaymentMethodList
      onSelect={(method) => {
        navigation.push(CheckoutRoute.cardForm, { paymentMethodType: method.type });
      }}
    />
  );
}
```

## With Filtering

```tsx
<PrimerPaymentMethodList
  include={['PAYMENT_CARD', 'PAYPAL', 'APPLE_PAY']}
  exclude={['GOOGLE_PAY']}
  showCardFirst={false}
  onSelect={handleMethodSelect}
/>
```

## With Expand/Collapse

```tsx
<PrimerPaymentMethodList
  collapsedCount={3}
  onSelect={handleMethodSelect}
/>
```

## Integration in Checkout Sheet Screen

The component renders inside the checkout sheet screen. The sheet screen owns the header and title:

```tsx
function CheckoutSheetContent() {
  const navigation = useNavigation();

  return (
    <View>
      {/* Sheet header: "Pay $99.00" + Cancel — owned by sheet screen */}
      <NavigationHeader title="Pay $99.00" />

      {/* Section title — owned by sheet screen */}
      <Text style={styles.sectionTitle}>Choose payment method</Text>

      {/* Payment method list — the component */}
      <PrimerPaymentMethodList
        onSelect={(method) => {
          navigation.push(CheckoutRoute.cardForm, {
            paymentMethodType: method.type,
          });
        }}
        onLoad={(methods) => {
          console.log(`${methods.length} methods available`);
        }}
      />
    </View>
  );
}
```

## Test Scenarios

### 1. Renders branded buttons
- Mount with 3+ payment methods available
- Verify each method renders as a button with correct logo/colors
- Card should use outlined style, others use color style

### 2. Method selection fires callback + analytics
- Tap a payment method button
- Verify `onSelect` called with correct PaymentMethodItem
- Verify PAYMENT_METHOD_SELECTION analytics event fired

### 3. Surcharge display
- Provide methods with surcharge data
- Verify surcharge amount appears formatted on the button

### 4. Expand/collapse
- Set `collapsedCount={2}` with 5 methods
- Verify only 2 shown + "Show more" toggle
- Tap toggle → all 5 shown + "Show less"

### 5. Loading state
- Render while `isLoading` is true
- Verify loading indicator shown

### 6. Empty state
- Render with 0 payment methods
- Verify empty state (no buttons, no toggle)
