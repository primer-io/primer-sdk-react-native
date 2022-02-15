import React from 'react';
import { Text, View } from 'react-native';
import { styles } from '../styles';
import { useState } from 'react';
import { useEffect } from 'react';
import { createClientSession } from '../api/client-session';
import Checkout from '../components/Checkout';

export const ComponentsScreen = () => {
  const [loading, setLoading] = useState(false);
  const [clientToken, setClientToken] = useState<string | null>();

  useEffect(() => {
    setLoading(true);
    createClientSession('customerId123', {
      order: {
        currency: 'GBP',
        countryCode: 'GB',
      },
    }).then((res) => {
      console.log(res.clientToken);
      setClientToken(res.clientToken);
      setLoading(false);
    });
  }, []);

  return (
    <View style={styles.container}>
      <View style={[styles.frame, styles.column]}>
        {!loading && clientToken && <Checkout clientToken={clientToken} />}
        {loading && <Text>...loading</Text>}
      </View>
    </View>
  );
};

export default ComponentsScreen;
