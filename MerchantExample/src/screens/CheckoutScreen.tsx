

import * as React from 'react';
import { View, Text, useColorScheme, TouchableOpacity } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { styles } from '../styles';

const CheckoutScreen = () => {
    const isDarkMode = useColorScheme() === 'dark';

    const backgroundStyle = {
        backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    };

    return (
        <View style={backgroundStyle}>
            <View style={{flex: 1}}/>
            <TouchableOpacity
                style={{...styles.button, marginHorizontal: 20, marginVertical: 5, backgroundColor: 'black'}}
            >
                <Text
                    style={{...styles.buttonText, color: 'white'}}
                >
                    Apple Pay
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={{...styles.button, marginHorizontal: 20, marginVertical: 5, backgroundColor: 'black'}}
            >
                <Text
                    style={{...styles.buttonText, color: 'white'}}
                >
                    Vault Manager
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={{...styles.button, marginHorizontal: 20, marginBottom: 20, marginTop: 5, backgroundColor: 'black'}}
            >
                <Text
                    style={{...styles.buttonText, color: 'white'}}
                >
                    Universal Checkout
                </Text>
            </TouchableOpacity>
        </View>
    );
};

export default CheckoutScreen;