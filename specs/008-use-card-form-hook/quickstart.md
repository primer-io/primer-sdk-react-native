# Quickstart: useCardForm() Hook

## Drop-in usage (inside PrimerCheckoutSheet)

The hook is used internally by the prebuilt CardForm screen. No merchant action needed.

## Custom usage (standalone)

```tsx
import { PrimerCheckoutProvider, useCardForm } from '@primer-io/react-native';

function MyCardForm() {
  const {
    cardNumber, expiryDate, cvv, cardholderName,
    updateCardNumber, updateExpiryDate, updateCVV, updateCardholderName,
    isValid, errors, markFieldTouched,
    submit, isSubmitting,
    binData,
  } = useCardForm({ collectCardholderName: true });

  return (
    <View>
      <TextInput
        value={cardNumber}
        onChangeText={updateCardNumber}
        onBlur={() => markFieldTouched('cardNumber')}
        placeholder="4242 4242 4242 4242"
      />
      {errors.cardNumber && <Text>{errors.cardNumber}</Text>}

      <TextInput
        value={expiryDate}
        onChangeText={updateExpiryDate}
        onBlur={() => markFieldTouched('expiryDate')}
        placeholder="MM/YY"
      />

      <TextInput
        value={cvv}
        onChangeText={updateCVV}
        onBlur={() => markFieldTouched('cvv')}
        placeholder="123"
        secureTextEntry
      />

      <TextInput
        value={cardholderName}
        onChangeText={updateCardholderName}
        onBlur={() => markFieldTouched('cardholderName')}
        placeholder="Name on card"
      />

      {binData?.preferred && <Text>Card: {binData.preferred.displayName}</Text>}

      <Button
        title={isSubmitting ? 'Processing...' : 'Pay'}
        onPress={submit}
        disabled={!isValid || isSubmitting}
      />
    </View>
  );
}

// Wrap in provider
<PrimerCheckoutProvider clientToken={token} settings={settings}>
  <MyCardForm />
</PrimerCheckoutProvider>
```

## Key points

- Hook auto-formats card number (spaces) and expiry (MM/YY)
- Errors only show for fields the user has blurred (touched)
- `submit()` is a no-op if form is invalid or already submitting
- `binData` provides card network detection for brand icons
- Must be inside `PrimerCheckoutProvider` — does NOT require `PrimerCheckoutSheet`
