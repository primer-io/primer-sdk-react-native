

import * as React from 'react';
import { View, Text, useColorScheme } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';

const CheckoutScreen = () => {
    const isDarkMode = useColorScheme() === 'dark';

    const backgroundStyle = {
        backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    };

    return (
        <View style={backgroundStyle}>
      <Text>Checkout Screen</Text>
    </View>
    );
};

export default CheckoutScreen;