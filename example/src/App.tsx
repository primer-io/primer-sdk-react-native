import React from 'react';
import { StyleSheet, View, Text, Button } from 'react-native';
import { PaymentMethod, UXMode } from '@primer-io/react-native';
import { usePrimer } from './usePrimer';

export default function App() {
  const { showCheckout, token } = usePrimer({
    uxMode: UXMode.MANAGE_PAYMENT_METHODS,
    paymentMethods: [PaymentMethod.Card()],
    amount: 1234,
    currency: 'EUR',
    clientToken:
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhY2Nlc3NUb2tlbiI6IjlkYjNhNDgwLWMxNjQtNDU0Ny1iZGRkLWY5NWExOTBkYzk2ZiIsImNvbmZpZ3VyYXRpb25VcmwiOiJodHRwczovL2FwaS5zYW5kYm94LnByaW1lci5pby9jbGllbnQtc2RrL2NvbmZpZ3VyYXRpb24iLCJhbmFseXRpY3NVcmwiOm51bGwsInBheW1lbnRGbG93IjoiREVGQVVMVCIsInRocmVlRFNlY3VyZUluaXRVcmwiOiJodHRwczovL3NvbmdiaXJkc3RhZy5jYXJkaW5hbGNvbW1lcmNlLmNvbS9jYXJkaW5hbGNydWlzZS92MS9zb25nYmlyZC5qcyIsInRocmVlRFNlY3VyZVRva2VuIjoiZXlKMGVYQWlPaUpLVjFRaUxDSmhiR2NpT2lKSVV6STFOaUo5LmV5SnFkR2tpT2lJMVlqY3hZemxpWmkwMU5HSmlMVFEyT1RZdFlqVTBPQzAxWVRBMFlqa3hNV0UxWldNaUxDSnBZWFFpT2pFMk1USXlNREUxTVRBc0ltbHpjeUk2SWpWbFlqVmlZV1ZqWlRabFl6Y3lObVZoTldaaVlUZGxOU0lzSWs5eVoxVnVhWFJKWkNJNklqVmxZalZpWVRReFpEUTRabUprTmpBNE9EaGlPR1UwTkNKOS5WamRQNWpsYlVtel95VHNYcDNXVXYxTk1BSG5KS0xia1VyMVIzUl9NWVg0IiwiY29yZVVybCI6Imh0dHBzOi8vYXBpLnNhbmRib3gucHJpbWVyLmlvIiwicGNpVXJsIjoiaHR0cHM6Ly9hcGkuc2FuZGJveC5wcmltZXIuaW8iLCJlbnYiOiJTQU5EQk9YIn0.kIlp7dJqWjO3rVyMC55Ro0ply08xw1iUYZ5aB3p89Xc',
  });

  return (
    <View style={styles.container}>
      <Text>Result: {token}</Text>
      <View style={styles.button}>
        <Button title="Checkout" onPress={showCheckout}>
          Checkout
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
  button: {
    marginVertical: 10,
  },
});
