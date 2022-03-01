import React, { useEffect, useState } from 'react';
import {
  PrimerCardNumberEditText,
  PrimerCardholderNameEditText,
  PrimerExpiryEditText,
  PrimerCvvEditText,
  Primer,
} from '@primer-io/react-native';
import { Button, Text, View } from 'react-native';
import { styles } from '../styles';
import { createClientSession } from '../api/client-session';

export const HeadlessCheckoutScreen = () => {
  const [loading, setLoading] = useState(true);
  const [showPaymentMethods, setShowPaymentMethods] = useState(false);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    // fetch client token
    createClientSession('customerId123').then((session) => {
      setLoading(false);
      Primer.headlessCheckout.startHeadlessCheckout(
        session.clientToken,
        (request) => {
          console.log('got request', request);
          switch (request.kind) {
            case 'OnClientSessionSetupSuccessfully':
              setShowPaymentMethods(true);
              break;
            case 'OnError':
              setShowError(true);
              break;
            default:
              break;
          }
        }
      );
    });
  }, []);

  const onPayButtonPressed = () => {
    Primer.headlessCheckout.validate((isValid) => {
      if (!isValid) return;
      Primer.headlessCheckout.tokenize();
    });
  };

  const renderCardForm = () => {
    return (
      <View
        style={{
          flexDirection: 'column',
          justifyContent: 'flex-start',
        }}
      >
        <View style={[styles.row]}>
          <View style={[styles.container, styles.input]}>
            <PrimerCardNumberEditText
              style={{
                width: '100%',
                height: 42,
                backgroundColor: '#eeeeee',
              }}
            />
          </View>
        </View>

        <View style={[styles.row]}>
          <View style={[styles.container, styles.input]}>
            <PrimerExpiryEditText
              style={{
                width: '100%',
                height: 42,
                backgroundColor: '#eeeeee',
              }}
            />
          </View>
          <View style={[styles.container, styles.input]}>
            <PrimerCvvEditText
              style={{
                width: '100%',
                height: 42,
                backgroundColor: '#eeeeee',
              }}
            />
          </View>
        </View>

        <View style={[styles.row]}>
          <View style={[styles.container, styles.input]}>
            <PrimerCardholderNameEditText
              style={{
                width: '100%',
                height: 42,
                backgroundColor: '#eeeeee',
              }}
            />
          </View>
        </View>

        <Button title="Pay" onPress={() => onPayButtonPressed()} />
      </View>
    );
  };

  return (
    <View style={(styles.container, styles.frame)}>
      {showError && <Text>Error!</Text>}
      {loading && !showError && (
        <View>
          <Text>Loading...</Text>
        </View>
      )}
      {!loading && !showError && showPaymentMethods && renderCardForm()}
    </View>
  );
};
