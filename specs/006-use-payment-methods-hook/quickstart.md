# Quickstart: usePaymentMethods Hook

## Basic Usage

```tsx
import { PrimerCheckoutProvider, usePaymentMethods } from '@primer-io/react-native';

function PaymentMethodPicker() {
  const { paymentMethods, isLoading, selectedMethod, selectMethod } = usePaymentMethods();

  if (isLoading) return <ActivityIndicator />;

  return (
    <FlatList
      data={paymentMethods}
      keyExtractor={(item) => item.type}
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => selectMethod(item)}>
          <Image source={{ uri: item.logo }} />
          <Text>{item.name}</Text>
          {item.surcharge != null && (
            <Text>+{item.surcharge}</Text>
          )}
        </TouchableOpacity>
      )}
    />
  );
}

// Must be inside PrimerCheckoutProvider
function App() {
  return (
    <PrimerCheckoutProvider clientToken="...">
      <PaymentMethodPicker />
    </PrimerCheckoutProvider>
  );
}
```

## Filtering

```tsx
// Only show card and PayPal
const { paymentMethods } = usePaymentMethods({
  include: ['PAYMENT_CARD', 'PAYPAL'],
});

// Show all except Apple Pay
const { paymentMethods } = usePaymentMethods({
  exclude: ['APPLE_PAY'],
});
```

## Sorting

```tsx
// Cards first (default)
const { paymentMethods } = usePaymentMethods({ showCardFirst: true });

// Preserve API order
const { paymentMethods } = usePaymentMethods({ showCardFirst: false });
```

## Selection

```tsx
const { selectedMethod, selectMethod, clearSelection } = usePaymentMethods();

// Select a method
selectMethod(someMethod);

// Clear selection
clearSelection();
```
