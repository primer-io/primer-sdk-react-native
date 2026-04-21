# Quickstart: Card Input Components

## Tier 2 — SDK Components + useCardForm()

```tsx
import {
  PrimerCheckoutProvider,
  useCardForm,
  CardNumberInput,
  ExpiryDateInput,
  CVVInput,
  CardholderNameInput,
} from '@primer-io/react-native';

function CardPaymentForm() {
  const cardForm = useCardForm({ collectCardholderName: true });

  return (
    <View style={{ padding: 16, gap: 12 }}>
      <CardNumberInput cardForm={cardForm} />
      <ExpiryDateInput cardForm={cardForm} />
      <CVVInput cardForm={cardForm} />
      {cardForm.requiredFields.includes('CARDHOLDER_NAME') && (
        <CardholderNameInput cardForm={cardForm} />
      )}

      <TouchableOpacity
        onPress={() => cardForm.submit()}
        disabled={!cardForm.isValid || cardForm.isSubmitting}
      >
        <Text>{cardForm.isSubmitting ? 'Processing...' : 'Pay'}</Text>
      </TouchableOpacity>
    </View>
  );
}

// Wrap in provider (merchant handles client token)
function CheckoutScreen() {
  return (
    <PrimerCheckoutProvider settings={settings} onTokenizeSuccess={handleToken}>
      <CardPaymentForm />
    </PrimerCheckoutProvider>
  );
}
```

## With Custom Theme

```tsx
const customTheme = {
  primaryColor: '#6200EE',
  errorColor: '#B00020',
  borderRadius: 12,
  fieldHeight: 56,
};

<CardNumberInput cardForm={cardForm} theme={customTheme} />
<ExpiryDateInput cardForm={cardForm} theme={customTheme} />
<CVVInput cardForm={cardForm} theme={customTheme} />
```

## With Custom Labels and Placeholders

```tsx
<CardNumberInput
  cardForm={cardForm}
  label="Card Number"
  placeholder="1234 5678 9012 3456"
/>
<ExpiryDateInput
  cardForm={cardForm}
  label="Expiry"
  placeholder="MM/YY"
/>
<CVVInput
  cardForm={cardForm}
  label="Security Code"
  placeholder="123"
/>
```

## Tier 3 — Fully Custom UI (no SDK components)

```tsx
function FullyCustomCardForm() {
  const cardForm = useCardForm();

  return (
    <View>
      <TextInput
        value={cardForm.cardNumber}
        onChangeText={cardForm.updateCardNumber}
        onBlur={() => cardForm.markFieldTouched('cardNumber')}
        keyboardType="number-pad"
      />
      {cardForm.errors.cardNumber && (
        <Text style={{ color: 'red' }}>{cardForm.errors.cardNumber}</Text>
      )}
      {/* ... other fields ... */}
    </View>
  );
}
```
