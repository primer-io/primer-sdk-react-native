

import * as React from 'react';
import { View, Text, useColorScheme, TouchableOpacity } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { IClientSessionRequestBody } from '../models/IClientSessionRequestBody';
import { createClientSession } from '../network/api';
import { styles } from '../styles';

const Button = () => {
    const isDarkMode = useColorScheme() === 'dark';
    const [isLoading, setIsLo] = React.useState<Error | null>(null);

    const backgroundStyle = {
        backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    };

    return (
        <View style={{ flex: 1 }}>
            <TouchableOpacity
                style={{ ...styles.button, marginHorizontal: 20, marginVertical: 5, backgroundColor: 'black' }}
            >
                <Text
                    style={{ ...styles.buttonText, color: 'white' }}
                >
                    Apple Pay
                </Text>
            </TouchableOpacity>
        </View>
    );
};

export default Button;