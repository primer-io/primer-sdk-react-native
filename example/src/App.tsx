import React from 'react';
import { StyleSheet, View, Text, Button } from 'react-native';
import { usePrimer } from './usePrimer';

const CLIENT_TOKEN =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhY2Nlc3NUb2tlbiI6IjZkZjVhZjUyLTdjMGEtNDNkZS05NGQyLWI1YmU2NzI5NGRhNCIsImNvbmZpZ3VyYXRpb25VcmwiOiJodHRwczovL2FwaS5zYW5kYm94LnByaW1lci5pby9jbGllbnQtc2RrL2NvbmZpZ3VyYXRpb24iLCJhbmFseXRpY3NVcmwiOiJodHRwczovL2FuYWx5dGljcy5hcGkuc2FuZGJveC5jb3JlLnByaW1lci5pby9taXhwYW5lbCIsInBheW1lbnRGbG93IjoiUFJFRkVSX1ZBVUxUIiwidGhyZWVEU2VjdXJlSW5pdFVybCI6Imh0dHBzOi8vc29uZ2JpcmRzdGFnLmNhcmRpbmFsY29tbWVyY2UuY29tL2NhcmRpbmFsY3J1aXNlL3YxL3NvbmdiaXJkLmpzIiwidGhyZWVEU2VjdXJlVG9rZW4iOiJleUowZVhBaU9pSktWMVFpTENKaGJHY2lPaUpJVXpJMU5pSjkuZXlKcWRHa2lPaUk0Tm1VMU9HUTVOaTFoWWpKbExUUmxNemN0T1RRM1lpMDNOR0kwTkdGaE9URTFNR1FpTENKcFlYUWlPakUyTVRNMU5qSTJNekVzSW1semN5STZJalZsWWpWaVlXVmpaVFpsWXpjeU5tVmhOV1ppWVRkbE5TSXNJazl5WjFWdWFYUkpaQ0k2SWpWbFlqVmlZVFF4WkRRNFptSmtOakE0T0RoaU9HVTBOQ0o5LkRiM2J0UWdjQndQc1RIeGYxcVVCWjR1VkdVaTh6X1c5TDRkSzBIaWlqSUkiLCJjb3JlVXJsIjoiaHR0cHM6Ly9hcGkuc2FuZGJveC5wcmltZXIuaW8iLCJwY2lVcmwiOiJodHRwczovL2FwaS5zYW5kYm94LnByaW1lci5pbyIsImVudiI6IlNBTkRCT1gifQ.Vn81SQDm03JDV2OG_1b3PV5QCRRUPjhhJP4y55zFwfY';

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
