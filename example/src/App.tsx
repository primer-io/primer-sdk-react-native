import React from 'react';
import { StyleSheet, View, Text, Button } from 'react-native';
import { usePrimer } from './usePrimer';

const CLIENT_TOKEN =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhY2Nlc3NUb2tlbiI6IjRiMzgwMjY1LTE4YzktNDEyZi1hMDliLTM2MTAxYzdiNjkzMCIsImNvbmZpZ3VyYXRpb25VcmwiOiJodHRwczovL2FwaS5zYW5kYm94LnByaW1lci5pby9jbGllbnQtc2RrL2NvbmZpZ3VyYXRpb24iLCJhbmFseXRpY3NVcmwiOiJodHRwczovL2FuYWx5dGljcy5hcGkuc2FuZGJveC5jb3JlLnByaW1lci5pby9taXhwYW5lbCIsInBheW1lbnRGbG93IjoiUFJFRkVSX1ZBVUxUIiwiY29yZVVybCI6Imh0dHBzOi8vYXBpLnNhbmRib3gucHJpbWVyLmlvIiwicGNpVXJsIjoiaHR0cHM6Ly9hcGkuc2FuZGJveC5wcmltZXIuaW8iLCJlbnYiOiJTQU5EQk9YIiwidGhyZWVEU2VjdXJlSW5pdFVybCI6Imh0dHBzOi8vc29uZ2JpcmRzdGFnLmNhcmRpbmFsY29tbWVyY2UuY29tL2NhcmRpbmFsY3J1aXNlL3YxL3NvbmdiaXJkLmpzIiwidGhyZWVEU2VjdXJlVG9rZW4iOiJleUowZVhBaU9pSktWMVFpTENKaGJHY2lPaUpJVXpJMU5pSjkuZXlKcWRHa2lPaUk0TlRRMU1qZGtNQzFsWVdRekxUUXpaV0V0T0dFM01DMWhPVGs1TW1JNE56ZGpaallpTENKcFlYUWlPakUyTVRZek5qQXpNamdzSW1semN5STZJalZsWWpWaVlXVmpaVFpsWXpjeU5tVmhOV1ppWVRkbE5TSXNJazl5WjFWdWFYUkpaQ0k2SWpWbFlqVmlZVFF4WkRRNFptSmtOakE0T0RoaU9HVTBOQ0o5LkNqTU11RGQ5RUJGTlVjWWhXOWkwQXlpc2NiQzU0V0FhV29OWjlGbkRjdVEifQ.aI5cav1jN6QWjyA88hR7s9ChPhCx3MNMEKTVRP028nA';

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
