import React from 'react';
import { StyleSheet, View, Text, Button } from 'react-native';
import { usePrimer } from './usePrimer';

const CLIENT_TOKEN =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhY2Nlc3NUb2tlbiI6IjQ4ZDQ5MWNkLWU0YjEtNDQ0NS1iNGQzLWI1NDliYTAxZjZkOCIsImNvbmZpZ3VyYXRpb25VcmwiOiJodHRwczovL2FwaS5zYW5kYm94LnByaW1lci5pby9jbGllbnQtc2RrL2NvbmZpZ3VyYXRpb24iLCJhbmFseXRpY3NVcmwiOiJodHRwczovL2FuYWx5dGljcy5hcGkuc2FuZGJveC5jb3JlLnByaW1lci5pby9taXhwYW5lbCIsInBheW1lbnRGbG93IjoiUFJFRkVSX1ZBVUxUIiwidGhyZWVEU2VjdXJlSW5pdFVybCI6Imh0dHBzOi8vc29uZ2JpcmRzdGFnLmNhcmRpbmFsY29tbWVyY2UuY29tL2NhcmRpbmFsY3J1aXNlL3YxL3NvbmdiaXJkLmpzIiwidGhyZWVEU2VjdXJlVG9rZW4iOiJleUowZVhBaU9pSktWMVFpTENKaGJHY2lPaUpJVXpJMU5pSjkuZXlKcWRHa2lPaUk1T1dGbFpUZGhOUzB6TTJabUxUUmtZbUl0WVRVek55MDRNemszTlRNNE16RXlNRGtpTENKcFlYUWlPakUyTVRVNE1EZ3lNVE1zSW1semN5STZJalZsWWpWaVlXVmpaVFpsWXpjeU5tVmhOV1ppWVRkbE5TSXNJazl5WjFWdWFYUkpaQ0k2SWpWbFlqVmlZVFF4WkRRNFptSmtOakE0T0RoaU9HVTBOQ0o5LlpQbHk1RDlSOXdPaFlOMXVvNFlTUWhwdG5DbGJlU2x2aG9rdmhGdGUtekkiLCJjb3JlVXJsIjoiaHR0cHM6Ly9hcGkuc2FuZGJveC5wcmltZXIuaW8iLCJwY2lVcmwiOiJodHRwczovL2FwaS5zYW5kYm94LnByaW1lci5pbyIsImVudiI6IlNBTkRCT1gifQ.FHh7sOc6RJV-O6oy0ZTHTnzk4jPbXlXdnokaL8w5VRU';

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
