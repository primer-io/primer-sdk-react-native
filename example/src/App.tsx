import React from 'react';
import { StyleSheet, View, Text, Button } from 'react-native';
import { usePrimer } from './usePrimer';

const CLIENT_TOKEN =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhY2Nlc3NUb2tlbiI6IjBkNGFlOTUxLTIzZjctNDhkNS1iNDdhLTdmZmQxNDJhZWM5YiIsImNvbmZpZ3VyYXRpb25VcmwiOiJodHRwczovL2FwaS5zYW5kYm94LnByaW1lci5pby9jbGllbnQtc2RrL2NvbmZpZ3VyYXRpb24iLCJhbmFseXRpY3NVcmwiOm51bGwsInBheW1lbnRGbG93IjoiREVGQVVMVCIsInRocmVlRFNlY3VyZUluaXRVcmwiOiJodHRwczovL3NvbmdiaXJkc3RhZy5jYXJkaW5hbGNvbW1lcmNlLmNvbS9jYXJkaW5hbGNydWlzZS92MS9zb25nYmlyZC5qcyIsInRocmVlRFNlY3VyZVRva2VuIjoiZXlKMGVYQWlPaUpLVjFRaUxDSmhiR2NpT2lKSVV6STFOaUo5LmV5SnFkR2tpT2lJd1pESmpObVF3WkMwMU1HSTJMVFJsWmpJdE9ESmhNaTA0TWpBNVlUTXdNVEppTmpNaUxDSnBZWFFpT2pFMk1USTBNelE1TVRFc0ltbHpjeUk2SWpWbFlqVmlZV1ZqWlRabFl6Y3lObVZoTldaaVlUZGxOU0lzSWs5eVoxVnVhWFJKWkNJNklqVmxZalZpWVRReFpEUTRabUprTmpBNE9EaGlPR1UwTkNKOS5NOTFCdGZrOHM4dXhEblJOb1pSbnNWNndfeEJNcnlMWU9hQl8taDIwbnZrIiwiY29yZVVybCI6Imh0dHBzOi8vYXBpLnNhbmRib3gucHJpbWVyLmlvIiwicGNpVXJsIjoiaHR0cHM6Ly9hcGkuc2FuZGJveC5wcmltZXIuaW8iLCJlbnYiOiJTQU5EQk9YIn0.wkWzwrT7Na3vmJZ44Y8Qz_OG1QjTwDz3Kb1iqC4-y_4';

export default function App() {
  const { showCheckout, token } = usePrimer({
    amount: 1234,
    currency: 'EUR',
    clientToken: CLIENT_TOKEN,
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
