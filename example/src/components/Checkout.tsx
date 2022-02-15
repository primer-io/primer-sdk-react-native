import React from 'react';
import { View, Text, Button } from 'react-native';
import { Components } from '@primer-io/react-native';

interface CheckoutProps {
  clientToken: string;
}

const Checkout = (props: CheckoutProps) => {
  const {
    loading,
    selectedPaymentMethod,
    selectPaymentMethod,
    paymentMethodToken,
    createPaymentMethodToken,
    validate,
  } = Components.useComponents(props.clientToken);
  const { error } = Components.useError();
  const { configuration } = Components.useConfiguration();

  const renderCheckoutView = () => {
    if (error) {
      return <Text>{error.message}</Text>;
    }

    if (loading) {
      return <Text>Loading...</Text>;
    }

    if (paymentMethodToken) {
      return <Text>Created payment method token.</Text>;
    }

    if (selectedPaymentMethod) {
      console.log(selectedPaymentMethod.inputs);

      return (
        <View>
          {selectedPaymentMethod.inputs.map((i) => {
            return (
              <Components.PrimerInput
                type={i.type}
                placeholder={i.type}
                key={i.type}
                style={{
                  padding: 10,
                  borderRadius: 10,
                  width: 200,
                  marginBottom: 6,
                  backgroundColor: '#ededee',
                  borderColor: i.validationError ? 'red' : 'blue',
                  borderWidth: 0.6,
                }}
                onEndEditing={() => {
                  validate(i.type);
                }}
              />
            );
          })}
          <Button
            title="submit"
            onPress={() => {
              console.log('click');
              createPaymentMethodToken?.();
            }}
          />
        </View>
      );
    }

    if (configuration?.paymentMethods) {
      return configuration?.paymentMethods.map((m, i) => {
        return (
          <Button
            title={m.type}
            onPress={() => {
              console.log('click');
              selectPaymentMethod(m.type);
            }}
            key={i}
          />
        );
      });
    }

    return null;
  };

  return <View>{renderCheckoutView()}</View>;
};

export default Checkout;
