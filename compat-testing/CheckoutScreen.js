import * as React from 'react';
import {
  Primer,  
  PrimerSettings,
  PrimerCheckoutData
} from '@primer-io/react-native';
import { Text } from 'react-native';

const textStyles = { 
  margin: 36, 
  textAlign: 'center',
  fontSize: 24
};

const textColor = status => ({ color: status === 'Success!' ? 'green' : 'red' })


const CheckoutScreen = (props) => {

  var [status, setStatus] = React.useState();

  const onCheckoutComplete = (checkoutData) => {
    // Perform an action based on the payment creation response
    // ex. show success screen, redirect to order confirmation view, etc.
  };

  React.useEffect(() => {
    const settings = {
      onCheckoutComplete: onCheckoutComplete
    };

    Primer.configure(settings)
      .then(() => {
        // SDK is initialized sucessfully
        setStatus("Success!")
      })
      .catch (err => {
        setStatus("Failure :-(")
      })
  }, []);

  return (
      <Text 
        testID='status'
        style={{ ...textStyles, ...textColor(status) }}
      >{status}</Text>
    );
};

export default CheckoutScreen;